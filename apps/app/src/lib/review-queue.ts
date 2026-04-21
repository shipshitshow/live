import type { ErrorResponse, UnlistedVideo } from '@shipshitshow/types';
import { cachedFetch, TTL } from '@/lib/youtube/cache';
import { normalizeYouTubeError } from '@/lib/youtube/error';
import {
  getAccessToken,
  getChannelConfigs,
  hasYouTubeCredentials,
} from '@/lib/youtube/token';
import type {
  YouTubeChannelItem,
  YouTubePlaylistItem,
  YouTubeVideoItem,
} from '@/lib/youtube/types';

const DATA_API = 'https://www.googleapis.com/youtube/v3';

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

async function fetchReviewQueueVideos(channelConfig: {
  id: string;
  label: string;
  refreshToken: string;
}): Promise<UnlistedVideo[]> {
  const token = await getAccessToken(channelConfig);

  return cachedFetch(
    `review-queue:${channelConfig.id}`,
    TTL.DAILY_METRICS,
    async () => {
      const channelRes = await ytFetch<{ items?: YouTubeChannelItem[] }>(
        `${DATA_API}/channels?part=contentDetails&id=${channelConfig.id}`,
        token,
      );
      const uploadsPlaylistId =
        channelRes.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
      if (!uploadsPlaylistId) return [];

      const playlistRes = await ytFetch<{ items?: YouTubePlaylistItem[] }>(
        `${DATA_API}/playlistItems?part=snippet,status&playlistId=${uploadsPlaylistId}&maxResults=50`,
        token,
      );

      const items = playlistRes.items ?? [];
      const unlistedItems = items.filter(
        (item) => item.status?.privacyStatus === 'unlisted',
      );

      if (unlistedItems.length === 0) return [];

      const videoIds = unlistedItems
        .map((item) => item.snippet?.resourceId?.videoId)
        .filter(
          (videoId): videoId is string =>
            typeof videoId === 'string' && videoId.length > 0,
        );
      const videosRes = await ytFetch<{ items?: YouTubeVideoItem[] }>(
        `${DATA_API}/videos?part=snippet,statistics,contentDetails,status&id=${videoIds.join(',')}`,
        token,
      );

      return (videosRes.items ?? []).map((item): UnlistedVideo => {
        const durationSec = parseDuration(item.contentDetails?.duration);
        const isShort = durationSec > 0 && durationSec <= 60;

        return {
          avg_view_duration_seconds: durationSec,
          channel_id: channelConfig.id,
          channel_label: channelConfig.label,
          comments: Number(item.statistics?.commentCount ?? 0),
          ctr: 0,
          description: item.snippet?.description ?? '',
          impressions: 0,
          likes: Number(item.statistics?.likeCount ?? 0),
          privacy_status: item.status?.privacyStatus ?? 'unlisted',
          published_at: item.snippet?.publishedAt ?? '',
          thumbnail_url:
            item.snippet?.thumbnails?.medium?.url ||
            item.snippet?.thumbnails?.default?.url ||
            '',
          title: item.snippet?.title ?? item.id,
          video_id: item.id,
          video_type: isShort ? 'short' : 'video',
          views: Number(item.statistics?.viewCount ?? 0),
          watch_time_minutes: 0,
        };
      });
    },
  );
}

export async function listReviewQueueVideos(): Promise<UnlistedVideo[]> {
  if (!hasYouTubeCredentials()) {
    return [];
  }

  const channels = await getChannelConfigs();
  const results = await Promise.all(
    channels.map((ch) => fetchReviewQueueVideos(ch)),
  );

  return results
    .flat()
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    );
}
