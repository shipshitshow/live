import type { TrendItem } from "@/lib/trends-types";

const SUBREDDITS = ["artificial", "LocalLLaMA", "machinelearning", "singularity"];
const REDDIT_BASE = "https://www.reddit.com";

interface RedditPost {
  id: string;
  title: string;
  url: string;
  score: number;
  num_comments: number;
  created_utc: number;
  author: string;
  selftext: string;
  subreddit: string;
  thumbnail: string;
  permalink: string;
}

function toTrendItem(post: RedditPost): TrendItem {
  return {
    id: `reddit-${post.id}`,
    title: post.title,
    url: post.url.startsWith("/") ? `${REDDIT_BASE}${post.url}` : post.url,
    source: "reddit",
    score: post.score,
    commentCount: post.num_comments,
    timestamp: new Date(post.created_utc * 1000).toISOString(),
    summary: post.selftext?.slice(0, 200) || undefined,
    author: post.author,
    subreddit: post.subreddit,
    thumbnail: post.thumbnail?.startsWith("http") ? post.thumbnail : undefined,
  };
}

async function fetchSubreddit(subreddit: string): Promise<RedditPost[]> {
  const res = await fetch(`${REDDIT_BASE}/r/${subreddit}/hot.json?limit=15`, {
    headers: { "User-Agent": "ShipShitShow/1.0" },
  });
  if (!res.ok) throw new Error(`Reddit API error for r/${subreddit}: ${res.status}`);
  const data = await res.json();
  return data.data.children.map((c: { data: RedditPost }) => c.data);
}

export async function fetchRedditTrending(): Promise<TrendItem[]> {
  const results = await Promise.allSettled(SUBREDDITS.map(fetchSubreddit));
  const posts: RedditPost[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") posts.push(...r.value);
  }
  const seen = new Set<string>();
  const unique = posts.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
  return unique.map(toTrendItem);
}

export async function searchReddit(query: string): Promise<TrendItem[]> {
  const sub = SUBREDDITS.join("+");
  const url = `${REDDIT_BASE}/r/${sub}/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=week&limit=20`;
  const res = await fetch(url, {
    headers: { "User-Agent": "ShipShitShow/1.0" },
  });
  if (!res.ok) throw new Error(`Reddit search error: ${res.status}`);
  const data = await res.json();
  return data.data.children.map((c: { data: RedditPost }) => toTrendItem(c.data));
}
