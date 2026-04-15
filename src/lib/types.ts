export interface ChannelStats {
  channel_id: string;
  channel_title: string;
  subscriber_count: number;
  total_views: number;
  total_videos: number;
}

export type VideoType = "video" | "short" | "livestream";

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
  channel_id?: string;
  channel_label?: string; // "main" | "clips"
  video_type?: VideoType;
  thumbnail_url?: string;
}

export interface DailyMetric {
  day: string;
  views: number;
  watch_time_minutes: number;
  subscribers_gained: number;
  avg_view_duration_seconds: number;
  avg_view_percentage: number;
  likes: number;
}

// Legacy single-channel report
export interface AnalyticsReport {
  channel: ChannelStats;
  videos: VideoStats[];
  daily_metrics: DailyMetric[];
}

// Multi-channel report
export interface MultiChannelReport {
  channels: ChannelStats[];
  videos: VideoStats[];
  daily_metrics: DailyMetric[];
  per_channel: Record<
    string,
    {
      channel: ChannelStats;
      videos: VideoStats[];
      daily_metrics: DailyMetric[];
    }
  >;
}

export type ChannelFilter = "all" | string;

export type DateRange = 7 | 30 | 90;

export interface YouTubeCommentReply {
  id: string;
  text: string;
  authorDisplayName: string;
  authorProfileImageUrl: string | null;
  publishedAt: string;
  updatedAt: string;
  likeCount: number;
}

export interface YouTubeCommentThread {
  id: string;
  commentId: string;
  channelId: string;
  channelLabel: string;
  videoId: string;
  videoTitle: string;
  text: string;
  authorDisplayName: string;
  authorProfileImageUrl: string | null;
  publishedAt: string;
  updatedAt: string;
  likeCount: number;
  totalReplyCount: number;
  canReply: boolean;
  viewerRating: string;
  replies: YouTubeCommentReply[];
}

export interface YouTubeCommentListResponse {
  items: YouTubeCommentThread[];
  fetchedAt: string;
}

export interface CommentReplyDraftResponse {
  drafts: string[];
}
