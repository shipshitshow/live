import { NextResponse } from "next/server";
import { hasYouTubeCredentials, getAccessToken, getChannelConfigs } from "@/lib/youtube/token";
import { cachedFetch, TTL } from "@/lib/youtube/cache";
import type { VideoStats } from "@/lib/types";

const DATA_API = "https://www.googleapis.com/youtube/v3";

interface UnlistedVideo extends VideoStats {
  description: string;
  thumbnail_url: string;
  privacy_status: string;
}

async function fetchUnlistedVideos(
  channelConfig: { id: string; label: string; refreshToken: string }
): Promise<UnlistedVideo[]> {
  const token = await getAccessToken(channelConfig);

  return cachedFetch(`unlisted:${channelConfig.id}`, TTL.DAILY_METRICS, async () => {
    // Get uploads playlist ID
    const channelRes = await ytFetch(
      `${DATA_API}/channels?part=contentDetails&id=${channelConfig.id}`,
      token
    );
    const uploadsPlaylistId =
      channelRes.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) return [];

    // Get all videos from uploads playlist (includes unlisted)
    const playlistRes = await ytFetch(
      `${DATA_API}/playlistItems?part=snippet,status&playlistId=${uploadsPlaylistId}&maxResults=50`,
      token
    );

    const items = playlistRes.items ?? [];
    // Filter to unlisted only
    const unlistedItems = items.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => item.status?.privacyStatus === "unlisted"
    );

    if (unlistedItems.length === 0) return [];

    // Get full video details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const videoIds = unlistedItems.map((item: any) => item.snippet.resourceId.videoId);
    const videosRes = await ytFetch(
      `${DATA_API}/videos?part=snippet,statistics,contentDetails,status&id=${videoIds.join(",")}`,
      token
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (videosRes.items ?? []).map((item: any): UnlistedVideo => {
      const durationSec = parseDuration(item.contentDetails?.duration);
      const isShort = durationSec > 0 && durationSec <= 60;

      return {
        video_id: item.id,
        title: item.snippet.title,
        published_at: item.snippet.publishedAt,
        description: item.snippet.description || "",
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
          item.snippet.thumbnails?.medium?.url ||
          item.snippet.thumbnails?.default?.url ||
          "",
        privacy_status: item.status?.privacyStatus || "unlisted",
      };
    });
  });
}

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
    console.error("Failed to fetch unlisted videos:", error);
    return NextResponse.json([]);
  }
}
