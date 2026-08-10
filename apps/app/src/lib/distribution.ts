import type {
  DistributionPlatform,
  EpisodeDistribution,
  EpisodeDistributionAsset,
} from '@shipshitshow/types';

// Kept dependency-free on purpose: this module runs in the browser (checklist
// panel) as well as on the server (metric rollups), so it cannot pull in
// `livestreams-youtube`, which reaches into the filesystem-backed token store.
const YOUTUBE_ID_PATTERNS = [
  /[?&]v=([\w-]+)/,
  /youtube\.com\/live\/([\w-]+)/,
  /youtube\.com\/shorts\/([\w-]+)/,
  /youtu\.be\/([\w-]+)/,
];
const X_STATUS_PATTERN = /(?:twitter\.com|x\.com)\/[\w.]+\/status\/(\d+)/;
const LINKEDIN_ACTIVITY_PATTERN = /activity[:-](\d+)/;

export interface DistributionSummary {
  published: number;
  skipped: number;
  pending: number;
  /** Plan slots that are not optional — the bar an episode is measured against. */
  required: number;
  requiredPublished: number;
}

/**
 * The id a platform's metrics API keys on, parsed out of the published URL.
 * This is what the per-episode rollup joins against, so a URL that cannot be
 * parsed yields `null` rather than a guess.
 */
export interface DistributionAssetRef {
  platform: DistributionPlatform;
  externalId: string | null;
  url: string;
}

export function normalizeDistributionUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return trimmed;
  } catch {
    return null;
  }
}

export function isValidDistributionUrl(value: string): boolean {
  return normalizeDistributionUrl(value) !== null;
}

function parseExternalId(
  platform: DistributionPlatform,
  url: string,
): string | null {
  switch (platform) {
    case 'youtube':
      for (const pattern of YOUTUBE_ID_PATTERNS) {
        const match = url.match(pattern);
        if (match) return match[1];
      }
      return null;
    case 'x':
      return url.match(X_STATUS_PATTERN)?.[1] ?? null;
    case 'linkedin':
      return url.match(LINKEDIN_ACTIVITY_PATTERN)?.[1] ?? null;
    default:
      return null;
  }
}

export function resolveAssetRef(
  asset: EpisodeDistributionAsset,
): DistributionAssetRef | null {
  if (asset.status !== 'published' || !asset.url) return null;

  return {
    externalId: parseExternalId(asset.platform, asset.url),
    platform: asset.platform,
    url: asset.url,
  };
}

/** Published asset refs for one episode, keyed for downstream metric joins. */
export function resolveEpisodeAssetRefs(
  distribution: EpisodeDistribution,
): DistributionAssetRef[] {
  return distribution.assets
    .map(resolveAssetRef)
    .filter((ref): ref is DistributionAssetRef => ref !== null);
}

export function summarizeDistribution(
  distribution: EpisodeDistribution,
): DistributionSummary {
  return distribution.assets.reduce<DistributionSummary>(
    (summary, asset) => {
      if (asset.status === 'published') summary.published += 1;
      if (asset.status === 'skipped') summary.skipped += 1;
      if (asset.status === 'pending') summary.pending += 1;

      if (!asset.isOptional) {
        summary.required += 1;
        if (asset.status === 'published') summary.requiredPublished += 1;
      }

      return summary;
    },
    {
      pending: 0,
      published: 0,
      required: 0,
      requiredPublished: 0,
      skipped: 0,
    },
  );
}
