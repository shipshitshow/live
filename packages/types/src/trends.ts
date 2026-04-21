export type TrendSource = 'hackernews' | 'reddit' | 'youtube' | 'x';

export interface TrendItem {
  id: string;
  title: string;
  url: string;
  source: TrendSource;
  score: number;
  commentCount: number;
  timestamp: string;
  summary?: string;
  subreddit?: string;
  author?: string;
  thumbnail?: string;
}

export interface TrendsResponse {
  items: TrendItem[];
  fetchedAt: string;
  sources: Record<TrendSource, 'ok' | 'error'>;
}

export interface TrendsSearchResponse {
  items: TrendItem[];
  query: string;
}
