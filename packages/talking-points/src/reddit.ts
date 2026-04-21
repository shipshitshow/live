import type { TrendItem } from '@shipshitshow/types';

const REDDIT_BASE = 'https://www.reddit.com';
const DEFAULT_SUBREDDITS = [
  'artificial',
  'LocalLLaMA',
  'machinelearning',
  'singularity',
];
const DEFAULT_USER_AGENT = 'ShipShitShow/1.0';

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

export interface RedditSourceOptions {
  limit?: number;
  subreddits?: string[];
  userAgent?: string;
}

function decodeHtmlEntities(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&#x27;', "'")
    .replaceAll('&quot;', '"');
}

function isDirectImageUrl(value: string | undefined): boolean {
  if (!value) return false;
  return /\.(avif|gif|jpe?g|png|webp)$/i.test(value.split('?')[0]);
}

function toOriginalRedditImage(value: string): string {
  try {
    const url = new URL(value);
    if (url.hostname === 'preview.redd.it') {
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
  if (!thumbnail?.startsWith('http')) return undefined;

  return toOriginalRedditImage(thumbnail);
}

function toTrendItem(post: RedditPost): TrendItem {
  return {
    author: post.author,
    commentCount: post.num_comments,
    id: `reddit-${post.id}`,
    score: post.score,
    source: 'reddit',
    subreddit: post.subreddit,
    summary: post.selftext?.slice(0, 200) || undefined,
    thumbnail: pickThumbnail(post),
    timestamp: new Date(post.created_utc * 1000).toISOString(),
    title: post.title,
    url: post.url.startsWith('/') ? `${REDDIT_BASE}${post.url}` : post.url,
  };
}

async function fetchSubreddit(
  subreddit: string,
  { limit = 15, userAgent = DEFAULT_USER_AGENT }: RedditSourceOptions = {},
): Promise<RedditPost[]> {
  const res = await fetch(`${REDDIT_BASE}/r/${subreddit}/hot.json?limit=${limit}`, {
    headers: { 'User-Agent': userAgent },
  });
  if (!res.ok) {
    throw new Error(`Reddit API error for r/${subreddit}: ${res.status}`);
  }

  const data = await res.json();
  return data.data.children.map((child: { data: RedditPost }) => child.data);
}

export async function fetchRedditTrending(
  options: RedditSourceOptions = {},
): Promise<TrendItem[]> {
  const subreddits = options.subreddits ?? DEFAULT_SUBREDDITS;
  const results = await Promise.allSettled(
    subreddits.map((subreddit) => fetchSubreddit(subreddit, options)),
  );

  const seen = new Set<string>();
  const items: TrendItem[] = [];

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;

    for (const post of result.value) {
      if (seen.has(post.id)) continue;
      seen.add(post.id);
      items.push(toTrendItem(post));
    }
  }

  return items;
}

export async function searchReddit(
  query: string,
  options: RedditSourceOptions = {},
): Promise<TrendItem[]> {
  const subreddits = options.subreddits ?? DEFAULT_SUBREDDITS;
  const userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
  const limit = options.limit ?? 20;
  const sub = subreddits.join('+');
  const url = `${REDDIT_BASE}/r/${sub}/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=week&limit=${limit}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': userAgent },
  });
  if (!res.ok) throw new Error(`Reddit search error: ${res.status}`);

  const data = await res.json();
  return data.data.children.map((child: { data: RedditPost }) =>
    toTrendItem(child.data),
  );
}
