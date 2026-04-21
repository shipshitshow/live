import type { TrendItem } from '@shipshitshow/types';
import { cachedFetch, TTL } from '../cache';

interface YouTubeSearchItem {
  id?: { videoId?: string };
}

interface YouTubeVideoItem {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: { medium?: { url?: string } };
  };
  statistics?: {
    viewCount?: string;
    commentCount?: string;
  };
}

const YT_API = 'https://www.googleapis.com/youtube/v3';
const AI_TREND_QUERIES = [
  '"artificial intelligence" OR AI OR LLM',
  'OpenAI OR Anthropic OR Claude OR ChatGPT OR GPT',
  '"local llm" OR llama.cpp OR Ollama OR Qwen OR DeepSeek OR Cursor OR Codex',
];

function hasYouTubeApiKey(): boolean {
  return !!process.env.YOUTUBE_API_KEY;
}

function getApiKey(): string {
  return process.env.YOUTUBE_API_KEY || '';
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
    title: video.snippet?.title ?? (typeof video.id === 'string' ? video.id : ''),
    url: `https://www.youtube.com/watch?v=${video.id}`,
  };
}

async function fetchVideoDetails(
  videoIds: string[],
  apiKey: string,
): Promise<TrendItem[]> {
  if (videoIds.length === 0) return [];

  return cachedFetch(
    `trends:youtube:details:${videoIds.join(',')}`,
    TTL.TREND_DISCOVERY,
    async () => {
      const detailRes = await fetch(
        `${YT_API}/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${apiKey}`,
      );

      if (!detailRes.ok) {
        throw new Error(`YouTube detail error: ${detailRes.status}`);
      }

      const detailData = await detailRes.json();
      return ((detailData.items ?? []) as YouTubeVideoItem[]).map(toTrendItem);
    },
  );
}

async function searchVideoIds(
  query: string,
  apiKey: string,
  maxResults: number,
  order: 'date' | 'relevance' | 'viewCount',
) {
  const publishedAfter = new Date(
    Date.now() - 1000 * 60 * 60 * 24 * 7,
  ).toISOString();

  return cachedFetch(
    `trends:youtube:search:${order}:${maxResults}:${query}:${publishedAfter.slice(0, 10)}`,
    TTL.TREND_DISCOVERY,
    async () => {
      const searchRes = await fetch(
        `${YT_API}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=28&maxResults=${maxResults}&order=${order}&regionCode=US&publishedAfter=${encodeURIComponent(publishedAfter)}&key=${apiKey}`,
      );

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
    },
  );
}

export async function fetchYouTubeTrending(): Promise<TrendItem[]> {
  if (!hasYouTubeApiKey()) return [];

  return cachedFetch('trends:youtube:feed', TTL.TREND_DISCOVERY, async () => {
    const apiKey = getApiKey();

    const searchResults = await Promise.allSettled(
      AI_TREND_QUERIES.map((query) => searchVideoIds(query, apiKey, 5, 'date')),
    );

    const seen = new Set<string>();
    const videoIds: string[] = [];

    for (const result of searchResults) {
      if (result.status !== 'fulfilled') continue;
      for (const id of result.value) {
        if (seen.has(id)) continue;
        seen.add(id);
        videoIds.push(id);
      }
    }

    return fetchVideoDetails(videoIds.slice(0, 15), apiKey);
  });
}

export async function searchYouTube(query: string): Promise<TrendItem[]> {
  if (!hasYouTubeApiKey()) return [];

  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  return cachedFetch(
    `trends:youtube:query:${trimmedQuery.toLowerCase()}`,
    TTL.TREND_SEARCH,
    async () => {
      const apiKey = getApiKey();
      const videoIds = await searchVideoIds(
        trimmedQuery,
        apiKey,
        15,
        'relevance',
      );
      return fetchVideoDetails(videoIds, apiKey);
    },
  );
}
