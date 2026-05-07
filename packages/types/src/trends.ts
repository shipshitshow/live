export type TrendSource = 'hackernews' | 'reddit' | 'youtube' | 'x';
export type TrendSourceStatus = 'ok' | 'error' | 'manual';

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
  showScore?: number;
  showReasons?: string[];
}

export interface TrendsResponse {
  items: TrendItem[];
  fetchedAt: string;
  sources: Record<TrendSource, TrendSourceStatus>;
}

export interface TrendsSearchResponse {
  items: TrendItem[];
  query: string;
}
