import {
  fetchHNTrending,
  fetchRedditTrending,
  fetchYouTubeTrending,
  searchHN,
  searchReddit,
  searchX,
  searchYouTube,
} from '@shipshitshow/talking-points';
import type { TrendItem } from '@shipshitshow/types';
import { cachedFetch, TTL } from './cache';

function getXBearerToken(): string | null {
  return process.env.X_BEARER_TOKEN ?? null;
}

function getYouTubeApiKey(): string | null {
  return process.env.YOUTUBE_API_KEY ?? null;
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export async function fetchDesktopHNTrending(): Promise<TrendItem[]> {
  return cachedFetch(
    'desktop:trends:hackernews:feed',
    TTL.TREND_DISCOVERY,
    () => fetchHNTrending(),
  );
}

export async function searchDesktopHN(query: string): Promise<TrendItem[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  return cachedFetch(
    `desktop:trends:hackernews:search:${normalizeQuery(trimmedQuery)}`,
    TTL.TREND_SEARCH,
    () => searchHN(trimmedQuery),
  );
}

export async function fetchDesktopRedditTrending(): Promise<TrendItem[]> {
  return cachedFetch('desktop:trends:reddit:feed', TTL.TREND_DISCOVERY, () =>
    fetchRedditTrending(),
  );
}

export async function searchDesktopReddit(query: string): Promise<TrendItem[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  return cachedFetch(
    `desktop:trends:reddit:search:${normalizeQuery(trimmedQuery)}`,
    TTL.TREND_SEARCH,
    () => searchReddit(trimmedQuery),
  );
}

export async function fetchDesktopYouTubeTrending(): Promise<TrendItem[]> {
  const apiKey = getYouTubeApiKey();
  if (!apiKey) return [];

  return cachedFetch('desktop:trends:youtube:feed', TTL.TREND_DISCOVERY, () =>
    fetchYouTubeTrending({ apiKey }),
  );
}

export async function searchDesktopYouTube(
  query: string,
): Promise<TrendItem[]> {
  const trimmedQuery = query.trim();
  const apiKey = getYouTubeApiKey();
  if (!trimmedQuery || !apiKey) return [];

  return cachedFetch(
    `desktop:trends:youtube:search:${normalizeQuery(trimmedQuery)}`,
    TTL.TREND_SEARCH,
    () => searchYouTube(trimmedQuery, { apiKey }),
  );
}

export async function searchDesktopX(query: string): Promise<TrendItem[]> {
  const trimmedQuery = query.trim();
  const bearerToken = getXBearerToken();
  if (!trimmedQuery || !bearerToken) return [];

  return cachedFetch(
    `desktop:trends:x:search:${normalizeQuery(trimmedQuery)}`,
    TTL.TREND_SEARCH,
    () => searchX(trimmedQuery, { bearerToken }),
  );
}
