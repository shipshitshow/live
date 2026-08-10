export type DistributionAssetType =
  | 'flagship_video'
  | 'playbook'
  | 'livestream'
  | 'x_post'
  | 'short'
  | 'linkedin_post';

export const DISTRIBUTION_ASSET_TYPES: DistributionAssetType[] = [
  'flagship_video',
  'playbook',
  'livestream',
  'x_post',
  'short',
  'linkedin_post',
];

export type DistributionAssetStatus = 'pending' | 'published' | 'skipped';

export const DISTRIBUTION_ASSET_STATUSES: DistributionAssetStatus[] = [
  'pending',
  'published',
  'skipped',
];

/**
 * Namespace a published URL belongs to. Metric ingestion joins on the URL, so
 * the platform tells a consumer which id to parse out of it (YouTube video id,
 * X status id, LinkedIn activity urn) and which API to ask.
 */
export type DistributionPlatform = 'youtube' | 'x' | 'linkedin' | 'web';

export interface DistributionAssetPlan {
  type: DistributionAssetType;
  /** Singular label; numbered per slot when the plan asks for more than one. */
  label: string;
  slotCount: number;
  platform: DistributionPlatform;
  /** Assets the show does not always produce — a missing one is not a miss. */
  isOptional: boolean;
}

/**
 * The weekly publish set agreed in the 2026-08-10 B2B pivot. Slot counts are
 * defaults: stored assets outside the plan are preserved, so the plan can grow
 * without rewriting saved episodes.
 */
export const DISTRIBUTION_PLAN: DistributionAssetPlan[] = [
  {
    isOptional: false,
    label: 'Flagship video',
    platform: 'youtube',
    slotCount: 1,
    type: 'flagship_video',
  },
  {
    isOptional: false,
    label: 'Playbook',
    platform: 'web',
    slotCount: 1,
    type: 'playbook',
  },
  {
    isOptional: false,
    label: 'Livestream',
    platform: 'youtube',
    slotCount: 1,
    type: 'livestream',
  },
  {
    isOptional: false,
    label: 'X post',
    platform: 'x',
    slotCount: 3,
    type: 'x_post',
  },
  {
    isOptional: true,
    label: 'Short',
    platform: 'youtube',
    slotCount: 5,
    type: 'short',
  },
  {
    isOptional: false,
    label: 'LinkedIn post',
    platform: 'linkedin',
    slotCount: 2,
    type: 'linkedin_post',
  },
];

export interface EpisodeDistributionAsset {
  /** Stable within an episode: `<type>-<1-based slot>`. */
  id: string;
  type: DistributionAssetType;
  label: string;
  platform: DistributionPlatform;
  isOptional: boolean;
  status: DistributionAssetStatus;
  /**
   * Canonical published URL. This is the join key downstream rollups and
   * platform metric ingestion match on — never rewrite it silently.
   */
  url: string | null;
  publishedAt: string | null;
}

export interface EpisodeDistribution {
  /** Stream date (YYYY-MM-DD) — the episode key. */
  date: string;
  assets: EpisodeDistributionAsset[];
  updatedAt: string | null;
}

export interface EpisodeDistributionAssetUpdate {
  status?: DistributionAssetStatus;
  url?: string | null;
}

export interface EpisodeDistributionResponse {
  distribution: EpisodeDistribution;
  /** False when the runtime cannot persist (Vercel without a blob token). */
  isWritable: boolean;
}

export function isDistributionAssetStatus(
  value: unknown,
): value is DistributionAssetStatus {
  return value === 'pending' || value === 'published' || value === 'skipped';
}

export function isDistributionAssetType(
  value: unknown,
): value is DistributionAssetType {
  return DISTRIBUTION_ASSET_TYPES.includes(value as DistributionAssetType);
}
