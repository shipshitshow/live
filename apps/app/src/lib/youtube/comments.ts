import type {
  ErrorResponse,
  YouTubeCommentReply,
  YouTubeCommentThread,
} from '@shipshitshow/types';
import { normalizeYouTubeError } from './error';
import type {
  ChannelConfig,
  YouTubeCommentReplyItem,
  YouTubeCommentThreadItem,
  YouTubeVideoItem,
} from './types';

const DATA_API = 'https://www.googleapis.com/youtube/v3';

interface FetchCommentThreadsOptions {
  maxResults?: number;
  videoId?: string | null;
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/** Throw a structured error so callers/UI get quota/auth codes, not a raw blob. */
function throwNormalizedYouTubeError(status: number, body: string): never {
  const normalized = normalizeYouTubeError(status, body);
  const error = new Error(normalized.error) as Error & ErrorResponse;
  error.code = normalized.code;
  error.hint = normalized.hint;
  throw error;
}

const ytFetch = async <T>(url: string, token: string): Promise<T> => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throwNormalizedYouTubeError(res.status, await res.text());
  }
  return (await res.json()) as T;
};

const mapReply = (reply: YouTubeCommentReplyItem): YouTubeCommentReply => ({
  authorChannelId: reply.snippet?.authorChannelId?.value ?? null,
  authorDisplayName: reply.snippet?.authorDisplayName ?? 'Unknown',
  authorProfileImageUrl: reply.snippet?.authorProfileImageUrl ?? null,
  id: reply.id ?? '',
  likeCount: Number(reply.snippet?.likeCount ?? 0),
  publishedAt: reply.snippet?.publishedAt ?? '',
  text: reply.snippet?.textOriginal ?? reply.snippet?.textDisplay ?? '',
  updatedAt: reply.snippet?.updatedAt ?? reply.snippet?.publishedAt ?? '',
});

const fetchVideoTitles = async (
  token: string,
  videoIds: string[],
): Promise<Map<string, string>> => {
  if (videoIds.length === 0) return new Map();
  const res = await ytFetch<{ items?: YouTubeVideoItem[] }>(
    `${DATA_API}/videos?part=snippet&id=${videoIds.join(',')}`,
    token,
  );
  return new Map(
    (res.items ?? []).map((item) => [item.id, item.snippet?.title ?? item.id]),
  );
};

const fetchAllReplies = async (
  token: string,
  parentId: string,
): Promise<YouTubeCommentReply[]> => {
  const replies: YouTubeCommentReply[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      maxResults: '100',
      parentId,
      part: 'snippet',
      textFormat: 'plainText',
    });

    if (pageToken) params.set('pageToken', pageToken);

    const res = await ytFetch<{
      items?: YouTubeCommentReplyItem[];
      nextPageToken?: string;
    }>(`${DATA_API}/comments?${params.toString()}`, token);

    replies.push(
      ...(res.items ?? []).map(mapReply).filter((reply) => reply.id),
    );
    pageToken = res.nextPageToken;
  } while (pageToken);

  return replies;
};

export const fetchCommentThreads = async (
  token: string,
  channelConfig: ChannelConfig,
  options: FetchCommentThreadsOptions = {},
): Promise<YouTubeCommentThread[]> => {
  const maxResults = Math.min(100, Math.max(1, options.maxResults ?? 50));
  const params = new URLSearchParams({
    maxResults: String(maxResults),
    moderationStatus: 'published',
    order: 'time',
    part: 'snippet,replies',
    textFormat: 'plainText',
  });

  if (options.videoId) {
    params.set('videoId', options.videoId);
  } else {
    params.set('allThreadsRelatedToChannelId', channelConfig.id);
  }

  const res = await ytFetch<{ items?: YouTubeCommentThreadItem[] }>(
    `${DATA_API}/commentThreads?${params.toString()}`,
    token,
  );
  const items = res.items ?? [];
  const videoIds = Array.from(
    new Set(items.map((item) => item.snippet?.videoId).filter(isDefined)),
  );
  const videoTitles = await fetchVideoTitles(token, videoIds);

  const threads = await Promise.all(
    items.map(async (item) => {
      const topLevel = item.snippet?.topLevelComment;
      const topLevelSnippet = topLevel?.snippet;
      const videoId = item.snippet?.videoId;
      const commentId = topLevel?.id;

      if (!videoId || !commentId || !topLevelSnippet) return null;

      let replies = (item.replies?.comments ?? [])
        .map(mapReply)
        .filter((reply) => reply.id);
      const totalReplyCount = Number(item.snippet?.totalReplyCount ?? 0);

      if (totalReplyCount > replies.length) {
        replies = await fetchAllReplies(token, commentId);
      }

      return {
        authorDisplayName: topLevelSnippet.authorDisplayName ?? 'Unknown',
        authorProfileImageUrl: topLevelSnippet.authorProfileImageUrl ?? null,
        canReply: Boolean(item.snippet?.canReply),
        channelId: item.snippet?.channelId ?? channelConfig.id,
        channelLabel: channelConfig.label,
        commentId,
        hasChannelReply: replies.some(
          (reply) => reply.authorChannelId === channelConfig.id,
        ),
        id: item.id,
        likeCount: Number(topLevelSnippet.likeCount ?? 0),
        publishedAt: topLevelSnippet.publishedAt ?? '',
        replies,
        text: topLevelSnippet.textOriginal ?? topLevelSnippet.textDisplay ?? '',
        totalReplyCount,
        updatedAt:
          topLevelSnippet.updatedAt ?? topLevelSnippet.publishedAt ?? '',
        videoId,
        videoTitle: videoTitles.get(videoId) ?? videoId,
        viewerRating: topLevelSnippet.viewerRating ?? 'none',
      };
    }),
  );

  return threads.filter(isDefined);
};

export const replyToComment = async (
  token: string,
  parentCommentId: string,
  text: string,
): Promise<YouTubeCommentReply> => {
  const res = await fetch(`${DATA_API}/comments?part=snippet`, {
    body: JSON.stringify({
      snippet: {
        parentId: parentCommentId,
        textOriginal: text,
      },
    }),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!res.ok) {
    throwNormalizedYouTubeError(res.status, await res.text());
  }

  const item = (await res.json()) as YouTubeCommentReplyItem;
  return mapReply(item);
};
