/**
 * LinkedIn distribution measurement (issue #20).
 *
 * LinkedIn's API does not expose analytics for posts published from personal
 * profiles — Marketing / Community Management APIs cover organization pages
 * only, behind an approval process. The show posts from Vincent's and
 * Mitchell's personal profiles, so v1 measures what we control: UTM-tagged
 * links read back from PostHog, plus post metrics copied by hand off the
 * LinkedIn UI. Provenance is carried on every metric so a manually entered
 * number is never mistaken for an API-sourced one.
 */

/**
 * Channels that share an episode campaign. The campaign value identifies the
 * episode; `utm_source` identifies the channel it was published to.
 */
export type UtmSource = 'linkedin' | 'x';

export const UTM_SOURCES: UtmSource[] = ['linkedin', 'x'];

/** Every social link the show publishes uses the same medium. */
export const UTM_MEDIUM = 'social';

/** `ep-24-quota-endgame-and-the-272k-tripwire` split into its parts. */
export interface EpisodeCampaign {
  campaign: string;
  episodeNumber: number;
  slug: string;
}

/**
 * How a metric reached the app. `manual` is typed in by a human off the
 * platform UI; `api` came from a platform API. v1 LinkedIn post metrics are
 * always `manual` — see the file header.
 */
export type MetricProvenance = 'api' | 'manual';

/** Personal profiles the show publishes from. */
export type LinkedInAuthor = 'mitchell' | 'vincent';

export const LINKEDIN_AUTHORS: LinkedInAuthor[] = ['mitchell', 'vincent'];

/**
 * Metrics read off the LinkedIn post UI. `null` means "not recorded yet" and
 * must render as such — never as zero.
 */
export interface LinkedInPostMetrics {
  comments: number | null;
  impressions: number | null;
  reactions: number | null;
}

export interface LinkedInPostEntry {
  author: LinkedInAuthor;
  id: string;
  metrics: LinkedInPostMetrics;
  /** Always `manual` in v1; the field exists so API ingestion can land later. */
  metricsProvenance: MetricProvenance;
  /** ISO timestamp of the last manual entry, or null if never recorded. */
  metricsRecordedAt: string | null;
  /** ISO date (YYYY-MM-DD) the post went live, or null if not recorded. */
  publishedOn: string | null;
  postUrl: string;
}

export interface UtmClickCounts {
  linkedin: number;
  total: number;
  x: number;
}

/**
 * `not_configured` — no PostHog credentials, so clicks are unknown.
 * `no_campaign` — the episode has no episode number, so no campaign exists.
 * `error` — PostHog was reachable but the query failed.
 * `ok` — `clicks` is real data, and a zero there means a measured zero.
 */
export type UtmClickStatus = 'error' | 'no_campaign' | 'not_configured' | 'ok';

export interface EpisodeUtmClicks {
  clicks: UtmClickCounts | null;
  error: string | null;
  /** PostHog-sourced, so never manual. */
  provenance: 'posthog';
  status: UtmClickStatus;
}

export interface EpisodeLinkedInMeasurement {
  campaign: string | null;
  date: string;
  episodeNumber: number | null;
  posts: LinkedInPostEntry[];
  utmClicks: EpisodeUtmClicks;
}

export interface LinkedInPostsUpdate {
  posts: LinkedInPostEntry[];
}
