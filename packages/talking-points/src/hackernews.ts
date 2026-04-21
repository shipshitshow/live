import type { TrendItem } from '@shipshitshow/types';

const HN_FRONT_PAGE =
  'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30';
const HN_SEARCH = 'https://hn.algolia.com/api/v1/search';

interface HNHit {
  objectID: string;
  title: string;
  url: string | null;
  points: number;
  num_comments: number;
  created_at: string;
  author: string;
  story_text: string | null;
}

function toTrendItem(hit: HNHit): TrendItem {
  return {
    author: hit.author,
    commentCount: hit.num_comments,
    id: `hn-${hit.objectID}`,
    score: hit.points,
    source: 'hackernews',
    summary: hit.story_text?.slice(0, 200) || undefined,
    timestamp: hit.created_at,
    title: hit.title,
    url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
  };
}

export async function fetchHNTrending(): Promise<TrendItem[]> {
  const res = await fetch(HN_FRONT_PAGE);
  if (!res.ok) throw new Error(`HN API error: ${res.status}`);

  const data = await res.json();
  return (data.hits as HNHit[]).map(toTrendItem);
}

export async function searchHN(query: string): Promise<TrendItem[]> {
  const url = `${HN_SEARCH}?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=20`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HN search error: ${res.status}`);

  const data = await res.json();
  return (data.hits as HNHit[]).map(toTrendItem);
}
