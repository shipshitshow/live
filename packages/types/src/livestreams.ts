export type TopicStatus = 'draft' | 'backlog' | 'in_progress' | 'done';

export type ContentField =
  | 'thumbnail_v1'
  | 'thumbnail_v2'
  | 'thumbnail_v3'
  | 'youtube_title'
  | 'youtube_description'
  | 'linkedin_post'
  | 'livestream_tweet'
  | 'recap_tweet';

export const CONTENT_FIELDS: ContentField[] = [
  'thumbnail_v1',
  'thumbnail_v2',
  'thumbnail_v3',
  'youtube_title',
  'youtube_description',
  'linkedin_post',
  'livestream_tweet',
  'recap_tweet',
];

export interface TopicFrontmatter {
  announcement_tweet: string | null;
  title: string;
  slug: string;
  source: string;
  status: TopicStatus;
  date: string;
  thumbnail_prompt: string | null;
}

export interface TopicGeneratedContent {
  thumbnail_v1: string | null;
  thumbnail_v2: string | null;
  thumbnail_v3: string | null;
  youtube_title: string | null;
  youtube_description: string | null;
  linkedin_post: string | null;
  livestream_tweet: string | null;
  recap_tweet: string | null;
}

export interface Topic extends TopicFrontmatter {
  content: string;
  generated: TopicGeneratedContent;
  fileName: string;
}

export interface TopicDrawingResponse {
  scene: Record<string, unknown> | null;
  updatedAt: string | null;
}

export interface TopicUpdate {
  status?: TopicStatus;
  thumbnail_prompt?: string | null;
  generated?: Partial<TopicGeneratedContent>;
}

export interface LivestreamListResponse {
  topics: Topic[];
  requestedDate: string;
  resolvedDate: string;
  availableDates: string[];
  isFallback: boolean;
}
