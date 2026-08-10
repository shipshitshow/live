import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {
  LinkedInAuthor,
  LinkedInPostEntry,
  LinkedInPostMetrics,
} from '@shipshitshow/types';
import { LINKEDIN_AUTHORS } from '@shipshitshow/types';
import {
  createWritableStorageError,
  isBlobPersistenceEnabled,
  isReadOnlyVercelRuntime,
  putBlobJson,
  readBlobJson,
} from '@/lib/blob-storage';

/**
 * Manually entered LinkedIn post metrics, one record per episode date.
 *
 * These are typed in by a human off the LinkedIn post UI because the API does
 * not expose personal-profile post analytics (issue #20). Nothing here is ever
 * inferred, defaulted to zero, or carried over from another entry: an
 * unrecorded metric stays `null` so the UI can say "not recorded" instead of
 * showing a number nobody read off the platform.
 */

const DATA_DIR =
  process.env.DATA_DIR || path.join(process.cwd(), 'data', 'livestream');
const BLOB_LINKEDIN_POSTS_PREFIX = 'livestream/linkedin-posts';
const POSTS_FILE_NAME = 'linkedin-posts.json';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface StoredLinkedInPosts {
  posts: LinkedInPostEntry[];
}

export function isLivestreamDate(value: string): boolean {
  return DATE_PATTERN.test(value);
}

function getBlobPostsPath(date: string): string {
  return `${BLOB_LINKEDIN_POSTS_PREFIX}/${date}.json`;
}

function getFilesystemPostsPath(date: string): string {
  return path.join(DATA_DIR, date, POSTS_FILE_NAME);
}

function isLinkedInAuthor(value: unknown): value is LinkedInAuthor {
  return (
    typeof value === 'string' &&
    LINKEDIN_AUTHORS.includes(value as LinkedInAuthor)
  );
}

/** LinkedIn post permalinks only — anything else is a mis-paste, not a post. */
function normalizePostUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  let parsed: URL;
  try {
    parsed = new URL(value.trim());
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:') return null;
  if (
    parsed.hostname !== 'linkedin.com' &&
    !parsed.hostname.endsWith('.linkedin.com')
  ) {
    return null;
  }

  return parsed.toString();
}

/**
 * A metric is either a non-negative whole number somebody read off LinkedIn,
 * or `null`. Blank input, junk, and negatives all collapse to `null` rather
 * than to zero — "not recorded" and "zero impressions" are different facts.
 */
function normalizeMetric(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;

  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function normalizeMetrics(value: unknown): LinkedInPostMetrics {
  const raw = (value ?? {}) as Record<string, unknown>;

  return {
    comments: normalizeMetric(raw.comments),
    impressions: normalizeMetric(raw.impressions),
    reactions: normalizeMetric(raw.reactions),
  };
}

function normalizePublishedOn(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return DATE_PATTERN.test(trimmed) ? trimmed : null;
}

function hasAnyMetric(metrics: LinkedInPostMetrics): boolean {
  return (
    metrics.comments !== null ||
    metrics.impressions !== null ||
    metrics.reactions !== null
  );
}

function haveMetricsChanged(
  next: LinkedInPostMetrics,
  previous: LinkedInPostMetrics | undefined,
): boolean {
  if (!previous) return true;
  return (
    next.comments !== previous.comments ||
    next.impressions !== previous.impressions ||
    next.reactions !== previous.reactions
  );
}

/**
 * `metricsRecordedAt` is stamped by the server, only when the numbers actually
 * change, so the timestamp reflects when a human last read them off LinkedIn
 * rather than when the form was last submitted.
 */
function resolveRecordedAt(
  metrics: LinkedInPostMetrics,
  previous: LinkedInPostEntry | undefined,
  now: string,
): string | null {
  if (!hasAnyMetric(metrics)) return null;
  if (haveMetricsChanged(metrics, previous?.metrics)) return now;
  return previous?.metricsRecordedAt ?? now;
}

interface PostShape {
  author: LinkedInAuthor;
  id: string;
  metrics: LinkedInPostMetrics;
  postUrl: string;
  publishedOn: string | null;
}

/** The fields shared by the read and write paths. Null means "unusable entry". */
function parsePostShape(raw: unknown): PostShape | null {
  if (typeof raw !== 'object' || raw === null) return null;

  const candidate = raw as Record<string, unknown>;
  const postUrl = normalizePostUrl(candidate.postUrl);
  if (!postUrl || !isLinkedInAuthor(candidate.author)) return null;

  return {
    author: candidate.author,
    id:
      typeof candidate.id === 'string' && /^[\w-]{1,64}$/.test(candidate.id)
        ? candidate.id
        : randomUUID(),
    metrics: normalizeMetrics(candidate.metrics),
    postUrl,
    publishedOn: normalizePublishedOn(candidate.publishedOn),
  };
}

function normalizeRecordedAt(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/**
 * Read path: validates persisted entries without touching `metricsRecordedAt`,
 * which records when a human last read the numbers off LinkedIn and must
 * survive every read.
 */
export function parseStoredLinkedInPosts(input: unknown): LinkedInPostEntry[] {
  if (!Array.isArray(input)) return [];

  return input.flatMap((raw): LinkedInPostEntry[] => {
    const shape = parsePostShape(raw);
    if (!shape) return [];

    const recordedAt = hasAnyMetric(shape.metrics)
      ? normalizeRecordedAt((raw as Record<string, unknown>).metricsRecordedAt)
      : null;

    return [
      { ...shape, metricsProvenance: 'manual', metricsRecordedAt: recordedAt },
    ];
  });
}

/**
 * Positions in a submitted payload that would be dropped by the write path —
 * a mis-pasted URL or an unknown author. Callers reject the whole request
 * instead of writing a silently shortened list, so a typo surfaces as an error
 * rather than as a row that vanishes on save.
 */
export function findInvalidLinkedInPostIndexes(input: unknown): number[] {
  if (!Array.isArray(input)) return [];

  return input.flatMap((raw, index) => (parsePostShape(raw) ? [] : [index]));
}

/**
 * Write path: accepts the untrusted request payload and returns only entries
 * that are fully valid. `metricsProvenance` is forced to `manual` — v1 has no
 * LinkedIn API ingestion, so a client cannot claim a number came from one.
 */
export function normalizeLinkedInPosts(
  input: unknown,
  existing: LinkedInPostEntry[],
  now: string,
): LinkedInPostEntry[] {
  if (!Array.isArray(input)) return [];

  const previousById = new Map(existing.map((entry) => [entry.id, entry]));

  return input.flatMap((raw): LinkedInPostEntry[] => {
    const shape = parsePostShape(raw);
    if (!shape) return [];

    return [
      {
        ...shape,
        metricsProvenance: 'manual',
        metricsRecordedAt: resolveRecordedAt(
          shape.metrics,
          previousById.get(shape.id),
          now,
        ),
      },
    ];
  });
}

function readFilesystemPosts(date: string): LinkedInPostEntry[] {
  const filePath = getFilesystemPostsPath(date);
  if (!fs.existsSync(filePath)) return [];

  try {
    const stored = JSON.parse(
      fs.readFileSync(filePath, 'utf-8'),
    ) as StoredLinkedInPosts;
    return parseStoredLinkedInPosts(stored.posts);
  } catch {
    return [];
  }
}

export async function readLinkedInPosts(
  date: string,
): Promise<LinkedInPostEntry[]> {
  if (!isBlobPersistenceEnabled()) return readFilesystemPosts(date);

  const stored = await readBlobJson<StoredLinkedInPosts>(
    getBlobPostsPath(date),
  );
  if (!stored) return [];

  return parseStoredLinkedInPosts(stored.data.posts);
}

export async function saveLinkedInPosts(
  date: string,
  input: unknown,
): Promise<LinkedInPostEntry[]> {
  if (isReadOnlyVercelRuntime()) {
    throw createWritableStorageError();
  }

  const existing = await readLinkedInPosts(date);
  const posts = normalizeLinkedInPosts(
    input,
    existing,
    new Date().toISOString(),
  );

  if (!isBlobPersistenceEnabled()) {
    const filePath = getFilesystemPostsPath(date);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(
      filePath,
      `${JSON.stringify({ posts } satisfies StoredLinkedInPosts, null, 2)}\n`,
      'utf-8',
    );
    return posts;
  }

  await putBlobJson(getBlobPostsPath(date), {
    posts,
  } satisfies StoredLinkedInPosts);

  return posts;
}
