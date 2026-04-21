import type { TrendItem } from '@shipshitshow/types';
import { cachedFetch, TTL } from '@/lib/youtube/cache';
import {
  getAccessToken,
  getChannelConfigs,
  hasYouTubeCredentials,
} from '@/lib/youtube/token';
import type { YouTubeSearchItem, YouTubeVideoItem } from '@/lib/youtube/types';

const YT_API = 'https://www.googleapis.com/youtube/v3';
const AI_TREND_QUERIES = [
  '"artificial intelligence" OR AI OR LLM',
  'OpenAI OR Anthropic OR Claude OR ChatGPT OR GPT',
  '"local llm" OR llama.cpp OR Ollama OR Qwen OR DeepSeek OR Cursor OR Codex',
];

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
  videoIds: string[],
  token: string,
): Promise<TrendItem[]> {
  if (videoIds.length === 0) return [];

  return cachedFetch(
    `trends:youtube:details:${videoIds.join(',')}`,
    TTL.TREND_DISCOVERY,
    async () => {
      const detailRes = await fetch(
        `${YT_API}/videos?part=snippet,statistics&id=${videoIds.join(',')}`,
        { headers: { Authorization: `Bearer ${token}` } },
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
  token: string,
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
        `${YT_API}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=28&maxResults=${maxResults}&order=${order}&regionCode=US&publishedAfter=${encodeURIComponent(publishedAfter)}`,
        { headers: { Authorization: `Bearer ${token}` } },
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
  if (!hasYouTubeCredentials()) return [];
  const configs = await getChannelConfigs();
  if (configs.length === 0) return [];
  return cachedFetch('trends:youtube:feed', TTL.TREND_DISCOVERY, async () => {
    const token = await getAccessToken(configs[0]);

    const searchResults = await Promise.allSettled(
      AI_TREND_QUERIES.map((query) => searchVideoIds(query, token, 5, 'date')),
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

    return fetchVideoDetails(videoIds.slice(0, 15), token);
  });
}

export async function searchYouTube(query: string): Promise<TrendItem[]> {
  if (!hasYouTubeCredentials()) return [];
  const configs = await getChannelConfigs();
  if (configs.length === 0) return [];

  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  return cachedFetch(
    `trends:youtube:query:${trimmedQuery.toLowerCase()}`,
    TTL.TREND_SEARCH,
    async () => {
      const token = await getAccessToken(configs[0]);
      const videoIds = await searchVideoIds(
        trimmedQuery,
        token,
        15,
        'relevance',
      );
      return fetchVideoDetails(videoIds, token);
    },
  );
}
