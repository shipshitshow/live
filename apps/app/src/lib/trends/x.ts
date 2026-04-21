import type { TrendItem } from '@shipshitshow/types';

const X_API = 'https://api.twitter.com/2';

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

interface XSearchOptions {
  maxResults?: number;
  sortOrder?: 'recency' | 'relevancy';
}

function toTrendItem(tweet: XTweet, userMap: Map<string, XUser>): TrendItem {
  const user = userMap.get(tweet.author_id);
  const engagement =
    tweet.public_metrics.like_count +
    tweet.public_metrics.retweet_count +
    tweet.public_metrics.quote_count;
  return {
    author: user?.name || user?.username,
    commentCount: tweet.public_metrics.reply_count,
    id: `x-${tweet.id}`,
    score: engagement,
    source: 'x',
    timestamp: tweet.created_at,
    title: tweet.text.slice(0, 280),
    url: user
      ? `https://x.com/${user.username}/status/${tweet.id}`
      : `https://x.com/i/status/${tweet.id}`,
  };
}

function hasXCredentials(): boolean {
  return !!process.env.X_BEARER_TOKEN;
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

async function fetchXQuery(
  query: string,
  { maxResults = 20, sortOrder = 'relevancy' }: XSearchOptions = {},
): Promise<TrendItem[]> {
  const token = process.env.X_BEARER_TOKEN;
  const url = `${X_API}/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${maxResults}&sort_order=${sortOrder}&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=username,name`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`X API error: ${res.status}`);
  }

  const data = await res.json();
  const userMap = createUserMap(data);
  return ((data.data as XTweet[] | undefined) ?? []).map((tweet) =>
    toTrendItem(tweet, userMap),
  );
}

function dedupeTweets(items: TrendItem[]): TrendItem[] {
  const unique = new Map<string, TrendItem>();
  for (const item of items) {
    if (!unique.has(item.id)) {
      unique.set(item.id, item);
    }
  }
  return Array.from(unique.values());
}

export async function fetchXTrending(): Promise<TrendItem[]> {
  if (!hasXCredentials()) return [];
  const queries = [
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

  const results = await Promise.all(
    queries.map(({ query, options }) => fetchXQuery(query, options)),
  );
  return dedupeTweets(results.flat());
}

export async function searchX(query: string): Promise<TrendItem[]> {
  if (!hasXCredentials()) return [];
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
    queries.map(({ query: xQuery, options }) => fetchXQuery(xQuery, options)),
  );
  return dedupeTweets(results.flat());
}
