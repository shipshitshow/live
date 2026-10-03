import { describe, expect, test } from 'bun:test';
import type { YouTubeCommentThread } from '@shipshitshow/types';
import { filterComments, needsReply } from './comment-filters';

function thread(
  commentId: string,
  overrides: Partial<YouTubeCommentThread> = {},
): YouTubeCommentThread {
  return {
    authorChannelId: 'UCviewer',
    authorDisplayName: 'Viewer',
    authorProfileImageUrl: null,
    canReply: true,
    channelId: 'UCmain',
    channelLabel: 'main',
    commentId,
    hasChannelReply: false,
    id: `thread-${commentId}`,
    isOwnedComment: false,
    likeCount: 0,
    publishedAt: '2026-10-01T10:00:00Z',
    replies: [],
    text: 'Hello',
    totalReplyCount: 0,
    updatedAt: '2026-10-01T10:00:00Z',
    videoId: 'video-1',
    videoTitle: 'Video one',
    viewerRating: 'none',
    ...overrides,
  };
}

const viewerUnanswered = thread('viewer');
const viewerAnswered = thread('answered', { hasChannelReply: true });
const ownPromo = thread('promo', {
  authorChannelId: 'UCmain',
  isOwnedComment: true,
});
const clipsViewer = thread('clips', {
  channelLabel: 'clips',
  videoId: 'video-2',
});

const all = [viewerUnanswered, viewerAnswered, ownPromo, clipsViewer];

describe('needsReply', () => {
  test('keeps an unanswered viewer comment', () => {
    expect(needsReply(viewerUnanswered)).toBe(true);
  });

  test('drops answered threads and the channel’s own comments', () => {
    expect(needsReply(viewerAnswered)).toBe(false);
    expect(needsReply(ownPromo)).toBe(false);
  });
});

describe('filterComments', () => {
  test('Needs reply excludes owned promo comments', () => {
    const ids = filterComments(all, {
      channel: 'all',
      reply: 'needs_reply',
      video: 'all',
    }).map((t) => t.commentId);
    expect(ids).toEqual(['viewer', 'clips']);
  });

  test('All comments retains owned promo comments', () => {
    const ids = filterComments(all, {
      channel: 'all',
      reply: 'all',
      video: 'all',
    }).map((t) => t.commentId);
    expect(ids).toEqual(['viewer', 'answered', 'promo', 'clips']);
  });

  test('channel and video filters combine with reply status', () => {
    expect(
      filterComments(all, {
        channel: 'clips',
        reply: 'needs_reply',
        video: 'all',
      }).map((t) => t.commentId),
    ).toEqual(['clips']);
    expect(
      filterComments(all, {
        channel: 'all',
        reply: 'all',
        video: 'video-1',
      }).map((t) => t.commentId),
    ).toEqual(['viewer', 'answered', 'promo']);
  });
});
