import {
  getAccessToken,
  getChannelConfigs,
  hasYouTubeCredentials,
} from '@/lib/youtube/token';

export interface VideoStats {
  commentCount: number;
  viewCount: number;
}

const DATA_API = 'https://www.googleapis.com/youtube/v3';

export async function fetchVideoStats(
  videoId: string,
): Promise<VideoStats | null> {
  if (!hasYouTubeCredentials()) return null;

  try {
    const channels = await getChannelConfigs();
    const channel = channels[0];
    if (!channel) return null;

    const token = await getAccessToken(channel);
    const url = `${DATA_API}/videos?part=statistics&id=${encodeURIComponent(videoId)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const stats = data?.items?.[0]?.statistics;
    if (!stats) return null;

    return {
      commentCount: Number(stats.commentCount ?? 0),
      viewCount: Number(stats.viewCount ?? 0),
    };
  } catch {
    return null;
  }
}

const YT_URL_PATTERN =
  /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w-]+|youtube\.com\/live\/[\w-]+|youtu\.be\/[\w-]+)/;

const RESTREAM_URL_PATTERN = /https?:\/\/studio\.restream\.io\/[\w-]+/;

const LIVESTREAM_NOTES_PATTERN =
  /## Livestream Notes\s*([\s\S]*?)(?:\n## |\n?$)/;

export function extractYouTubeUrl(raw: string): string | null {
  const notesMatch = raw.match(LIVESTREAM_NOTES_PATTERN);
  const preferredMatch = notesMatch?.[1]?.match(YT_URL_PATTERN);
  if (preferredMatch?.[0]) return preferredMatch[0];
  return raw.match(YT_URL_PATTERN)?.[0] ?? null;
}

export function extractLivestreamYouTubeUrl(raw: string): string | null {
  const notesMatch = raw.match(LIVESTREAM_NOTES_PATTERN);
  return notesMatch?.[1]?.match(YT_URL_PATTERN)?.[0] ?? null;
}

export function extractRestreamUrl(raw: string): string | null {
  const notesMatch = raw.match(LIVESTREAM_NOTES_PATTERN);
  return notesMatch?.[1]?.match(RESTREAM_URL_PATTERN)?.[0] ?? null;
}

export function extractVideoId(url: string): string | null {
  const watchMatch = url.match(/[?&]v=([\w-]+)/);
  if (watchMatch) return watchMatch[1];

  const liveMatch = url.match(/youtube\.com\/live\/([\w-]+)/);
  if (liveMatch) return liveMatch[1];

  const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
  return shortMatch?.[1] ?? null;
}

function buildImgYouTubeThumbnailUrl(
  videoId: string,
  filename: 'maxresdefault.jpg' | 'hqdefault.jpg',
): string {
  return `https://img.youtube.com/vi/${videoId}/${filename}`;
}

export async function buildYouTubeThumbnailUrl(
  videoId: string,
): Promise<string> {
  const maxResUrl = buildImgYouTubeThumbnailUrl(videoId, 'maxresdefault.jpg');

  try {
    const response = await fetch(maxResUrl, {
      cache: 'force-cache',
      method: 'HEAD',
      next: { revalidate: 3600 },
    });
    if (response.ok) {
      return maxResUrl;
    }
  } catch {
    // Fall back to the reliable default thumbnail URL below.
  }

  return buildImgYouTubeThumbnailUrl(videoId, 'hqdefault.jpg');
}
