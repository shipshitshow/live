export interface ChannelStats {
  channel_id: string;
  channel_title: string;
  subscriber_count: number;
  total_views: number;
  total_videos: number;
}

export interface VideoStats {
  video_id: string;
  title: string;
  published_at: string;
  views: number;
  likes: number;
  comments: number;
  impressions: number;
  ctr: number;
  watch_time_minutes: number;
  avg_view_duration_seconds: number;
}

export interface DailyMetric {
  day: string;
  views: number;
  watch_time_minutes: number;
  subscribers_gained: number;
  impressions: number;
  ctr: number;
}

export interface AnalyticsReport {
  channel: ChannelStats;
  videos: VideoStats[];
  daily_metrics: DailyMetric[];
}

export type DateRange = 7 | 30 | 90;
