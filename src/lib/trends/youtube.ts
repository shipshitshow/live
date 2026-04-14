import type { TrendItem } from "@/lib/trends-types";
import { hasYouTubeCredentials, getAccessToken, getChannelConfigs } from "@/lib/youtube/token";

const YT_API = "https://www.googleapis.com/youtube/v3";
const AI_TREND_QUERIES = [
  "\"artificial intelligence\" OR AI OR LLM",
  "OpenAI OR Anthropic OR Claude OR ChatGPT OR GPT",
  "\"local llm\" OR llama.cpp OR Ollama OR Qwen OR DeepSeek OR Cursor OR Codex",
];

interface YTVideo {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    description: string;
    thumbnails: { medium?: { url: string } };
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

interface YTSearchItem {
  id: {
    videoId: string;
  };
}

function toTrendItem(video: YTVideo): TrendItem {
  return {
    id: `yt-${video.id}`,
    title: video.snippet.title,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    source: "youtube",
    score: Number.parseInt(video.statistics.viewCount, 10) || 0,
    commentCount: Number.parseInt(video.statistics.commentCount, 10) || 0,
    timestamp: video.snippet.publishedAt,
    summary: video.snippet.description?.slice(0, 200) || undefined,
    author: video.snippet.channelTitle,
    thumbnail: video.snippet.thumbnails?.medium?.url,
  };
}

async function fetchVideoDetails(videoIds: string[], token: string): Promise<TrendItem[]> {
  if (videoIds.length === 0) return [];

  const detailRes = await fetch(
    `${YT_API}/videos?part=snippet,statistics&id=${videoIds.join(",")}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!detailRes.ok) throw new Error(`YouTube detail error: ${detailRes.status}`);

  const detailData = await detailRes.json();
  return (detailData.items as YTVideo[]).map(toTrendItem);
}

async function searchVideoIds(query: string, token: string, maxResults: number, order: "date" | "relevance" | "viewCount") {
  const searchRes = await fetch(
    `${YT_API}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=28&maxResults=${maxResults}&order=${order}&regionCode=US&publishedAfter=${encodeURIComponent(new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString())}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!searchRes.ok) throw new Error(`YouTube search error: ${searchRes.status}`);

  const searchData = await searchRes.json();
  return (searchData.items as YTSearchItem[]).map((item) => item.id.videoId).filter(Boolean);
}

export async function fetchYouTubeTrending(): Promise<TrendItem[]> {
  if (!hasYouTubeCredentials()) return [];
  const configs = getChannelConfigs();
  if (configs.length === 0) return [];
  const token = await getAccessToken(configs[0]);

  const searchResults = await Promise.allSettled(
    AI_TREND_QUERIES.map((query) => searchVideoIds(query, token, 5, "date"))
  );

  const seen = new Set<string>();
  const videoIds: string[] = [];

  for (const result of searchResults) {
    if (result.status !== "fulfilled") continue;
    for (const id of result.value) {
      if (seen.has(id)) continue;
      seen.add(id);
      videoIds.push(id);
    }
  }

  return fetchVideoDetails(videoIds.slice(0, 15), token);
}

export async function searchYouTube(query: string): Promise<TrendItem[]> {
  if (!hasYouTubeCredentials()) return [];
  const configs = getChannelConfigs();
  if (configs.length === 0) return [];
  const token = await getAccessToken(configs[0]);
  const videoIds = await searchVideoIds(query, token, 15, "relevance");
  return fetchVideoDetails(videoIds, token);
}
