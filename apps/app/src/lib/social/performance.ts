import type { SocialPlatformStatus, VideoStats } from '@shipshitshow/types';
import { getSocialToken, type SocialTokenPlatform } from '@/lib/social/tokens';

interface SocialPerformanceResult {
  statuses: SocialPlatformStatus[];
  videos: VideoStats[];
}

interface TikTokVideo {
  id: string;
  title?: string;
  video_description?: string;
  create_time?: number;
  duration?: number;
  cover_image_url?: string;
  share_url?: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
}

interface InstagramMedia {
  id: string;
  caption?: string;
  comments_count?: number;
  like_count?: number;
  media_product_type?: string;
  media_type?: string;
  permalink?: string;
  thumbnail_url?: string;
  timestamp?: string;
}

interface InstagramInsight {
  name: string;
  values?: Array<{ value?: number }>;
}

const GRAPH_VERSION = process.env.INSTAGRAM_GRAPH_VERSION || 'v24.0';

function isoFromUnixSeconds(value: number | undefined): string {
  return value ? new Date(value * 1000).toISOString() : '';
}

function truncateTitle(value: string | undefined, fallback: string): string {
  const normalized = value?.trim();
  if (!normalized) return fallback;
  return normalized.length > 120
    ? `${normalized.slice(0, 117)}...`
    : normalized;
}

async function fetchTikTokVideos(): Promise<VideoStats[]> {
  const token = await getSocialToken('tiktok');
  if (!token?.accessToken) return [];

  const fields = [
    'id',
    'title',
    'video_description',
    'create_time',
    'duration',
    'cover_image_url',
    'share_url',
    'like_count',
    'comment_count',
    'share_count',
    'view_count',
  ].join(',');

  const res = await fetch(
    `https://open.tiktokapis.com/v2/video/list/?fields=${fields}`,
    {
      body: JSON.stringify({ max_count: 20 }),
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  );

  const body = (await res.json()) as {
    data?: { videos?: TikTokVideo[] };
    error?: { code?: string; message?: string };
  };

  if (!res.ok || body.error?.code === 'access_token_invalid') {
    throw new Error(body.error?.message || `TikTok API failed: ${res.status}`);
  }

  return (body.data?.videos ?? []).map(
    (video): VideoStats => ({
      avg_view_duration_seconds: Number(video.duration ?? 0),
      comments: Number(video.comment_count ?? 0),
      ctr: 0,
      impressions: 0,
      likes: Number(video.like_count ?? 0),
      platform: 'tiktok',
      published_at: isoFromUnixSeconds(video.create_time),
      shares: Number(video.share_count ?? 0),
      source_url: video.share_url,
      thumbnail_url: video.cover_image_url,
      title: truncateTitle(video.title || video.video_description, video.id),
      video_id: video.id,
      video_type: 'short',
      views: Number(video.view_count ?? 0),
      watch_time_minutes: 0,
    }),
  );
}

async function fetchInstagramInsights(
  mediaId: string,
  accessToken: string,
): Promise<Record<string, number>> {
  const params = new URLSearchParams({
    access_token: accessToken,
    metric: 'views,reach,likes,comments,shares,saves,total_interactions',
  });
  const res = await fetch(
    `https://graph.instagram.com/${GRAPH_VERSION}/${mediaId}/insights?${params}`,
  );
  if (!res.ok) return {};

  const body = (await res.json()) as { data?: InstagramInsight[] };
  const metrics: Record<string, number> = {};
  for (const item of body.data ?? []) {
    metrics[item.name] = Number(item.values?.[0]?.value ?? 0);
  }
  return metrics;
}

async function fetchInstagramVideos(): Promise<VideoStats[]> {
  const token = await getSocialToken('instagram');
  if (!token?.accessToken) return [];

  const params = new URLSearchParams({
    access_token: token.accessToken,
    fields:
      'id,caption,comments_count,like_count,media_product_type,media_type,permalink,thumbnail_url,timestamp',
    limit: '50',
  });
  const res = await fetch(
    `https://graph.instagram.com/${GRAPH_VERSION}/me/media?${params}`,
  );
  const body = (await res.json()) as {
    data?: InstagramMedia[];
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(
      body.error?.message || `Instagram API failed: ${res.status}`,
    );
  }

  const reels = (body.data ?? []).filter(
    (item) =>
      item.media_product_type === 'REELS' ||
      item.media_type === 'VIDEO' ||
      !!item.thumbnail_url,
  );

  const videos = await Promise.all(
    reels.slice(0, 25).map(async (item): Promise<VideoStats> => {
      const insights = await fetchInstagramInsights(item.id, token.accessToken);
      return {
        avg_view_duration_seconds: 0,
        comments: Number(insights.comments ?? item.comments_count ?? 0),
        ctr: 0,
        impressions: Number(insights.reach ?? 0),
        likes: Number(insights.likes ?? item.like_count ?? 0),
        platform: 'instagram',
        published_at: item.timestamp ?? '',
        shares: Number(insights.shares ?? 0),
        source_url: item.permalink,
        thumbnail_url: item.thumbnail_url,
        title: truncateTitle(item.caption, item.id),
        video_id: item.id,
        video_type: 'short',
        views: Number(insights.views ?? insights.reach ?? 0),
        watch_time_minutes: 0,
      };
    }),
  );

  return videos;
}

async function fetchPlatform(
  platform: SocialTokenPlatform,
): Promise<{ status: SocialPlatformStatus; videos: VideoStats[] }> {
  const token = await getSocialToken(platform);
  if (!token?.accessToken) {
    return {
      status: { connected: false, platform },
      videos: [],
    };
  }

  try {
    const videos =
      platform === 'tiktok'
        ? await fetchTikTokVideos()
        : await fetchInstagramVideos();
    return {
      status: { connected: true, platform },
      videos,
    };
  } catch (error) {
    return {
      status: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown API error',
        platform,
      },
      videos: [],
    };
  }
}

export async function fetchSocialPerformance(): Promise<SocialPerformanceResult> {
  const results = await Promise.all([
    fetchPlatform('instagram'),
    fetchPlatform('tiktok'),
  ]);

  return {
    statuses: results.map((result) => result.status),
    videos: results.flatMap((result) => result.videos),
  };
}
