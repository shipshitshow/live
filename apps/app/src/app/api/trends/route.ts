import type {
  TrendItem,
  TrendSource,
  TrendsResponse,
} from '@shipshitshow/types';
import { NextResponse } from 'next/server';
import { fetchHNTrending } from '@/lib/trends/hackernews';
import { sortTrendItems } from '@/lib/trends/ranking';
import { fetchRedditTrending } from '@/lib/trends/reddit';
import { isAIRelevant } from '@/lib/trends/relevance';
import { fetchXTrending } from '@/lib/trends/x';
import { fetchYouTubeTrending } from '@/lib/trends/youtube';

type Fetcher = () => Promise<TrendItem[]>;

const FETCHERS: [TrendSource, Fetcher][] = [
  ['hackernews', fetchHNTrending],
  ['reddit', fetchRedditTrending],
  ['youtube', fetchYouTubeTrending],
  ['x', fetchXTrending],
];

export async function GET() {
  const sources: Record<TrendSource, 'ok' | 'error'> = {
    hackernews: 'error',
    reddit: 'error',
    x: 'error',
    youtube: 'error',
  };

  const results = await Promise.allSettled(
    FETCHERS.map(async ([source, fetcher]) => {
      const items = await fetcher();
      sources[source] = 'ok';
      return items;
    }),
  );

  const items: TrendItem[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      items.push(...result.value);
    }
  }

  const response: TrendsResponse = {
    fetchedAt: new Date().toISOString(),
    items: sortTrendItems(items.filter(isAIRelevant)),
    sources,
  };

  return NextResponse.json(response, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
  });
}
