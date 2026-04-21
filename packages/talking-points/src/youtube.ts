import type { TrendItem } from '@shipshitshow/types';
import { dedupeTrendItems } from './items';

const YT_API = 'https://www.googleapis.com/youtube/v3';
const AI_TREND_QUERIES = [
  '"artificial intelligence" OR AI OR LLM',
  'OpenAI OR Anthropic OR Claude OR ChatGPT OR GPT',
  '"local llm" OR llama.cpp OR Ollama OR Qwen OR DeepSeek OR Cursor OR Codex',
];

interface YouTubeSearchItem {
  id?: {
    videoId?: string;
  };
}

interface YouTubeVideoItem {
  id: string;
  snippet?: {
    channelTitle?: string;
    description?: string;
    publishedAt?: string;
    title?: string;
    thumbnails?: {
      medium?: {
        url?: string;
      };
    };
  };
  statistics?: {
    commentCount?: string;
    viewCount?: string;
  };
}

export interface YouTubeSourceOptions {
  accessToken?: string;
  apiKey?: string;
  maxResultsPerQuery?: number;
  regionCode?: string;
}

interface YouTubeAuthConfig {
  accessToken?: string;
  apiKey?: string;
}

function appendApiKey(url: string, apiKey?: string): string {
  if (!apiKey) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}key=${encodeURIComponent(apiKey)}`;
}

function getAuthHeaders(
  accessToken?: string,
): { Authorization: string } | undefined {
  if (!accessToken) return undefined;
  return { Authorization: `Bearer ${accessToken}` };
}

function toTrendItem(video: YouTubeVideoItem): TrendItem {
  return {
    author: video.snippet?.channelTitle,
    commentCount:
      Number.parseInt(video.statistics?.commentCount ?? '0', 10) || 0,
    id: `yt-${video.id}`,
    score: Number.parseInt(video.statistics?.viewCount ?? '0', 10) || 0,
    source: 'youtube',
    summary: video.snippet?.description?.slice(0, 200) || undefined,
    thumbnail: video.snippet?.thumbnails?.medium?.url,
    timestamp: video.snippet?.publishedAt ?? '',
    title: video.snippet?.title ?? video.id,
    url: `https://www.youtube.com/watch?v=${video.id}`,
  };
}

async function fetchVideoDetails(
  auth: YouTubeAuthConfig,
  videoIds: string[],
): Promise<TrendItem[]> {
  if (videoIds.length === 0) return [];

  const url = appendApiKey(
    `${YT_API}/videos?part=snippet,statistics&id=${videoIds.join(',')}`,
    auth.apiKey,
  );
  const detailRes = await fetch(url, {
    headers: getAuthHeaders(auth.accessToken),
  });

  if (!detailRes.ok) {
    throw new Error(`YouTube detail error: ${detailRes.status}`);
  }

  const detailData = await detailRes.json();
  return ((detailData.items ?? []) as YouTubeVideoItem[]).map(toTrendItem);
}

async function searchVideoIds(
  auth: YouTubeAuthConfig,
  query: string,
  maxResults: number,
  order: 'date' | 'relevance' | 'viewCount',
  regionCode: string,
): Promise<string[]> {
  const publishedAfter = new Date(
    Date.now() - 1000 * 60 * 60 * 24 * 7,
  ).toISOString();

  const url = appendApiKey(
    `${YT_API}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=28&maxResults=${maxResults}&order=${order}&regionCode=${regionCode}&publishedAfter=${encodeURIComponent(publishedAfter)}`,
    auth.apiKey,
  );
  const searchRes = await fetch(url, {
    headers: getAuthHeaders(auth.accessToken),
  });

  if (!searchRes.ok) {
    throw new Error(`YouTube search error: ${searchRes.status}`);
  }

  const searchData = await searchRes.json();
  return ((searchData.items ?? []) as YouTubeSearchItem[])
    .map((item) => item.id?.videoId)
    .filter(
      (videoId): videoId is string =>
        typeof videoId === 'string' && videoId.length > 0,
    );
}

export async function fetchYouTubeTrending({
  accessToken,
  apiKey,
  maxResultsPerQuery = 5,
  regionCode = 'US',
}: YouTubeSourceOptions): Promise<TrendItem[]> {
  if (!accessToken && !apiKey) return [];

  const auth = { accessToken, apiKey };
  const searchResults = await Promise.allSettled(
    AI_TREND_QUERIES.map((query) =>
      searchVideoIds(auth, query, maxResultsPerQuery, 'date', regionCode),
    ),
  );

  const videoIds: string[] = [];
  const seen = new Set<string>();

  for (const result of searchResults) {
    if (result.status !== 'fulfilled') continue;

    for (const videoId of result.value) {
      if (seen.has(videoId)) continue;
      seen.add(videoId);
      videoIds.push(videoId);
    }
  }

  return fetchVideoDetails(auth, videoIds.slice(0, 15));
}

export async function searchYouTube(
  query: string,
  { accessToken, apiKey, regionCode = 'US' }: YouTubeSourceOptions,
): Promise<TrendItem[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery || (!accessToken && !apiKey)) return [];

  const auth = { accessToken, apiKey };

  const videoIds = await searchVideoIds(
    auth,
    trimmedQuery,
    15,
    'relevance',
    regionCode,
  );

  return dedupeTrendItems(await fetchVideoDetails(auth, videoIds));
}
