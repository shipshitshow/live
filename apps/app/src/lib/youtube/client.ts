import type {
  ChannelStats,
  DailyMetric,
  ErrorResponse,
  VideoStats,
} from '@shipshitshow/types';
import type {
  YouTubeAnalyticsResponse,
  YouTubeChannelItem,
  YouTubeSearchItem,
  YouTubeVideoItem,
} from '@/lib/youtube/types';
import { cachedFetch, TTL } from './cache';
import { normalizeYouTubeError } from './error';

const DATA_API = 'https://www.googleapis.com/youtube/v3';
const ANALYTICS_API = 'https://youtubeanalytics.googleapis.com/v2/reports';

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export async function fetchChannelStats(
  token: string,
  channelId: string,
): Promise<ChannelStats> {
  return cachedFetch(`channel:${channelId}`, TTL.CHANNEL_STATS, async () => {
    const url = `${DATA_API}/channels?part=snippet,statistics&id=${channelId}`;
    const res = await ytFetch<{ items?: YouTubeChannelItem[] }>(url, token);
    const item = res.items?.[0];
    if (!item) throw new Error(`Channel not found: ${channelId}`);

    return {
      channel_id: channelId,
      channel_title: item.snippet?.title ?? channelId,
      subscriber_count: Number(item.statistics?.subscriberCount ?? 0),
      total_videos: Number(item.statistics?.videoCount ?? 0),
      total_views: Number(item.statistics?.viewCount ?? 0),
    };
  });
}

export async function fetchChannelVideos(
  token: string,
  channelId: string,
  maxResults = 50,
): Promise<VideoStats[]> {
  return cachedFetch(`videos:${channelId}`, TTL.VIDEO_LIST, async () => {
    const searchUrl = `${DATA_API}/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${maxResults}`;
    const searchRes = await ytFetch<{ items?: YouTubeSearchItem[] }>(
      searchUrl,
      token,
    );
    const videoIds = searchRes.items
      ?.map((item) => item.id?.videoId)
      .filter(isDefined);

    if (!videoIds?.length) return [];

    const videosUrl = `${DATA_API}/videos?part=snippet,statistics,contentDetails,liveStreamingDetails&id=${videoIds.join(',')}`;
    const videosRes = await ytFetch<{ items?: YouTubeVideoItem[] }>(
      videosUrl,
      token,
    );

    return (videosRes.items ?? []).map((item): VideoStats => {
      const durationSec = parseDuration(item.contentDetails?.duration);
      const isLive = !!item.liveStreamingDetails;
      const isShort = durationSec > 0 && durationSec <= 60;
      const videoType = isLive ? 'livestream' : isShort ? 'short' : 'video';
      const thumbnail =
        item.snippet?.thumbnails?.medium?.url ??
        item.snippet?.thumbnails?.default?.url ??
        '';

      return {
        avg_view_duration_seconds: durationSec,
        channel_id: channelId,
        comments: Number(item.statistics?.commentCount ?? 0),
        ctr: 0,
        impressions: 0,
        likes: Number(item.statistics?.likeCount ?? 0),
        published_at: item.snippet?.publishedAt ?? '',
        thumbnail_url: thumbnail,
        title: item.snippet?.title ?? item.id,
        video_id: item.id,
        video_type: videoType,
        views: Number(item.statistics?.viewCount ?? 0),
        watch_time_minutes: 0,
      };
    });
  });
}

export async function fetchDailyMetrics(
  token: string,
  channelId: string,
  startDate: string,
  endDate: string,
): Promise<DailyMetric[]> {
  const cacheKey = `daily:${channelId}:${startDate}:${endDate}`;
  return cachedFetch(cacheKey, TTL.DAILY_METRICS, async () => {
    const params = new URLSearchParams({
      dimensions: 'day',
      endDate,
      ids: `channel==${channelId}`,
      metrics:
        'views,estimatedMinutesWatched,subscribersGained,averageViewDuration,averageViewPercentage,likes',
      sort: 'day',
      startDate,
    });

    const res = await ytFetch<YouTubeAnalyticsResponse>(
      `${ANALYTICS_API}?${params}`,
      token,
    );

    return (res.rows ?? []).map(
      (row): DailyMetric => ({
        avg_view_duration_seconds: Number(row[4]),
        avg_view_percentage: Number(row[5]),
        day: String(row[0] ?? ''),
        likes: Number(row[6]),
        subscribers_gained: Number(row[3]),
        views: Number(row[1]),
        watch_time_minutes: Number(row[2]),
      }),
    );
  });
}

export async function fetchVideoAnalytics(
  token: string,
  channelId: string,
  videoIds: string[],
  startDate: string,
  endDate: string,
): Promise<
  Map<string, { impressions: number; ctr: number; watch_time_minutes: number }>
> {
  if (!videoIds.length) return new Map();

  const cacheKey = `vidanalytics:${channelId}:${startDate}:${videoIds.slice(0, 5).join(',')}`;
  const rows = await cachedFetch(cacheKey, TTL.VIDEO_ANALYTICS, async () => {
    const params = new URLSearchParams({
      dimensions: 'video',
      endDate,
      filters: `video==${videoIds.join(',')}`,
      ids: `channel==${channelId}`,
      metrics: 'views,estimatedMinutesWatched,likes,shares,averageViewDuration',
      sort: '-views',
      startDate,
    });

    const res = await ytFetch<YouTubeAnalyticsResponse>(
      `${ANALYTICS_API}?${params}`,
      token,
    );
    return res.rows ?? [];
  });

  const map = new Map<
    string,
    { impressions: number; ctr: number; watch_time_minutes: number }
  >();
  for (const row of rows) {
    map.set(String(row[0] ?? ''), {
      ctr: 0,
      impressions: 0,
      watch_time_minutes: Number(row[2]),
    });
  }
  return map;
}

async function ytFetch<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    const normalized = normalizeYouTubeError(res.status, body);
    const error = new Error(normalized.error) as Error & ErrorResponse;
    error.code = normalized.code;
    error.hint = normalized.hint;
    throw error;
  }
  return (await res.json()) as T;
}

/** Parse ISO 8601 duration (PT4M13S) to seconds */
function parseDuration(iso: string | undefined): number {
  if (!iso) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (
    (Number(match[1]) || 0) * 3600 +
    (Number(match[2]) || 0) * 60 +
    (Number(match[3]) || 0)
  );
}
