import {
  fetchHNTrending,
  fetchRedditTrending,
  fetchXTrending,
  fetchYouTubeTrending,
  searchHN,
  searchReddit,
  searchX,
  searchYouTube,
} from '@shipshitshow/talking-points';
import type { TrendItem } from '@shipshitshow/types';
import {
  getAccessToken,
  getChannelConfigs,
  hasYouTubeCredentials,
} from '@/lib/youtube/token';

async function getYouTubeAccessToken(): Promise<string | null> {
  if (!hasYouTubeCredentials()) return null;

  const configs = await getChannelConfigs();
  if (configs.length === 0) return null;

  try {
    return await getAccessToken(configs[0]);
  } catch {
    return null;
  }
}

function getXBearerToken(): string | null {
  return process.env.X_BEARER_TOKEN ?? null;
}

function getYouTubeApiKey(): string | null {
  return process.env.YOUTUBE_API_KEY ?? null;
}

export async function fetchAppHNTrending(): Promise<TrendItem[]> {
  return fetchHNTrending();
}

export async function searchAppHN(query: string): Promise<TrendItem[]> {
  return searchHN(query);
}

export async function fetchAppRedditTrending(): Promise<TrendItem[]> {
  return fetchRedditTrending();
}

export async function searchAppReddit(query: string): Promise<TrendItem[]> {
  return searchReddit(query);
}

export async function fetchAppXTrending(): Promise<TrendItem[]> {
  const bearerToken = getXBearerToken();
  if (!bearerToken) return [];

  return fetchXTrending({ bearerToken });
}

export async function searchAppX(query: string): Promise<TrendItem[]> {
  const bearerToken = getXBearerToken();
  if (!bearerToken) return [];

  return searchX(query, { bearerToken });
}

export async function fetchAppYouTubeTrending(): Promise<TrendItem[]> {
  const accessToken = await getYouTubeAccessToken();
  const apiKey = getYouTubeApiKey();
  if (!accessToken && !apiKey) return [];

  return fetchYouTubeTrending({
    accessToken: accessToken ?? undefined,
    apiKey: apiKey ?? undefined,
  });
}

export async function searchAppYouTube(query: string): Promise<TrendItem[]> {
  const accessToken = await getYouTubeAccessToken();
  const apiKey = getYouTubeApiKey();
  if (!accessToken && !apiKey) return [];

  return searchYouTube(query, {
    accessToken: accessToken ?? undefined,
    apiKey: apiKey ?? undefined,
  });
}
