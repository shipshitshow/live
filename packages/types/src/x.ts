/**
 * Per-episode X (Twitter) author-post metrics.
 *
 * The B2B publish system ships three author posts from @shipshitdev per
 * episode. Metrics come either from the X API (app-only bearer token) or from
 * manual entry when the API is unavailable — the source is always recorded so
 * the dashboard can show how a number got there. Unknown values stay `null`;
 * they are never defaulted to zero.
 */

/** Author posts published per episode under the B2B publish system. */
export const X_EPISODE_POST_SLOTS = 3;

/**
 * Where a post's metrics came from. `mixed` means some fields were fetched and
 * others were typed in (e.g. the API returned engagement but no impressions).
 */
export type XMetricsEntryMode = 'api' | 'manual' | 'mixed';

/**
 * Public metrics for a single post. `null` means "not reported" — the API
 * omitted it and nobody entered it by hand.
 */
export interface XPostMetrics {
  impressions: number | null;
  likes: number | null;
  replies: number | null;
  reposts: number | null;
  quotes: number | null;
  bookmarks: number | null;
}

/** One author-post slot for an episode. */
export interface XEpisodePost {
  /** Stable slot id within the episode (`post-1` … `post-N`). */
  id: string;
  /** Published post URL, sourced from the episode distribution checklist. */
  url: string | null;
  /** Numeric status id parsed from `url`; null when absent or unparseable. */
  status_id: string | null;
  /** Resolved metrics: API values where present, manual values otherwise. */
  metrics: XPostMetrics | null;
  /** Values as returned by the X API, before manual fields fill the gaps. */
  api_metrics: XPostMetrics | null;
  /**
   * Hand-entered values exactly as stored, kept separate from `metrics` so the
   * editor can prefill its inputs without re-saving API values as manual ones.
   */
  manual_metrics: XPostMetrics | null;
  /** How `metrics` was assembled; null when nothing is tracked yet. */
  entry_mode: XMetricsEntryMode | null;
  /** ISO timestamp of the last successful API read. */
  api_fetched_at: string | null;
  /** ISO timestamp of the last manual entry. */
  manual_entered_at: string | null;
  /** Last API error for this post (deleted post, auth failure, …). */
  error: string | null;
}

/** Episode totals across every tracked post. `null` when nothing is known. */
export interface XPostTotals {
  impressions: number | null;
  /** likes + replies + reposts + quotes + bookmarks. */
  engagements: number | null;
  posts_tracked: number;
  posts_with_metrics: number;
}

/** Whether the X API can serve metrics right now. */
export interface XApiAvailability {
  /** `X_BEARER_TOKEN` is set. */
  configured: boolean;
  /** The last request succeeded. */
  reachable: boolean;
  error: string | null;
}

/** Per-episode X rollup — the unit the analytics rollup consumes. */
export interface XEpisodeMetrics {
  date: string;
  posts: XEpisodePost[];
  totals: XPostTotals;
  /** Episode-level entry mode across posts that have metrics. */
  entry_mode: XMetricsEntryMode | null;
  api: XApiAvailability;
  updated_at: string | null;
}

/** Partial update for one post slot. */
export interface XEpisodePostInput {
  id: string;
  url?: string | null;
  manual_metrics?: Partial<XPostMetrics> | null;
}

export interface XEpisodeMetricsUpdate {
  posts: XEpisodePostInput[];
}
