import type { ChannelStats, VideoStats, DailyMetric } from "@/lib/types";
import { cachedFetch, TTL } from "./cache";

const DATA_API = "https://www.googleapis.com/youtube/v3";
const ANALYTICS_API = "https://youtubeanalytics.googleapis.com/v2/reports";

// ─── Data API v3 ───

export async function fetchChannelStats(
  token: string,
  channelId: string
): Promise<ChannelStats> {
  return cachedFetch(`channel:${channelId}`, TTL.CHANNEL_STATS, async () => {
    const url = `${DATA_API}/channels?part=snippet,statistics&id=${channelId}`;
    const res = await ytFetch(url, token);
    const item = res.items?.[0];
    if (!item) throw new Error(`Channel not found: ${channelId}`);

    return {
      channel_id: channelId,
      channel_title: item.snippet.title,
      subscriber_count: Number(item.statistics.subscriberCount),
      total_views: Number(item.statistics.viewCount),
      total_videos: Number(item.statistics.videoCount),
    };
  });
}

export async function fetchChannelVideos(
  token: string,
  channelId: string,
  maxResults = 50
): Promise<VideoStats[]> {
  return cachedFetch(`videos:${channelId}`, TTL.VIDEO_LIST, async () => {
    // Step 1: Get video IDs via search
    const searchUrl = `${DATA_API}/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${maxResults}`;
    const searchRes = await ytFetch(searchUrl, token);
    const videoIds = searchRes.items
      ?.map((item: Record<string, Record<string, string>>) => item.id?.videoId)
      .filter(Boolean) as string[];

    if (!videoIds?.length) return [];

    // Step 2: Get full video stats
    const videosUrl = `${DATA_API}/videos?part=snippet,statistics,contentDetails,liveStreamingDetails&id=${videoIds.join(",")}`;
    const videosRes = await ytFetch(videosUrl, token);

    return (videosRes.items ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any): VideoStats => {
        const durationSec = parseDuration(item.contentDetails?.duration);
        const isLive = !!item.liveStreamingDetails;
        const isShort = durationSec > 0 && durationSec <= 60;
        const videoType = isLive ? "livestream" as const : isShort ? "short" as const : "video" as const;
        const thumbnail = item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "";

        return {
          video_id: item.id,
          title: item.snippet.title,
          published_at: item.snippet.publishedAt,
          views: Number(item.statistics.viewCount ?? 0),
          likes: Number(item.statistics.likeCount ?? 0),
          comments: Number(item.statistics.commentCount ?? 0),
          impressions: 0,
          ctr: 0,
          watch_time_minutes: 0,
          avg_view_duration_seconds: durationSec,
          channel_id: channelId,
          video_type: videoType,
          thumbnail_url: thumbnail,
        };
      }
    );
  });
}

// ─── YouTube Analytics API ───

export async function fetchDailyMetrics(
  token: string,
  channelId: string,
  startDate: string,
  endDate: string
): Promise<DailyMetric[]> {
  const cacheKey = `daily:${channelId}:${startDate}:${endDate}`;
  return cachedFetch(cacheKey, TTL.DAILY_METRICS, async () => {
    const params = new URLSearchParams({
      ids: `channel==${channelId}`,
      startDate,
      endDate,
      metrics: "views,estimatedMinutesWatched,subscribersGained,averageViewDuration,averageViewPercentage,likes",
      dimensions: "day",
      sort: "day",
    });

    const res = await ytFetch(`${ANALYTICS_API}?${params}`, token);

    return (res.rows ?? []).map(
      (row: (string | number)[]): DailyMetric => ({
        day: row[0] as string,
        views: Number(row[1]),
        watch_time_minutes: Number(row[2]),
        subscribers_gained: Number(row[3]),
        avg_view_duration_seconds: Number(row[4]),
        avg_view_percentage: Number(row[5]),
        likes: Number(row[6]),
      })
    );
  });
}

export async function fetchVideoAnalytics(
  token: string,
  channelId: string,
  videoIds: string[],
  startDate: string,
  endDate: string
): Promise<Map<string, { impressions: number; ctr: number; watch_time_minutes: number }>> {
  if (!videoIds.length) return new Map();

  const cacheKey = `vidanalytics:${channelId}:${startDate}:${videoIds.slice(0, 5).join(",")}`;
  const rows = await cachedFetch(cacheKey, TTL.VIDEO_ANALYTICS, async () => {
    const params = new URLSearchParams({
      ids: `channel==${channelId}`,
      startDate,
      endDate,
      metrics: "views,estimatedMinutesWatched,likes,shares,averageViewDuration",
      dimensions: "video",
      filters: `video==${videoIds.join(",")}`,
      sort: "-views",
    });

    const res = await ytFetch(`${ANALYTICS_API}?${params}`, token);
    return (res.rows ?? []) as (string | number)[][];
  });

  const map = new Map<string, { impressions: number; ctr: number; watch_time_minutes: number }>();
  for (const row of rows) {
    map.set(row[0] as string, {
      impressions: 0,
      ctr: 0,
      watch_time_minutes: Number(row[2]),
    });
  }
  return map;
}

// ─── Helpers ───

async function ytFetch(url: string, token: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API ${res.status}: ${body}`);
  }
  return res.json();
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
