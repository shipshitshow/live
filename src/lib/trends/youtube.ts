import type { TrendItem } from "@/lib/trends-types";
import { hasYouTubeCredentials, getAccessToken, getChannelConfigs } from "@/lib/youtube/token";

const YT_API = "https://www.googleapis.com/youtube/v3";

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

export async function fetchYouTubeTrending(): Promise<TrendItem[]> {
  if (!hasYouTubeCredentials()) return [];
  const configs = getChannelConfigs();
  if (configs.length === 0) return [];
  const token = await getAccessToken(configs[0]);
  const res = await fetch(
    `${YT_API}/videos?part=snippet,statistics&chart=mostPopular&videoCategoryId=28&maxResults=20&regionCode=US`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const data = await res.json();
  return (data.items as YTVideo[]).map(toTrendItem);
}

export async function searchYouTube(query: string): Promise<TrendItem[]> {
  if (!hasYouTubeCredentials()) return [];
  const configs = getChannelConfigs();
  if (configs.length === 0) return [];
  const token = await getAccessToken(configs[0]);
  const searchRes = await fetch(
    `${YT_API}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=28&maxResults=15&order=relevance`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!searchRes.ok) throw new Error(`YouTube search error: ${searchRes.status}`);
  const searchData = await searchRes.json();
  const videoIds = searchData.items.map((item: { id: { videoId: string } }) => item.id.videoId);
  if (videoIds.length === 0) return [];
  const detailRes = await fetch(
    `${YT_API}/videos?part=snippet,statistics&id=${videoIds.join(",")}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!detailRes.ok) throw new Error(`YouTube detail error: ${detailRes.status}`);
  const detailData = await detailRes.json();
  return (detailData.items as YTVideo[]).map(toTrendItem);
}
