import fs from 'node:fs';
import path from 'node:path';
import type {
  XApiAvailability,
  XEpisodeMetrics,
  XEpisodeMetricsUpdate,
  XEpisodePost,
  XMetricsEntryMode,
  XPostMetrics,
  XPostTotals,
} from '@shipshitshow/types';
import { X_EPISODE_POST_SLOTS } from '@shipshitshow/types';
import {
  createWritableStorageError,
  isBlobPersistenceEnabled,
  isReadOnlyVercelRuntime,
  putBlobJson,
  readBlobJson,
} from '@/lib/livestreams-blob';
import { getEpisodeXPostsFile } from '@/lib/livestreams-files';
import {
  fetchXPostMetrics,
  hasXCredentials,
  parseXStatusId,
} from '@/lib/social/x';

const BLOB_X_POSTS_PREFIX = 'livestream/x-posts';

const METRIC_KEYS = [
  'impressions',
  'likes',
  'replies',
  'reposts',
  'quotes',
  'bookmarks',
] as const satisfies ReadonlyArray<keyof XPostMetrics>;

const ENGAGEMENT_KEYS = [
  'likes',
  'replies',
  'reposts',
  'quotes',
  'bookmarks',
] as const satisfies ReadonlyArray<keyof XPostMetrics>;

/** Persisted shape. API values are cached so a re-read costs nothing. */
interface StoredXPost {
  id: string;
  url: string | null;
  api_metrics: XPostMetrics | null;
  api_fetched_at: string | null;
  manual_metrics: XPostMetrics | null;
  manual_entered_at: string | null;
}

interface StoredXEpisode {
  posts: StoredXPost[];
  updated_at: string | null;
}

function getBlobXPostsPath(date: string): string {
  return `${BLOB_X_POSTS_PREFIX}/${date}.json`;
}

function emptyMetrics(): XPostMetrics {
  return {
    bookmarks: null,
    impressions: null,
    likes: null,
    quotes: null,
    replies: null,
    reposts: null,
  };
}

function createSlot(index: number): StoredXPost {
  return {
    api_fetched_at: null,
    api_metrics: null,
    id: `post-${index + 1}`,
    manual_entered_at: null,
    manual_metrics: null,
    url: null,
  };
}

/** Coerce untrusted stored/request JSON into a metrics object. */
function normalizeMetrics(value: unknown): XPostMetrics | null {
  if (!value || typeof value !== 'object') return null;

  const source = value as Record<string, unknown>;
  const metrics = emptyMetrics();
  let hasValue = false;

  for (const key of METRIC_KEYS) {
    const raw = source[key];
    const parsed =
      typeof raw === 'number'
        ? raw
        : typeof raw === 'string' && raw.trim() !== ''
          ? Number(raw)
          : null;

    if (parsed !== null && Number.isFinite(parsed) && parsed >= 0) {
      metrics[key] = Math.round(parsed);
      hasValue = true;
    }
  }

  return hasValue ? metrics : null;
}

function normalizeStoredPost(value: unknown, index: number): StoredXPost {
  const slot = createSlot(index);
  if (!value || typeof value !== 'object') return slot;

  const source = value as Record<string, unknown>;
  return {
    api_fetched_at:
      typeof source.api_fetched_at === 'string' ? source.api_fetched_at : null,
    api_metrics: normalizeMetrics(source.api_metrics),
    id: typeof source.id === 'string' && source.id ? source.id : slot.id,
    manual_entered_at:
      typeof source.manual_entered_at === 'string'
        ? source.manual_entered_at
        : null,
    manual_metrics: normalizeMetrics(source.manual_metrics),
    url:
      typeof source.url === 'string' && source.url.trim() ? source.url : null,
  };
}

function normalizeStoredEpisode(value: unknown): StoredXEpisode {
  const source =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};
  const rawPosts = Array.isArray(source.posts) ? source.posts : [];
  const posts = rawPosts.map(normalizeStoredPost);

  for (let index = posts.length; index < X_EPISODE_POST_SLOTS; index++) {
    posts.push(createSlot(index));
  }

  return {
    posts,
    updated_at:
      typeof source.updated_at === 'string' ? source.updated_at : null,
  };
}

async function readStoredEpisode(date: string): Promise<StoredXEpisode> {
  if (isBlobPersistenceEnabled()) {
    const blob = await readBlobJson<unknown>(getBlobXPostsPath(date));
    return normalizeStoredEpisode(blob?.data);
  }

  try {
    const filePath = getEpisodeXPostsFile(date);
    if (!fs.existsSync(filePath)) return normalizeStoredEpisode(null);
    return normalizeStoredEpisode(
      JSON.parse(fs.readFileSync(filePath, 'utf-8')),
    );
  } catch {
    return normalizeStoredEpisode(null);
  }
}

async function writeStoredEpisode(
  date: string,
  episode: StoredXEpisode,
): Promise<void> {
  if (isReadOnlyVercelRuntime()) {
    throw createWritableStorageError();
  }

  if (isBlobPersistenceEnabled()) {
    await putBlobJson(getBlobXPostsPath(date), episode);
    return;
  }

  const filePath = getEpisodeXPostsFile(date);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(episode, null, 2), 'utf-8');
}

/** Best-effort cache write — a read must never fail because storage is locked. */
async function persistQuietly(
  date: string,
  episode: StoredXEpisode,
): Promise<void> {
  try {
    await writeStoredEpisode(date, episode);
  } catch {
    // Read-only runtime or blob outage: metrics still render from memory.
  }
}

/**
 * Merge API and manual values field by field. API wins where it reported a
 * value; manual fills the rest (X omits impressions on some posts). Fields
 * neither source knows stay null — never zero.
 */
function resolveMetrics(
  api: XPostMetrics | null,
  manual: XPostMetrics | null,
): { entryMode: XMetricsEntryMode | null; metrics: XPostMetrics | null } {
  const metrics = emptyMetrics();
  const sources = new Set<'api' | 'manual'>();

  for (const key of METRIC_KEYS) {
    const apiValue = api?.[key] ?? null;
    if (apiValue !== null) {
      metrics[key] = apiValue;
      sources.add('api');
      continue;
    }

    const manualValue = manual?.[key] ?? null;
    if (manualValue !== null) {
      metrics[key] = manualValue;
      sources.add('manual');
    }
  }

  if (sources.size === 0) return { entryMode: null, metrics: null };

  return {
    entryMode:
      sources.size > 1 ? 'mixed' : sources.has('api') ? 'api' : 'manual',
    metrics,
  };
}

function computeTotals(posts: XEpisodePost[]): XPostTotals {
  let impressions: number | null = null;
  let engagements: number | null = null;
  let postsWithMetrics = 0;

  for (const post of posts) {
    if (!post.metrics) continue;
    postsWithMetrics++;

    if (post.metrics.impressions !== null) {
      impressions = (impressions ?? 0) + post.metrics.impressions;
    }

    for (const key of ENGAGEMENT_KEYS) {
      const value = post.metrics[key];
      if (value !== null) engagements = (engagements ?? 0) + value;
    }
  }

  return {
    engagements,
    impressions,
    posts_tracked: posts.filter((post) => post.url).length,
    posts_with_metrics: postsWithMetrics,
  };
}

function computeEpisodeEntryMode(
  posts: XEpisodePost[],
): XMetricsEntryMode | null {
  const modes = new Set(
    posts
      .map((post) => post.entry_mode)
      .filter((mode): mode is XMetricsEntryMode => mode !== null),
  );

  if (modes.size === 0) return null;
  if (modes.size > 1 || modes.has('mixed')) return 'mixed';
  return modes.has('api') ? 'api' : 'manual';
}

function utcDay(iso: string | null): string | null {
  return iso ? iso.slice(0, 10) : null;
}

/**
 * X charges once per resource per UTC day, so a cached read from today is both
 * free to reuse and already the freshest billed value.
 */
function needsApiRefresh(
  post: StoredXPost,
  statusId: string | null,
  force: boolean,
): boolean {
  if (!statusId) return false;
  if (force) return true;
  if (!post.api_metrics) return true;
  return utcDay(post.api_fetched_at) !== new Date().toISOString().slice(0, 10);
}

function toEpisodePost(
  post: StoredXPost,
  statusId: string | null,
  error: string | null,
): XEpisodePost {
  const { entryMode, metrics } = resolveMetrics(
    post.api_metrics,
    post.manual_metrics,
  );

  return {
    api_fetched_at: post.api_fetched_at,
    api_metrics: post.api_metrics,
    entry_mode: entryMode,
    error,
    id: post.id,
    manual_entered_at: post.manual_entered_at,
    manual_metrics: post.manual_metrics,
    metrics,
    status_id: statusId,
    url: post.url,
  };
}

function buildEpisodeMetrics(
  date: string,
  episode: StoredXEpisode,
  statusIds: Map<string, string | null>,
  postErrors: Map<string, string>,
  availability: XApiAvailability,
): XEpisodeMetrics {
  const posts = episode.posts.map((post) => {
    const statusId = statusIds.get(post.id) ?? null;
    const error =
      (statusId ? postErrors.get(statusId) : null) ??
      (post.url && !statusId
        ? 'Could not read a post id from this URL.'
        : null);
    return toEpisodePost(post, statusId, error);
  });

  return {
    api: availability,
    date,
    entry_mode: computeEpisodeEntryMode(posts),
    posts,
    totals: computeTotals(posts),
    updated_at: episode.updated_at,
  };
}

export interface EpisodeXMetricsOptions {
  /** Re-read every post from the X API, ignoring the same-UTC-day cache. */
  refresh?: boolean;
}

/**
 * Build the X rollup for several episodes in one pass — every stale post across
 * every date goes out in a single batched lookup.
 */
export async function listEpisodeXMetrics(
  dates: string[],
  options: EpisodeXMetricsOptions = {},
): Promise<XEpisodeMetrics[]> {
  const force = options.refresh === true;
  const episodes = await Promise.all(
    dates.map(async (date) => ({
      date,
      statusIds: new Map<string, string | null>(),
      stored: await readStoredEpisode(date),
    })),
  );

  const staleIds = new Set<string>();
  for (const episode of episodes) {
    for (const post of episode.stored.posts) {
      const statusId = parseXStatusId(post.url);
      episode.statusIds.set(post.id, statusId);
      if (needsApiRefresh(post, statusId, force) && statusId) {
        staleIds.add(statusId);
      }
    }
  }

  const availability: XApiAvailability = {
    configured: hasXCredentials(),
    error: null,
    reachable: false,
  };
  const postErrors = new Map<string, string>();

  if (staleIds.size > 0) {
    const lookup = await fetchXPostMetrics(Array.from(staleIds));
    availability.configured = lookup.availability.configured;
    availability.error = lookup.availability.error;
    availability.reachable = lookup.availability.reachable;

    for (const [statusId, message] of lookup.postErrors) {
      postErrors.set(statusId, message);
    }

    const fetchedAt = new Date().toISOString();
    for (const episode of episodes) {
      let changed = false;

      for (const post of episode.stored.posts) {
        const statusId = episode.statusIds.get(post.id);
        const metrics = statusId ? lookup.metrics.get(statusId) : undefined;
        if (!metrics) continue;

        post.api_metrics = metrics;
        post.api_fetched_at = fetchedAt;
        changed = true;
      }

      if (changed) {
        episode.stored.updated_at = fetchedAt;
        await persistQuietly(episode.date, episode.stored);
      }
    }
  }

  return episodes.map((episode) =>
    buildEpisodeMetrics(
      episode.date,
      episode.stored,
      episode.statusIds,
      postErrors,
      availability,
    ),
  );
}

export async function getEpisodeXMetrics(
  date: string,
  options: EpisodeXMetricsOptions = {},
): Promise<XEpisodeMetrics> {
  const [episode] = await listEpisodeXMetrics([date], options);
  return episode;
}

/**
 * Save post URLs and manually entered metrics. Manual values are stored
 * separately from API values so a later successful fetch never silently
 * overwrites what a human typed.
 */
export async function saveEpisodeXPosts(
  date: string,
  update: XEpisodeMetricsUpdate,
): Promise<XEpisodeMetrics> {
  const stored = await readStoredEpisode(date);
  const now = new Date().toISOString();

  for (const input of update.posts) {
    let post = stored.posts.find((candidate) => candidate.id === input.id);
    if (!post) {
      post = createSlot(stored.posts.length);
      post.id = input.id;
      stored.posts.push(post);
    }

    if (input.url !== undefined) {
      const nextUrl = input.url?.trim() || null;
      if (nextUrl !== post.url) {
        // A different post means the cached API metrics no longer describe it.
        post.api_metrics = null;
        post.api_fetched_at = null;
      }
      post.url = nextUrl;
    }

    if (input.manual_metrics !== undefined) {
      const metrics = normalizeMetrics(input.manual_metrics);
      post.manual_metrics = metrics;
      post.manual_entered_at = metrics ? now : null;
    }
  }

  stored.updated_at = now;
  await writeStoredEpisode(date, stored);

  return getEpisodeXMetrics(date);
}
