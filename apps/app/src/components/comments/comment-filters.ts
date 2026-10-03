import type { YouTubeCommentThread } from '@shipshitshow/types';

export type ReplyFilter = 'needs_reply' | 'all';

export interface CommentFilters {
  channel: string;
  reply: ReplyFilter;
  video: string;
}

/** Audience comments the show still owes an answer; its own posts never count. */
export const needsReply = (thread: YouTubeCommentThread) =>
  !thread.hasChannelReply && !thread.isOwnedComment;

export function filterComments(
  comments: YouTubeCommentThread[],
  filters: CommentFilters,
): YouTubeCommentThread[] {
  return comments.filter(
    (thread) =>
      (filters.channel === 'all' || thread.channelLabel === filters.channel) &&
      (filters.reply === 'all' || needsReply(thread)) &&
      (filters.video === 'all' || thread.videoId === filters.video),
  );
}
