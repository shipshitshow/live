import type {
  TrendItem,
  TrendSource,
  TrendSourceStatus,
  TrendsResponse,
  TrendsSearchResponse,
} from '@shipshitshow/types';
import { withShowFitItems } from './fit';
import { dedupeTrendItems, sortTrendSearchItems } from './items';
import { sortTrendItems } from './ranking';
import { isAIRelevant } from './relevance';

export type TrendFetcher = () => Promise<TrendItem[]>;
export type TrendFetcherEntry = readonly [TrendSource, TrendFetcher];

export async function buildTrendsResponse(
  fetchers: readonly TrendFetcherEntry[],
): Promise<TrendsResponse> {
  const sources: Record<TrendSource, TrendSourceStatus> = {
    hackernews: 'error',
    reddit: 'error',
    x: 'error',
    youtube: 'error',
  };

  const results = await Promise.allSettled(
    fetchers.map(async ([source, fetcher]) => {
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

  return {
    fetchedAt: new Date().toISOString(),
    items: sortTrendItems(
      withShowFitItems(dedupeTrendItems(items).filter(isAIRelevant)),
    ),
    sources,
  };
}

export async function buildTrendsSearchResponse(
  query: string,
  searchers: TrendFetcher[],
): Promise<TrendsSearchResponse> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return {
      items: [],
      query: trimmedQuery,
    };
  }

  const results = await Promise.allSettled(
    searchers.map((searcher) => searcher()),
  );

  const items: TrendItem[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      items.push(...result.value);
    }
  }

  return {
    items: sortTrendSearchItems(withShowFitItems(dedupeTrendItems(items))),
    query: trimmedQuery,
  };
}
