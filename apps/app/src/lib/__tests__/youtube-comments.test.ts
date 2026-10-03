import { afterEach, describe, expect, test } from 'bun:test';
import { fetchCommentThreads } from '@/lib/youtube/comments';

const MAIN = 'UCmain0000000000000000';
const CLIPS = 'UCclips000000000000000';
const VIEWER = 'UCviewer00000000000000';

const realFetch = globalThis.fetch;

function topLevel(id: string, authorChannelId: string, text: string) {
  return {
    id: `thread-${id}`,
    snippet: {
      canReply: true,
      channelId: MAIN,
      topLevelComment: {
        id,
        snippet: {
          authorChannelId: { value: authorChannelId },
          authorDisplayName: authorChannelId === VIEWER ? 'Viewer' : 'Show',
          publishedAt: '2026-10-01T10:00:00Z',
          textOriginal: text,
        },
      },
      totalReplyCount: 0,
      videoId: 'video-1',
    },
  };
}

function mockYouTube(threads: unknown[]) {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/commentThreads')) {
      return Response.json({ items: threads });
    }
    if (url.includes('/videos')) {
      return Response.json({
        items: [{ id: 'video-1', snippet: { title: 'Video one' } }],
      });
    }
    throw new Error(`Unexpected fetch ${url}`);
  }) as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe('fetchCommentThreads ownership', () => {
  test('marks top-level comments by the channel as owned using its stable ID', async () => {
    mockYouTube([
      topLevel('own', MAIN, 'What are you building with GPT Astra?'),
      topLevel('viewer', VIEWER, 'Great episode'),
    ]);

    const threads = await fetchCommentThreads(
      'token',
      { id: MAIN, label: 'main', refreshToken: 'r' },
      { ownedChannelIds: [MAIN, CLIPS] },
    );

    const own = threads.find((t) => t.commentId === 'own');
    const viewer = threads.find((t) => t.commentId === 'viewer');
    expect(own?.authorChannelId).toBe(MAIN);
    expect(own?.isOwnedComment).toBe(true);
    expect(viewer?.authorChannelId).toBe(VIEWER);
    expect(viewer?.isOwnedComment).toBe(false);
    expect(viewer?.hasChannelReply).toBe(false);
  });

  test('treats a sibling show channel as owned for comments and replies', async () => {
    const answered = topLevel('answered', VIEWER, 'Question?');
    Object.assign(answered.snippet, { totalReplyCount: 1 });
    Object.assign(answered, {
      replies: {
        comments: [
          {
            id: 'reply-1',
            snippet: {
              authorChannelId: { value: CLIPS },
              authorDisplayName: 'Clips',
              publishedAt: '2026-10-01T11:00:00Z',
              textOriginal: 'Answer',
            },
          },
        ],
      },
    });
    mockYouTube([topLevel('clips-promo', CLIPS, 'Full ep on main'), answered]);

    const threads = await fetchCommentThreads(
      'token',
      { id: MAIN, label: 'main', refreshToken: 'r' },
      { ownedChannelIds: [MAIN, CLIPS] },
    );

    expect(
      threads.find((t) => t.commentId === 'clips-promo')?.isOwnedComment,
    ).toBe(true);
    expect(
      threads.find((t) => t.commentId === 'answered')?.hasChannelReply,
    ).toBe(true);
  });

  test('defaults ownership to the fetched channel when no owned set is given', async () => {
    mockYouTube([topLevel('own', MAIN, 'Promo')]);

    const [thread] = await fetchCommentThreads('token', {
      id: MAIN,
      label: 'main',
      refreshToken: 'r',
    });

    expect(thread?.isOwnedComment).toBe(true);
  });
});
