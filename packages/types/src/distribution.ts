/**
 * Per-episode distribution checklist — the weekly publish system from the
 * 2026-08-10 B2B pivot (issue #17).
 *
 * The checklist UI and its write path land with #17. The per-episode rollup
 * (#18) only ever reads these records, so the shape lives here as the contract
 * between the two: whichever ships first owns the file, the other consumes it.
 *
 * `url` is the join key from an episode to platform metrics — the rollup parses
 * platform IDs out of it rather than storing them separately, so a corrected
 * URL automatically re-points the metrics.
 */

export type DistributionAssetType =
  | 'flagship_video'
  | 'playbook'
  | 'livestream'
  | 'short'
  | 'x_post'
  | 'linkedin_post';

export const DISTRIBUTION_ASSET_TYPES: DistributionAssetType[] = [
  'flagship_video',
  'playbook',
  'livestream',
  'short',
  'x_post',
  'linkedin_post',
];

export type DistributionAssetStatus = 'pending' | 'published' | 'skipped';

export interface DistributionAsset {
  type: DistributionAssetType;
  status: DistributionAssetStatus;
  /** Live URL. Only meaningful once `status` is `published`. */
  url: string | null;
  /** Optional human label, e.g. "Short 2/5". Falls back to the asset type. */
  label: string | null;
  publishedAt: string | null;
}

export interface EpisodeDistribution {
  /** Stream date, `YYYY-MM-DD` — the episode identity across the app. */
  date: string;
  assets: DistributionAsset[];
  updatedAt: string | null;
}
