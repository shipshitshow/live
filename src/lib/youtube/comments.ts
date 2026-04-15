import type { YouTubeCommentReply, YouTubeCommentThread } from "@/lib/types";
import type {
  ChannelConfig,
  YouTubeCommentReplyItem,
  YouTubeCommentThreadItem,
  YouTubeVideoItem,
} from "@/lib/youtube/types";

const DATA_API = "https://www.googleapis.com/youtube/v3";

interface FetchCommentThreadsOptions {
  maxResults?: number;
  videoId?: string | null;
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

const ytFetch = async <T>(url: string, token: string): Promise<T> => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API ${res.status}: ${body}`);
  }

  return (await res.json()) as T;
};

const mapReply = (reply: YouTubeCommentReplyItem): YouTubeCommentReply => ({
  id: reply.id ?? "",
  text: reply.snippet?.textOriginal ?? reply.snippet?.textDisplay ?? "",
  authorDisplayName: reply.snippet?.authorDisplayName ?? "Unknown",
  authorProfileImageUrl: reply.snippet?.authorProfileImageUrl ?? null,
  publishedAt: reply.snippet?.publishedAt ?? "",
  updatedAt: reply.snippet?.updatedAt ?? reply.snippet?.publishedAt ?? "",
  likeCount: Number(reply.snippet?.likeCount ?? 0),
});

const fetchVideoTitles = async (
  token: string,
  videoIds: string[]
): Promise<Map<string, string>> => {
  if (videoIds.length === 0) return new Map();

  const res = await ytFetch<{ items?: YouTubeVideoItem[] }>(
    `${DATA_API}/videos?part=snippet&id=${videoIds.join(",")}`,
    token
  );

  const items = res.items ?? [];
  return new Map(
    items.map((item) => [item.id, item.snippet?.title ?? item.id])
  );
};

export const fetchCommentThreads = async (
  token: string,
  channelConfig: ChannelConfig,
  options: FetchCommentThreadsOptions = {}
): Promise<YouTubeCommentThread[]> => {
  const maxResults = Math.min(100, Math.max(1, options.maxResults ?? 50));
  const params = new URLSearchParams({
    part: "snippet,replies",
    maxResults: String(maxResults),
    moderationStatus: "published",
    order: "time",
    textFormat: "plainText",
  });

  if (options.videoId) {
    params.set("videoId", options.videoId);
  } else {
    params.set("allThreadsRelatedToChannelId", channelConfig.id);
  }

  const res = await ytFetch<{ items?: YouTubeCommentThreadItem[] }>(
    `${DATA_API}/commentThreads?${params.toString()}`,
    token
  );
  const items = res.items ?? [];
  const videoIds = Array.from(
    new Set(items.map((item) => item.snippet?.videoId).filter(isDefined))
  );
  const videoTitles = await fetchVideoTitles(token, videoIds);

  return items.flatMap((item) => {
    const topLevel = item.snippet?.topLevelComment;
    const topLevelSnippet = topLevel?.snippet;
    const videoId = item.snippet?.videoId;
    const commentId = topLevel?.id;

    if (!videoId || !commentId || !topLevelSnippet) {
      return [];
    }

    return [{
      id: item.id,
      commentId,
      channelId: item.snippet?.channelId ?? channelConfig.id,
      channelLabel: channelConfig.label,
      videoId,
      videoTitle: videoTitles.get(videoId) ?? videoId,
      text: topLevelSnippet.textOriginal ?? topLevelSnippet.textDisplay ?? "",
      authorDisplayName: topLevelSnippet.authorDisplayName ?? "Unknown",
      authorProfileImageUrl: topLevelSnippet.authorProfileImageUrl ?? null,
      publishedAt: topLevelSnippet.publishedAt ?? "",
      updatedAt: topLevelSnippet.updatedAt ?? topLevelSnippet.publishedAt ?? "",
      likeCount: Number(topLevelSnippet.likeCount ?? 0),
      totalReplyCount: Number(item.snippet?.totalReplyCount ?? 0),
      canReply: Boolean(item.snippet?.canReply),
      viewerRating: topLevelSnippet.viewerRating ?? "none",
      replies: (item.replies?.comments ?? []).map(mapReply).filter((reply) => reply.id),
    }];
  });
};

export const replyToComment = async (
  token: string,
  parentCommentId: string,
  text: string
): Promise<YouTubeCommentReply> => {
  const res = await fetch(`${DATA_API}/comments?part=snippet`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      snippet: {
        parentId: parentCommentId,
        textOriginal: text,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API ${res.status}: ${body}`);
  }

  const item = (await res.json()) as YouTubeCommentReplyItem;
  return mapReply(item);
};
