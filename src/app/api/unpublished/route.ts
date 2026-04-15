import { NextResponse } from "next/server";
import { hasYouTubeCredentials, getAccessToken, getChannelConfigs } from "@/lib/youtube/token";
import { cachedFetch, TTL } from "@/lib/youtube/cache";
import type { ErrorResponse } from "@/lib/api-types";
import type { UnlistedVideo } from "@/lib/review-types";
import type { YouTubeChannelItem, YouTubePlaylistItem, YouTubeVideoItem } from "@/lib/youtube/types";

const DATA_API = "https://www.googleapis.com/youtube/v3";

async function fetchUnlistedVideos(
  channelConfig: { id: string; label: string; refreshToken: string }
): Promise<UnlistedVideo[]> {
  const token = await getAccessToken(channelConfig);

  return cachedFetch(`unlisted:${channelConfig.id}`, TTL.DAILY_METRICS, async () => {
    const channelRes = await ytFetch<{ items?: YouTubeChannelItem[] }>(
      `${DATA_API}/channels?part=contentDetails&id=${channelConfig.id}`,
      token
    );
    const uploadsPlaylistId =
      channelRes.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) return [];

    const playlistRes = await ytFetch<{ items?: YouTubePlaylistItem[] }>(
      `${DATA_API}/playlistItems?part=snippet,status&playlistId=${uploadsPlaylistId}&maxResults=50`,
      token
    );

    const items = playlistRes.items ?? [];
    const unlistedItems = items.filter(
      (item) => item.status?.privacyStatus === "unlisted"
    );

    if (unlistedItems.length === 0) return [];

    const videoIds = unlistedItems
      .map((item) => item.snippet?.resourceId?.videoId)
      .filter((videoId): videoId is string => typeof videoId === "string" && videoId.length > 0);
    const videosRes = await ytFetch<{ items?: YouTubeVideoItem[] }>(
      `${DATA_API}/videos?part=snippet,statistics,contentDetails,status&id=${videoIds.join(",")}`,
      token
    );

    return (videosRes.items ?? []).map((item): UnlistedVideo => {
      const durationSec = parseDuration(item.contentDetails?.duration);
      const isShort = durationSec > 0 && durationSec <= 60;

      return {
        video_id: item.id,
        title: item.snippet?.title ?? item.id,
        published_at: item.snippet?.publishedAt ?? "",
        description: item.snippet?.description ?? "",
        views: Number(item.statistics?.viewCount ?? 0),
        likes: Number(item.statistics?.likeCount ?? 0),
        comments: Number(item.statistics?.commentCount ?? 0),
        impressions: 0,
        ctr: 0,
        watch_time_minutes: 0,
        avg_view_duration_seconds: durationSec,
        channel_id: channelConfig.id,
        channel_label: channelConfig.label,
        video_type: isShort ? "short" : "video",
        thumbnail_url:
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          "",
        privacy_status: item.status?.privacyStatus ?? "unlisted",
      };
    });
  });
}

async function ytFetch<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API ${res.status}: ${body}`);
  }
  return (await res.json()) as T;
}

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

export async function GET() {
  if (!hasYouTubeCredentials()) {
    return NextResponse.json([]);
  }

  try {
    const channels = await getChannelConfigs();
    const results = await Promise.all(
      channels.map((ch) => fetchUnlistedVideos(ch))
    );
    const all = results
      .flat()
      .sort(
        (a, b) =>
          new Date(b.published_at).getTime() -
          new Date(a.published_at).getTime()
      );
    return NextResponse.json(all);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch unlisted videos";
    const response: ErrorResponse = { error: message };
    return NextResponse.json(response, { status: 500 });
  }
}
