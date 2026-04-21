import type { TrendItem } from "@shipshitshow/types";

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
  url_overridden_by_dest?: string;
  preview?: {
    images?: Array<{
      source?: {
        url?: string;
      };
    }>;
  };
}

function decodeHtmlEntities(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&#x27;", "'")
    .replaceAll("&quot;", '"');
}

function isDirectImageUrl(value: string | undefined): boolean {
  if (!value) return false;
  return /\.(avif|gif|jpe?g|png|webp)$/i.test(value.split("?")[0]);
}

function toOriginalRedditImage(value: string): string {
  try {
    const url = new URL(value);
    if (url.hostname === "preview.redd.it") {
      return `https://i.redd.it${url.pathname}`;
    }
  } catch {
    return value;
  }
  return value;
}

function pickThumbnail(post: RedditPost): string | undefined {
  const previewSource = decodeHtmlEntities(post.preview?.images?.[0]?.source?.url);
  if (previewSource) return previewSource;

  const overridden = decodeHtmlEntities(post.url_overridden_by_dest);
  if (isDirectImageUrl(overridden)) return overridden;

  const thumbnail = decodeHtmlEntities(post.thumbnail);
  if (!thumbnail?.startsWith("http")) return undefined;

  return toOriginalRedditImage(thumbnail);
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
    thumbnail: pickThumbnail(post),
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
