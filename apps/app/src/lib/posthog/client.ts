import type { EpisodeUtmClicks, UtmClickCounts } from '@shipshitshow/types';
import { logError } from '@/lib/logger';
import { isEpisodeCampaign } from '@/lib/utm';

/**
 * PostHog is the only automated half of LinkedIn measurement (issue #20).
 *
 * LinkedIn does not expose analytics for posts published from personal
 * profiles, so what the show can actually measure is the click-through: every
 * published link carries `utm_campaign=ep-<NN>-<slug>`, and PostHog counts the
 * pageviews that arrive with it. A campaign spans channels, so the same query
 * returns LinkedIn and X side by side.
 *
 * When credentials are missing or the query fails, the result says so. It never
 * reports zero clicks — an unmeasured episode and an episode nobody clicked are
 * different facts, and only one of them is bad news.
 */

interface PostHogConfig {
  apiKey: string;
  host: string;
  projectId: string;
}

/** PostHog returns positional rows plus a parallel `columns` header. */
interface PostHogQueryResponse {
  results?: unknown;
}

/**
 * Campaign links are published once and clicked for as long as the post lives
 * in a feed. A year of lookback covers the show's entire back catalogue while
 * keeping the scan bounded; older episodes fall outside the window.
 */
const CLICK_LOOKBACK_DAYS = 365;

const REQUEST_TIMEOUT_MS = 15_000;

const DEFAULT_HOST = 'https://eu.posthog.com';

function getPostHogConfig(): PostHogConfig | null {
  const apiKey = process.env.POSTHOG_API_KEY?.trim();
  const projectId = process.env.POSTHOG_PROJECT_ID?.trim();
  if (!apiKey || !projectId) return null;

  const host = (process.env.POSTHOG_HOST?.trim() || DEFAULT_HOST).replace(
    /\/+$/,
    '',
  );

  return { apiKey, host, projectId };
}

/**
 * The campaign is interpolated rather than bound, because PostHog's query API
 * does not document a placeholder syntax. `isEpisodeCampaign` is the guard: it
 * admits only `ep-<digits>-<lowercase-dashed-slug>`, which contains no quote,
 * backslash, or whitespace to break out of the literal with.
 */
function buildClicksQuery(campaign: string): string {
  return `SELECT properties.utm_source AS utm_source, count() AS clicks
FROM events
WHERE event = '$pageview'
  AND properties.utm_campaign = '${campaign}'
  AND properties.utm_source IN ('linkedin', 'x')
  AND timestamp >= now() - INTERVAL ${CLICK_LOOKBACK_DAYS} DAY
GROUP BY utm_source`;
}

function toClickCount(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : 0;
}

/**
 * Maps PostHog's `[[source, clicks], ...]` rows onto the per-channel counts.
 * A source the query did not return simply had no pageviews in the window, so
 * zero here is a measured zero — the caller only reaches this function once
 * PostHog has actually answered.
 */
export function mapCampaignClickRows(results: unknown): UtmClickCounts {
  const counts: UtmClickCounts = { linkedin: 0, total: 0, x: 0 };
  if (!Array.isArray(results)) return counts;

  for (const row of results) {
    if (!Array.isArray(row)) continue;

    const clicks = toClickCount(row[1]);
    if (row[0] === 'linkedin') counts.linkedin += clicks;
    else if (row[0] === 'x') counts.x += clicks;
  }

  counts.total = counts.linkedin + counts.x;
  return counts;
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown PostHog error';
}

/**
 * Counts UTM-tagged pageviews for one episode campaign. Never throws: every
 * failure mode is returned as a status the UI can render honestly.
 */
export async function fetchCampaignClicks(
  campaign: string,
): Promise<EpisodeUtmClicks> {
  const config = getPostHogConfig();
  if (!config) {
    return {
      clicks: null,
      error: null,
      provenance: 'posthog',
      status: 'not_configured',
    };
  }

  if (!isEpisodeCampaign(campaign)) {
    return {
      clicks: null,
      error: `Malformed campaign: ${campaign}`,
      provenance: 'posthog',
      status: 'error',
    };
  }

  try {
    const response = await fetch(
      `${config.host}/api/projects/${encodeURIComponent(config.projectId)}/query/`,
      {
        body: JSON.stringify({
          query: { kind: 'HogQLQuery', query: buildClicksQuery(campaign) },
        }),
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    );

    if (!response.ok) {
      throw new Error(`PostHog query failed (${response.status})`);
    }

    const payload = (await response.json()) as PostHogQueryResponse;

    return {
      clicks: mapCampaignClickRows(payload.results),
      error: null,
      provenance: 'posthog',
      status: 'ok',
    };
  } catch (error) {
    logError('posthog_campaign_clicks_failed', error, { campaign });

    return {
      clicks: null,
      error: toErrorMessage(error),
      provenance: 'posthog',
      status: 'error',
    };
  }
}
