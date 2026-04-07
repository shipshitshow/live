import type { TrendItem } from "@/lib/trends-types";

const X_API = "https://api.twitter.com/2";

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

function toTrendItem(tweet: XTweet, userMap: Map<string, XUser>): TrendItem {
  const user = userMap.get(tweet.author_id);
  const engagement = tweet.public_metrics.like_count + tweet.public_metrics.retweet_count + tweet.public_metrics.quote_count;
  return {
    id: `x-${tweet.id}`,
    title: tweet.text.slice(0, 280),
    url: user ? `https://x.com/${user.username}/status/${tweet.id}` : `https://x.com/i/status/${tweet.id}`,
    source: "x",
    score: engagement,
    commentCount: tweet.public_metrics.reply_count,
    timestamp: tweet.created_at,
    author: user?.name || user?.username,
  };
}

function hasXCredentials(): boolean {
  return !!process.env.X_BEARER_TOKEN;
}

export async function fetchXTrending(): Promise<TrendItem[]> {
  if (!hasXCredentials()) return [];
  const token = process.env.X_BEARER_TOKEN;
  const query = "(AI OR LLM OR GPT OR Claude OR \"machine learning\" OR \"open source AI\") -is:retweet lang:en";
  const url = `${X_API}/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=25&sort_order=relevancy&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=username,name`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`X API error: ${res.status}`);
  const data = await res.json();
  const userMap = new Map<string, XUser>();
  if (data.includes?.users) {
    for (const user of data.includes.users) {
      userMap.set(user.id, user);
    }
  }
  return (data.data as XTweet[] || []).map((tweet) => toTrendItem(tweet, userMap));
}

export async function searchX(query: string): Promise<TrendItem[]> {
  if (!hasXCredentials()) return [];
  const token = process.env.X_BEARER_TOKEN;
  const fullQuery = `(${query}) -is:retweet lang:en`;
  const url = `${X_API}/tweets/search/recent?query=${encodeURIComponent(fullQuery)}&max_results=20&sort_order=relevancy&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=username,name`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`X search error: ${res.status}`);
  const data = await res.json();
  const userMap = new Map<string, XUser>();
  if (data.includes?.users) {
    for (const user of data.includes.users) {
      userMap.set(user.id, user);
    }
  }
  return (data.data as XTweet[] || []).map((tweet) => toTrendItem(tweet, userMap));
}
