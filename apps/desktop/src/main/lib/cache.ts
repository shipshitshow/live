import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CACHE_PREFIX = 'yt-cache:';
const RUNTIME_DIR = path.join(
  process.env.SHIPSHIT_RUNTIME_DIR ?? os.tmpdir(),
  'shipshitshow-desktop',
);
const LOCAL_CACHE_DIR = path.join(RUNTIME_DIR, 'cache');

interface LocalCacheEntry<T> {
  data: T;
  expiresAt: number;
}

function getLocalCacheFilePath(key: string) {
  const hash = createHash('sha1').update(key).digest('hex');
  return path.join(LOCAL_CACHE_DIR, `${hash}.json`);
}

function readLocalCache<T>(key: string): T | null {
  try {
    const filePath = getLocalCacheFilePath(key);
    if (!fs.existsSync(filePath)) return null;

    const raw = fs.readFileSync(filePath, 'utf8');
    const entry = JSON.parse(raw) as LocalCacheEntry<T>;

    if (!entry.expiresAt || Date.now() >= entry.expiresAt) {
      fs.rmSync(filePath, { force: true });
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

function writeLocalCache<T>(key: string, data: T, ttlSeconds: number) {
  try {
    fs.mkdirSync(LOCAL_CACHE_DIR, { recursive: true });
    const filePath = getLocalCacheFilePath(key);
    const entry: LocalCacheEntry<T> = {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    };
    fs.writeFileSync(filePath, JSON.stringify(entry), 'utf8');
  } catch {
    // Local cache is best-effort only.
  }
}

export async function cachedFetch<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cacheKey = `${CACHE_PREFIX}${key}`;

  const localCached = readLocalCache<T>(cacheKey);
  if (localCached !== null) return localCached;

  const data = await fetcher();
  writeLocalCache(cacheKey, data, ttlSeconds);

  return data;
}

export const TTL = {
  CHANNEL_STATS: 3600,
  DAILY_METRICS: 900,
  TREND_DISCOVERY: 900,
  TREND_SEARCH: 1800,
  VIDEO_ANALYTICS: 1800,
  VIDEO_LIST: 1800,
} as const;
