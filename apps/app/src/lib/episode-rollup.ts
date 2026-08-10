import type {
  DistributionAsset,
  DistributionAssetType,
  EpisodeAssetLink,
  EpisodeDistribution,
  EpisodeMetric,
  EpisodeRollupResponse,
  EpisodeRollupRow,
  NotTrackedReason,
} from '@shipshitshow/types';
import { todayLocalDate } from '@/lib/date';
import { readEpisodeDistributions } from '@/lib/distribution-store';
import {
  type LivestreamArchiveItem,
  listLivestreamArchive,
} from '@/lib/livestreams-store';
import { extractVideoId } from '@/lib/livestreams-youtube';
import {
  fetchVideoReachMetrics,
  fetchVideoRetentionMetrics,
  fetchVideosByIds,
} from '@/lib/youtube/client';
import {
  getAccessToken,
  getChannelConfigs,
  hasYouTubeCredentials,
} from '@/lib/youtube/token';

/**
 * Builds the per-episode cross-platform rollup (#18).
 *
 * Rows are episodes; columns are the surfaces of the weekly publish system.
 * Published-asset URLs from the distribution checklist (#17) are the join key —
 * YouTube video IDs are parsed back out of them and matched against the Data and
 * Analytics APIs.
 *
 * Only YouTube-backed columns can report numbers today. X, LinkedIn and leads
 * stay not-tracked until their ingestion issues land, and per epic #9 that state
 * is reported honestly rather than rendered as zero.
 */

/** An asset the checklist marks as live, narrowed so `url` is non-null. */
type PublishedAsset = DistributionAsset & { url: string };

interface YouTubeVideoMetrics {
  views: number;
  /** Percentage, e.g. `8.3`. Null when the Analytics API reported nothing. */
  ctr: number | null;
  avgViewPercentage: number | null;
}

const ASSET_LABELS: Record<DistributionAssetType, string> = {
  flagship_video: 'Flagship video',
  linkedin_post: 'LinkedIn post',
  livestream: 'Livestream',
  playbook: 'Playbook',
  short: 'Short',
  x_post: 'X post',
};

function tracked(value: number): EpisodeMetric {
  return { state: 'tracked', value };
}

function notTracked(reason: NotTrackedReason): EpisodeMetric {
  return { reason, state: 'not_tracked' };
}

function getPublishedAssets(
  distribution: EpisodeDistribution | undefined,
  type: DistributionAssetType,
): PublishedAsset[] {
  return (distribution?.assets ?? []).filter(
    (asset): asset is PublishedAsset =>
      asset.type === type && asset.status === 'published' && asset.url !== null,
  );
}

function toAssetLinks(assets: PublishedAsset[]): EpisodeAssetLink[] {
  return assets.map((asset, index) => ({
    label:
      asset.label ??
      (assets.length > 1
        ? `${ASSET_LABELS[asset.type]} ${index + 1}`
        : ASSET_LABELS[asset.type]),
    url: asset.url,
  }));
}

/**
 * The single place that decides why a cell has no number, so the distinction
 * between "nothing published", "nothing recorded", "we can't measure this
 * surface" and "the platform had nothing to say" is made once and consistently.
 */
function resolveNotTrackedReason(
  hasChecklist: boolean,
  assetCount: number,
  isIngestionAvailable: boolean,
): NotTrackedReason {
  if (assetCount === 0) return hasChecklist ? 'no_asset' : 'no_checklist';
  if (!isIngestionAvailable) return 'no_integration';
  return 'no_data';
}

/**
 * Resolve one YouTube-backed number. `metrics` being undefined means the video
 * never resolved at all, which is a different story from the video resolving but
 * the Analytics API withholding that particular figure.
 */
function resolveYouTubeMetric(
  metrics: YouTubeVideoMetrics | undefined,
  select: (metrics: YouTubeVideoMetrics) => number | null,
  notTrackedFallback: NotTrackedReason,
): EpisodeMetric {
  if (!metrics) return notTracked(notTrackedFallback);

  const value = select(metrics);
  return value === null ? notTracked('no_data') : tracked(value);
}

function collectVideoIds(assets: PublishedAsset[]): string[] {
  return assets
    .map((asset) => extractVideoId(asset.url))
    .filter((id): id is string => id !== null);
}

function collectMetrics(
  assets: PublishedAsset[],
  metrics: Map<string, YouTubeVideoMetrics>,
): YouTubeVideoMetrics[] {
  return collectVideoIds(assets)
    .map((id) => metrics.get(id))
    .filter((entry): entry is YouTubeVideoMetrics => entry !== undefined);
}

/** Single-asset surfaces (flagship, livestream) take the first resolved video. */
function findMetrics(
  assets: PublishedAsset[],
  metrics: Map<string, YouTubeVideoMetrics>,
): YouTubeVideoMetrics | undefined {
  return collectMetrics(assets, metrics)[0];
}

/**
 * Video-level YouTube metrics keyed by video ID.
 *
 * Each configured channel is queried for every requested ID: the Analytics API
 * only returns rows for videos the channel owns, so a "clips" upload would be
 * silently dropped if only the first channel were asked. The first channel that
 * knows a video wins, matching `fetchVideoStats` in `livestreams-youtube.ts`.
 */
async function fetchYouTubeMetrics(
  videoIds: string[],
  startDate: string,
  endDate: string,
): Promise<Map<string, YouTubeVideoMetrics>> {
  const metrics = new Map<string, YouTubeVideoMetrics>();
  if (!videoIds.length) return metrics;

  const channels = await getChannelConfigs();
  if (!channels.length) return metrics;

  const perChannel = await Promise.all(
    channels.map(async (channel) => {
      const token = await getAccessToken(channel);
      const [videos, reach, retention] = await Promise.all([
        fetchVideosByIds(token, channel.id, videoIds),
        fetchVideoReachMetrics(token, channel.id, videoIds, startDate, endDate),
        fetchVideoRetentionMetrics(
          token,
          channel.id,
          videoIds,
          startDate,
          endDate,
        ),
      ]);
      return { reach, retention, videos };
    }),
  );

  for (const { reach, retention, videos } of perChannel) {
    for (const video of videos) {
      if (metrics.has(video.video_id)) continue;

      // A zero from the Analytics API means "not reported for this range", the
      // same convention VideoTable already applies to CTR. Null keeps it out of
      // the tracked state instead of rendering a misleading 0%.
      const ctr = reach.get(video.video_id)?.ctr ?? 0;
      const avgViewPercentage =
        retention.get(video.video_id)?.avg_view_percentage ?? 0;

      metrics.set(video.video_id, {
        avgViewPercentage: avgViewPercentage > 0 ? avgViewPercentage : null,
        ctr: ctr > 0 ? ctr : null,
        views: video.views,
      });
    }
  }

  return metrics;
}

function buildEpisodeHref(episode: LivestreamArchiveItem): string {
  return episode.videoId
    ? `/livestreams/${encodeURIComponent(episode.videoId)}`
    : `/livestreams/${encodeURIComponent(episode.date)}`;
}

/**
 * The livestream falls back to the video already known from the transcript
 * archive and topic notes. That fallback is what makes this view useful before
 * #17 lands: without it every row would be empty on day one.
 */
function getLivestreamAssets(
  distribution: EpisodeDistribution | undefined,
  episode: LivestreamArchiveItem,
): PublishedAsset[] {
  const fromChecklist = getPublishedAssets(distribution, 'livestream');
  if (fromChecklist.length > 0) return fromChecklist;
  if (!episode.youtubeUrl) return [];

  return [
    {
      label: null,
      publishedAt: null,
      status: 'published',
      type: 'livestream',
      url: episode.youtubeUrl,
    },
  ];
}

function buildRow(
  episode: LivestreamArchiveItem,
  distribution: EpisodeDistribution | undefined,
  metrics: Map<string, YouTubeVideoMetrics>,
  isYouTubeConnected: boolean,
): EpisodeRollupRow {
  const hasChecklist = distribution !== undefined;

  const flagshipAssets = getPublishedAssets(distribution, 'flagship_video');
  const livestreamAssets = getLivestreamAssets(distribution, episode);
  const shortAssets = getPublishedAssets(distribution, 'short');
  const xAssets = getPublishedAssets(distribution, 'x_post');
  const linkedinAssets = getPublishedAssets(distribution, 'linkedin_post');

  const flagshipMetrics = findMetrics(flagshipAssets, metrics);
  const flagshipMissing = resolveNotTrackedReason(
    hasChecklist,
    flagshipAssets.length,
    isYouTubeConnected,
  );

  const livestreamMetrics = findMetrics(livestreamAssets, metrics);
  const shortMetrics = collectMetrics(shortAssets, metrics);

  // X and LinkedIn ingestion has not landed, so it is never available yet.
  const xMissing = resolveNotTrackedReason(hasChecklist, xAssets.length, false);
  const linkedinMissing = resolveNotTrackedReason(
    hasChecklist,
    linkedinAssets.length,
    false,
  );

  return {
    date: episode.date,
    flagship: {
      assets: toAssetLinks(flagshipAssets),
      avgViewPercentage: resolveYouTubeMetric(
        flagshipMetrics,
        (entry) => entry.avgViewPercentage,
        flagshipMissing,
      ),
      ctr: resolveYouTubeMetric(
        flagshipMetrics,
        (entry) => entry.ctr,
        flagshipMissing,
      ),
      views: resolveYouTubeMetric(
        flagshipMetrics,
        (entry) => entry.views,
        flagshipMissing,
      ),
    },
    href: buildEpisodeHref(episode),
    // The lead log has no ingestion yet, so leads is never an asset count — it
    // is always the integration that is missing.
    leads: { count: notTracked('no_integration') },
    linkedin: {
      assets: toAssetLinks(linkedinAssets),
      clicks: notTracked(linkedinMissing),
    },
    livestream: {
      assets: toAssetLinks(livestreamAssets),
      views: resolveYouTubeMetric(
        livestreamMetrics,
        (entry) => entry.views,
        resolveNotTrackedReason(
          hasChecklist,
          livestreamAssets.length,
          isYouTubeConnected,
        ),
      ),
    },
    shorts: {
      assets: toAssetLinks(shortAssets),
      views: shortMetrics.length
        ? tracked(shortMetrics.reduce((sum, entry) => sum + entry.views, 0))
        : notTracked(
            resolveNotTrackedReason(
              hasChecklist,
              shortAssets.length,
              isYouTubeConnected,
            ),
          ),
    },
    title: episode.title,
    x: {
      assets: toAssetLinks(xAssets),
      impressions: notTracked(xMissing),
    },
  };
}

export async function buildEpisodeRollup(): Promise<EpisodeRollupResponse> {
  const today = todayLocalDate();
  const episodes = (await listLivestreamArchive())
    .filter((episode) => episode.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date));

  const generatedAt = new Date().toISOString();
  const isYouTubeConnected = hasYouTubeCredentials();

  if (episodes.length === 0) {
    return { episodes: [], generatedAt, isYouTubeConnected };
  }

  const distributions = await readEpisodeDistributions(
    episodes.map((episode) => episode.date),
  );

  const videoIds = new Set<string>();
  for (const episode of episodes) {
    const distribution = distributions.get(episode.date);
    for (const assets of [
      getPublishedAssets(distribution, 'flagship_video'),
      getLivestreamAssets(distribution, episode),
      getPublishedAssets(distribution, 'short'),
    ]) {
      for (const id of collectVideoIds(assets)) videoIds.add(id);
    }
  }

  // Widest useful window: the Analytics API needs an explicit range, and the
  // rollup reports lifetime-to-date numbers rather than a rolling period.
  const startDate = episodes[episodes.length - 1].date;
  const metrics = isYouTubeConnected
    ? await fetchYouTubeMetrics(Array.from(videoIds), startDate, today)
    : new Map<string, YouTubeVideoMetrics>();

  return {
    episodes: episodes.map((episode) =>
      buildRow(
        episode,
        distributions.get(episode.date),
        metrics,
        isYouTubeConnected,
      ),
    ),
    generatedAt,
    isYouTubeConnected,
  };
}
