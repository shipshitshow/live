import type {
  PipelineJob,
  Topic,
  TopicStatus,
  TrendsResponse,
  TrendsSearchResponse,
  UnlistedVideo,
  YouTubeCommentReply,
  YouTubeCommentThread,
} from '@shipshitshow/types';

interface TopicCreateInput {
  title: string;
  slug: string;
  source: string;
  date: string;
  content: string;
}

interface TopicListItem {
  title: string;
  slug: string;
  status: string;
  fileName: string;
}

interface TerminalSpawnResult {
  cwd: string;
  error: string | null;
  pid: number | null;
  shell: string;
}

interface TerminalAPI {
  kill: () => Promise<void>;
  onData: (cb: (data: string) => void) => () => void;
  onExit: (cb: (exitCode: number) => void) => () => void;
  resize: (cols: number, rows: number) => Promise<void>;
  spawn: (cols: number, rows: number) => Promise<TerminalSpawnResult>;
  subscribe: () => void;
  write: (data: string) => Promise<void>;
}

interface TopicsAPI {
  create: (data: TopicCreateInput) => Promise<{ fileName: string }>;
  list: (date: string) => Promise<Topic[]>;
  listDates: () => Promise<string[]>;
  read: (date: string, fileName: string) => Promise<string>;
  updateGenerated: (
    date: string,
    slug: string,
    generated: Record<string, string>,
  ) => Promise<void>;
  updateStatus: (
    date: string,
    slug: string,
    status: TopicStatus,
  ) => Promise<void>;
}

interface TrendsAPI {
  fetch: () => Promise<TrendsResponse>;
  search: (query: string) => Promise<TrendsSearchResponse>;
  searchX: (query: string) => Promise<TrendsSearchResponse>;
}

interface VideoContentInput {
  title: string;
  videoType: 'video' | 'short';
  channelLabel: string;
  duration: number;
}

interface VideoGeneratedContent {
  titles: string[];
  youtubeDescription: string;
  linkedinPost: string;
  announcementTweet: string;
  recapTweet: string;
}

interface PipelineAPI {
  getJob: (jobId: string) => Promise<PipelineJob>;
  listJobs: (status?: string) => Promise<PipelineJob[]>;
  reviewJob: (
    jobId: string,
    action: string,
    reason?: string,
  ) => Promise<PipelineJob>;
}

interface ReviewAPI {
  generateContent: (input: VideoContentInput) => Promise<VideoGeneratedContent>;
  listVideos: () => Promise<UnlistedVideo[]>;
  regenerateField: (
    input: VideoContentInput,
    field: keyof VideoGeneratedContent,
  ) => Promise<string | string[]>;
}

interface CommentsAPI {
  draftReply: (input: {
    videoTitle: string;
    commentText: string;
    channelLabel: string;
    authorDisplayName: string;
  }) => Promise<{ drafts: string[] }>;
  list: (options?: {
    maxResults?: number;
    videoId?: string;
  }) => Promise<{ items: YouTubeCommentThread[]; fetchedAt: string }>;
  reply: (
    parentCommentId: string,
    channelId: string,
    text: string,
  ) => Promise<YouTubeCommentReply>;
}

interface YouTubeAuthAPI {
  getStatus: () => Promise<{
    connected: boolean;
    status: 'connected' | 'missing_credentials' | 'reauth_required';
    channelLabelsNeedingAuth: string[];
  }>;
  start: (channelLabel: string) => Promise<{ success: boolean }>;
}

interface ElectronAPI {
  terminal: TerminalAPI;
  topics: TopicsAPI;
  trends: TrendsAPI;
  pipeline: PipelineAPI;
  review: ReviewAPI;
  comments: CommentsAPI;
  youtubeAuth: YouTubeAuthAPI;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
