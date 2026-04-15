"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CommentReplyDraftResponse,
  YouTubeCommentListResponse,
  YouTubeCommentReply,
  YouTubeCommentThread,
} from "@/lib/types";

type DraftState = Record<string, string[]>;
type SendingState = Record<string, number | null>;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-[10px] font-medium px-2 py-1 rounded bg-surface-border text-text-muted hover:text-text-primary transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

const formatPublishedAt = (value: string) =>
  new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });

export function CommentsClient() {
  const [comments, setComments] = useState<YouTubeCommentThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState("all");
  const [videoFilter, setVideoFilter] = useState("all");
  const [draftsByComment, setDraftsByComment] = useState<DraftState>({});
  const [draftLoadingId, setDraftLoadingId] = useState<string | null>(null);
  const [sendingByComment, setSendingByComment] = useState<SendingState>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/youtube/comments?maxResults=100", {
        cache: "no-store",
      });
      const data = (await res.json()) as YouTubeCommentListResponse | { error: string };

      if (!res.ok || !("items" in data)) {
        throw new Error("error" in data ? data.error : `API error ${res.status}`);
      }

      setComments(data.items);
      setFetchedAt(data.fetchedAt);
      setSelectedId((prev) => {
        if (prev && data.items.some((item) => item.commentId === prev)) return prev;
        return data.items[0]?.commentId ?? null;
      });
    } catch (loadError) {
      setComments([]);
      setError(loadError instanceof Error ? loadError.message : "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const channelOptions = useMemo(
    () =>
      Array.from(new Set(comments.map((item) => item.channelLabel))).sort(),
    [comments]
  );

  const filteredByChannel = useMemo(() => {
    if (channelFilter === "all") return comments;
    return comments.filter((item) => item.channelLabel === channelFilter);
  }, [comments, channelFilter]);

  const videoOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of filteredByChannel) {
      map.set(item.videoId, item.videoTitle);
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [filteredByChannel]);

  useEffect(() => {
    if (videoFilter === "all") return;
    if (!videoOptions.some(([videoId]) => videoId === videoFilter)) {
      setVideoFilter("all");
    }
  }, [videoFilter, videoOptions]);

  const visibleComments = useMemo(() => {
    if (videoFilter === "all") return filteredByChannel;
    return filteredByChannel.filter((item) => item.videoId === videoFilter);
  }, [filteredByChannel, videoFilter]);

  const selectedComment = useMemo(
    () => visibleComments.find((item) => item.commentId === selectedId) ?? visibleComments[0] ?? null,
    [selectedId, visibleComments]
  );

  useEffect(() => {
    if (!selectedComment) {
      setSelectedId(null);
      return;
    }
    if (selectedId !== selectedComment.commentId) {
      setSelectedId(selectedComment.commentId);
    }
  }, [selectedComment, selectedId]);

  const handleGenerateDrafts = useCallback(async (comment: YouTubeCommentThread) => {
    setDraftLoadingId(comment.commentId);
    setActionError(null);

    try {
      const res = await fetch("/api/youtube/comments/draft-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoTitle: comment.videoTitle,
          commentText: comment.text,
          channelLabel: comment.channelLabel,
          authorDisplayName: comment.authorDisplayName,
        }),
      });

      const data = (await res.json()) as CommentReplyDraftResponse | { error: string };
      if (!res.ok || !("drafts" in data)) {
        throw new Error("error" in data ? data.error : `API error ${res.status}`);
      }

      setDraftsByComment((prev) => ({
        ...prev,
        [comment.commentId]: data.drafts,
      }));
    } catch (draftError) {
      setActionError(draftError instanceof Error ? draftError.message : "Failed to generate drafts");
    } finally {
      setDraftLoadingId(null);
    }
  }, []);

  const handleSendReply = useCallback(async (comment: YouTubeCommentThread, draft: string, index: number) => {
    setSendingByComment((prev) => ({ ...prev, [comment.commentId]: index }));
    setActionError(null);

    try {
      const res = await fetch("/api/youtube/comments/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentCommentId: comment.commentId,
          channelId: comment.channelId,
          text: draft,
        }),
      });

      const data = (await res.json()) as YouTubeCommentReply | { error: string };
      if (!res.ok || !("id" in data)) {
        throw new Error("error" in data ? data.error : `API error ${res.status}`);
      }

      setComments((prev) =>
        prev.map((item) =>
          item.commentId === comment.commentId
            ? {
                ...item,
                totalReplyCount: item.totalReplyCount + 1,
                replies: [...item.replies, data],
              }
            : item
        )
      );
    } catch (sendError) {
      setActionError(sendError instanceof Error ? sendError.message : "Failed to send reply");
    } finally {
      setSendingByComment((prev) => ({ ...prev, [comment.commentId]: null }));
    }
  }, []);

  return (
    <div className="flex" style={{ height: "calc(100vh - 65px)" }}>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div>
            <p className="text-xs text-text-muted">
              {loading ? "Loading comments..." : `${visibleComments.length} comments loaded`}
              {fetchedAt ? ` · updated ${new Date(fetchedAt).toLocaleTimeString()}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={channelFilter}
              onChange={(event) => setChannelFilter(event.target.value)}
              className="text-xs px-3 py-2 bg-surface-card border border-surface-border rounded-lg text-text-primary"
            >
              <option value="all">All channels</option>
              {channelOptions.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
            <select
              value={videoFilter}
              onChange={(event) => setVideoFilter(event.target.value)}
              className="max-w-[320px] text-xs px-3 py-2 bg-surface-card border border-surface-border rounded-lg text-text-primary"
            >
              <option value="all">All videos</option>
              {videoOptions.map(([videoId, videoTitle]) => (
                <option key={videoId} value={videoId}>
                  {videoTitle}
                </option>
              ))}
            </select>
            <button
              onClick={loadComments}
              className="text-xs px-3 py-2 bg-surface-card border border-surface-border rounded-lg hover:border-accent-red transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="text-accent-red text-4xl">⚠</div>
            <p className="text-text-secondary text-sm">{error}</p>
            <button
              onClick={loadComments}
              className="text-xs px-4 py-2 bg-surface-card border border-surface-border rounded-lg hover:border-accent-red transition-colors"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="bg-surface-card border border-surface-border rounded-xl h-28"
              />
            ))}
          </div>
        ) : visibleComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="text-text-muted text-4xl">💬</div>
            <p className="text-text-secondary text-sm">No comments found for this filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleComments.map((comment) => {
              const isSelected = selectedComment?.commentId === comment.commentId;

              return (
                <button
                  key={comment.commentId}
                  onClick={() => setSelectedId(comment.commentId)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    isSelected
                      ? "bg-accent-red/5 border-accent-red/30"
                      : "bg-surface-card border-surface-border hover:border-surface-border/80"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-accent-red/15 text-accent-red uppercase">
                      {comment.channelLabel}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {comment.videoTitle}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary font-medium">
                    {comment.authorDisplayName}
                  </p>
                  <p className="text-xs text-text-secondary leading-relaxed mt-1 line-clamp-3">
                    {comment.text}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted">
                    <span>{formatPublishedAt(comment.publishedAt)}</span>
                    <span>{comment.likeCount} likes</span>
                    <span>{comment.totalReplyCount} replies</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <aside className="w-[460px] shrink-0 border-l border-surface-border overflow-y-auto p-4">
        {!selectedComment ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-text-muted text-center">
              Select a comment to generate<br />reply drafts and send one
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-surface-card border border-surface-border rounded-xl p-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">
                  Video
                </p>
                <p className="text-sm text-text-primary font-semibold">
                  {selectedComment.videoTitle}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">
                  Comment
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {selectedComment.text}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] text-text-muted">
                  {selectedComment.authorDisplayName} · {formatPublishedAt(selectedComment.publishedAt)}
                </div>
                <button
                  onClick={() => handleGenerateDrafts(selectedComment)}
                  disabled={draftLoadingId === selectedComment.commentId}
                  className="text-xs font-medium px-3 py-2 rounded-lg bg-accent-red/10 text-accent-red hover:bg-accent-red/20 transition-colors disabled:opacity-60"
                >
                  {draftLoadingId === selectedComment.commentId ? "Generating..." : "Generate drafts"}
                </button>
              </div>
            </div>

            {actionError && (
              <div className="bg-accent-red/10 border border-accent-red/20 rounded-xl p-3 text-xs text-accent-red">
                {actionError}
              </div>
            )}

            {(draftsByComment[selectedComment.commentId] ?? []).length > 0 && (
              <div className="space-y-3">
                {(draftsByComment[selectedComment.commentId] ?? []).map((draft, index) => {
                  const sendingIndex = sendingByComment[selectedComment.commentId];
                  return (
                    <div
                      key={`${selectedComment.commentId}-${index}`}
                      className="bg-surface-elevated border border-surface-border rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="text-[10px] uppercase tracking-wider text-text-muted">
                          Draft {index + 1}
                        </span>
                        <CopyButton text={draft} />
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                        {draft}
                      </p>
                      <div className="mt-4">
                        <button
                          onClick={() => handleSendReply(selectedComment, draft, index)}
                          disabled={sendingIndex === index}
                          className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-accent-red text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                        >
                          {sendingIndex === index ? "Sending..." : "Send this reply"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedComment.replies.length > 0 && (
              <div className="bg-surface-card border border-surface-border rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-text-muted mb-3">
                  Existing replies
                </p>
                <div className="space-y-3">
                  {selectedComment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="border border-surface-border rounded-lg p-3 bg-surface-elevated"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-medium text-text-primary">
                          {reply.authorDisplayName}
                        </p>
                        <span className="text-[10px] text-text-muted">
                          {formatPublishedAt(reply.publishedAt)}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed mt-2">
                        {reply.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
