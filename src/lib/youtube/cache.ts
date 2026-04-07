import { kv } from "@vercel/kv";

const CACHE_PREFIX = "yt-cache:";

export async function cachedFetch<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cacheKey = `${CACHE_PREFIX}${key}`;

  // Try cache
  try {
    const cached = await kv.get<T>(cacheKey);
    if (cached !== null && cached !== undefined) return cached;
  } catch {
    // KV not available — fetch directly
  }

  const data = await fetcher();

  // Store in cache
  try {
    await kv.set(cacheKey, data, { ex: ttlSeconds });
  } catch {
    // KV not available — data still returned
  }

  return data;
}

// TTL constants
export const TTL = {
  CHANNEL_STATS: 3600,     // 1 hour
  VIDEO_LIST: 1800,        // 30 minutes
  DAILY_METRICS: 900,      // 15 minutes
  VIDEO_ANALYTICS: 1800,   // 30 minutes
} as const;
