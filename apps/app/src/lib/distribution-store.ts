import fs from 'node:fs';
import path from 'node:path';
import type {
  DistributionAsset,
  DistributionAssetStatus,
  DistributionAssetType,
  EpisodeDistribution,
} from '@shipshitshow/types';
import { DISTRIBUTION_ASSET_TYPES } from '@shipshitshow/types';
import { get } from '@vercel/blob';

/**
 * Read side of the per-episode distribution checklist (#17).
 *
 * The rollup (#18) shipped first, so this module exists to consume checklist
 * records the moment they appear — from the filesystem in dev and Vercel Blob in
 * production, mirroring `livestreams-store.ts`. It is deliberately read-only:
 * the checklist UI and its write path belong to #17, and keeping the write side
 * out of here leaves that issue a clean surface to land on.
 *
 * Every parse is defensive. A malformed or absent record degrades to `null`, and
 * the rollup renders those surfaces as not-tracked rather than as zeros.
 */

const DATA_DIR =
  process.env.DATA_DIR || path.join(process.cwd(), 'data', 'livestream');
const DISTRIBUTION_FILE = 'distribution.json';
const BLOB_DISTRIBUTION_PREFIX = 'livestream/distribution';

const ASSET_STATUSES: DistributionAssetStatus[] = [
  'pending',
  'published',
  'skipped',
];

function isBlobPersistenceEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function getBlobDistributionPath(date: string): string {
  return `${BLOB_DISTRIBUTION_PREFIX}/${date}.json`;
}

function getFilesystemDistributionPath(date: string): string {
  return path.join(DATA_DIR, date, DISTRIBUTION_FILE);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function parseAsset(value: unknown): DistributionAsset | null {
  if (!isRecord(value)) return null;

  const type = value.type;
  if (
    typeof type !== 'string' ||
    !DISTRIBUTION_ASSET_TYPES.includes(type as DistributionAssetType)
  ) {
    return null;
  }

  const status = value.status;
  const parsedStatus =
    typeof status === 'string' &&
    ASSET_STATUSES.includes(status as DistributionAssetStatus)
      ? (status as DistributionAssetStatus)
      : 'pending';

  return {
    label: asNullableString(value.label),
    publishedAt: asNullableString(value.publishedAt),
    status: parsedStatus,
    type: type as DistributionAssetType,
    url: asNullableString(value.url),
  };
}

function parseDistribution(
  date: string,
  value: unknown,
): EpisodeDistribution | null {
  if (!isRecord(value)) return null;

  const rawAssets = Array.isArray(value.assets) ? value.assets : [];
  const assets = rawAssets
    .map(parseAsset)
    .filter((asset): asset is DistributionAsset => asset !== null);

  if (assets.length === 0) return null;

  return {
    assets,
    date: asNullableString(value.date) ?? date,
    updatedAt: asNullableString(value.updatedAt),
  };
}

function readFilesystemDistribution(date: string): EpisodeDistribution | null {
  try {
    const filePath = getFilesystemDistributionPath(date);
    if (!fs.existsSync(filePath)) return null;

    return parseDistribution(
      date,
      JSON.parse(fs.readFileSync(filePath, 'utf-8')),
    );
  } catch {
    return null;
  }
}

async function readBlobDistribution(
  date: string,
): Promise<EpisodeDistribution | null> {
  if (!isBlobPersistenceEnabled()) return null;

  try {
    const result = await get(getBlobDistributionPath(date), {
      access: 'private',
      useCache: false,
    });
    if (!result || result.statusCode !== 200) return null;

    const text = await new Response(result.stream).text();
    return parseDistribution(date, JSON.parse(text));
  } catch {
    return null;
  }
}

/**
 * Blob wins over the filesystem: the checklist is edited in the dashboard, and
 * those edits land in blob storage while the filesystem copy is seed data.
 */
export async function readEpisodeDistribution(
  date: string,
): Promise<EpisodeDistribution | null> {
  return (await readBlobDistribution(date)) ?? readFilesystemDistribution(date);
}

export async function readEpisodeDistributions(
  dates: string[],
): Promise<Map<string, EpisodeDistribution>> {
  const entries = await Promise.all(
    dates.map(
      async (date) => [date, await readEpisodeDistribution(date)] as const,
    ),
  );

  const byDate = new Map<string, EpisodeDistribution>();
  for (const [date, distribution] of entries) {
    if (distribution) byDate.set(date, distribution);
  }
  return byDate;
}
