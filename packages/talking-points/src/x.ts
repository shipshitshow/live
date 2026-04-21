import type { TrendItem } from '@shipshitshow/types';
import { dedupeTrendItems, slugify } from './items';
import { isAIRelevant } from './relevance';

const X_API = 'https://api.x.com/2';
const DEFAULT_WOEIDS = [1, 23424977];
const FALLBACK_AI_QUERIES = [
  {
    options: { maxResults: 20, sortOrder: 'relevancy' as const },
    query:
      '(AI OR LLM OR GPT OR Claude OR OpenAI OR Anthropic OR Gemini OR Cursor) -is:retweet lang:en',
  },
  {
    options: { maxResults: 20, sortOrder: 'recency' as const },
    query:
      '("AI agents" OR "vibe coding" OR "Claude Code" OR "local llm" OR "open source AI") -is:retweet lang:en',
  },
  {
    options: { maxResults: 20, sortOrder: 'relevancy' as const },
    query:
      '("AI backlash" OR "AI slop" OR benchmark OR launch OR demo OR jailbreak) -is:retweet lang:en',
  },
];

interface XTweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

interface XUser {
  id: string;
  username: string;
  name: string;
}

interface XTrend {
  trend_name: string;
  tweet_count?: number;
}

interface XSearchOptions {
  maxResults?: number;
  sortOrder?: 'recency' | 'relevancy';
}

export interface XSourceOptions {
  bearerToken: string;
  maxTrendTopics?: number;
  woeids?: number[];
}

function getTweetEngagement(tweet: XTweet): number {
  return (
    tweet.public_metrics.like_count +
    tweet.public_metrics.retweet_count +
    tweet.public_metrics.quote_count
  );
}

function createUserMap(data: {
  includes?: { users?: XUser[] };
}): Map<string, XUser> {
  const userMap = new Map<string, XUser>();

  for (const user of data.includes?.users ?? []) {
    userMap.set(user.id, user);
  }

  return userMap;
}

function toTweetTrendItem(
  tweet: XTweet,
  userMap: Map<string, XUser>,
): TrendItem {
  const user = userMap.get(tweet.author_id);

  return {
    author: user?.name || user?.username,
    commentCount: tweet.public_metrics.reply_count,
    id: `x-${tweet.id}`,
    score: getTweetEngagement(tweet),
    source: 'x',
    timestamp: tweet.created_at,
    title: tweet.text.slice(0, 280),
    url: user
      ? `https://x.com/${user.username}/status/${tweet.id}`
      : `https://x.com/i/status/${tweet.id}`,
  };
}

function buildTrendTopicQuery(trendName: string): string {
  const trimmed = trendName.replace(/"/g, '').trim();
  if (!trimmed) return '-is:retweet lang:en';
  if (trimmed.startsWith('#')) return `${trimmed} -is:retweet lang:en`;
  return `"${trimmed}" -is:retweet lang:en`;
}

async function fetchXQuery(
  bearerToken: string,
  query: string,
  { maxResults = 20, sortOrder = 'relevancy' }: XSearchOptions = {},
): Promise<TrendItem[]> {
  const url = `${X_API}/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${maxResults}&sort_order=${sortOrder}&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=username,name`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${bearerToken}` },
  });

  if (!res.ok) {
    throw new Error(`X API error: ${res.status}`);
  }

  const data = await res.json();
  const userMap = createUserMap(data);

  return ((data.data as XTweet[] | undefined) ?? []).map((tweet) =>
    toTweetTrendItem(tweet, userMap),
  );
}

async function fetchTrendTopicsForWoeid(
  bearerToken: string,
  woeid: number,
  maxTrends = 20,
): Promise<XTrend[]> {
  const url = `${X_API}/trends/by/woeid/${woeid}?max_trends=${maxTrends}&trend.fields=trend_name,tweet_count`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${bearerToken}` },
  });

  if (!res.ok) {
    throw new Error(`X trends error for ${woeid}: ${res.status}`);
  }

  const data = await res.json();
  return (data.data as XTrend[] | undefined) ?? [];
}

async function hydrateTrendTopic(
  bearerToken: string,
  trend: XTrend,
): Promise<TrendItem | null> {
  const items = await fetchXQuery(
    bearerToken,
    buildTrendTopicQuery(trend.trend_name),
    { maxResults: 10, sortOrder: 'relevancy' },
  );

  const topItem = items.find((item) => isAIRelevant(item));
  if (!topItem) return null;

  return {
    ...topItem,
    id: `x-trend-${slugify(trend.trend_name, 80)}-${topItem.id}`,
    summary: `Trend topic: ${trend.trend_name}\n\n${topItem.title}`,
  };
}

async function fetchFallbackAIItems(bearerToken: string): Promise<TrendItem[]> {
  const results = await Promise.all(
    FALLBACK_AI_QUERIES.map(({ query, options }) =>
      fetchXQuery(bearerToken, query, options),
    ),
  );

  return dedupeTrendItems(results.flat());
}

export async function fetchXTrending({
  bearerToken,
  maxTrendTopics = 10,
  woeids = DEFAULT_WOEIDS,
}: XSourceOptions): Promise<TrendItem[]> {
  const trendResults = await Promise.allSettled(
    woeids.map((woeid) =>
      fetchTrendTopicsForWoeid(bearerToken, woeid, maxTrendTopics),
    ),
  );

  const topics = new Map<string, XTrend>();
  for (const result of trendResults) {
    if (result.status !== 'fulfilled') continue;

    for (const trend of result.value) {
      if (
        !isAIRelevant({
          commentCount: 0,
          id: trend.trend_name,
          score: trend.tweet_count ?? 0,
          source: 'x',
          timestamp: new Date().toISOString(),
          title: trend.trend_name,
          url: `https://x.com/search?q=${encodeURIComponent(trend.trend_name)}`,
        })
      ) {
        continue;
      }

      if (!topics.has(trend.trend_name)) {
        topics.set(trend.trend_name, trend);
      }
    }
  }

  const hydrated = await Promise.all(
    Array.from(topics.values())
      .slice(0, maxTrendTopics)
      .map((trend) => hydrateTrendTopic(bearerToken, trend)),
  );

  const items = hydrated.filter((item): item is TrendItem => item !== null);
  if (items.length > 0) {
    return dedupeTrendItems(items);
  }

  return fetchFallbackAIItems(bearerToken);
}

export async function searchX(
  query: string,
  { bearerToken }: XSourceOptions,
): Promise<TrendItem[]> {
  const trimmedQuery = query.trim();
  const exactQuery = `"${trimmedQuery.replace(/"/g, '')}"`;
  const queries = [
    {
      options: { maxResults: 20, sortOrder: 'relevancy' as const },
      query: `${exactQuery} -is:retweet lang:en`,
    },
    {
      options: { maxResults: 20, sortOrder: 'relevancy' as const },
      query: `(${trimmedQuery}) (AI OR LLM OR GPT OR Claude OR OpenAI OR Anthropic OR Cursor OR Gemini) -is:retweet lang:en`,
    },
    {
      options: { maxResults: 15, sortOrder: 'recency' as const },
      query: `(${trimmedQuery}) (thread OR launch OR demo OR benchmark OR backlash OR reaction) -is:retweet lang:en`,
    },
  ];

  const results = await Promise.all(
    queries.map(({ query: xQuery, options }) =>
      fetchXQuery(bearerToken, xQuery, options),
    ),
  );

  return dedupeTrendItems(results.flat());
}
