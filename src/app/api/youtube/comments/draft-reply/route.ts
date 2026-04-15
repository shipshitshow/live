import { NextResponse } from "next/server";
import type { CommentReplyDraftResponse } from "@/lib/types";
import { generateCommentReplyDrafts } from "@/lib/ai/comment-reply-drafts";

interface DraftReplyRequestBody {
  videoTitle?: unknown;
  commentText?: unknown;
  channelLabel?: unknown;
  authorDisplayName?: unknown;
}

const readString = (value: unknown, field: string) => {
  if (typeof value !== "string") {
    throw new Error(`Invalid ${field}`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Missing ${field}`);
  }

  return trimmed;
};

export async function POST(request: Request) {
  let body: DraftReplyRequestBody;

  try {
    body = (await request.json()) as DraftReplyRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const drafts = await generateCommentReplyDrafts({
      videoTitle: readString(body.videoTitle, "videoTitle"),
      commentText: readString(body.commentText, "commentText"),
      channelLabel: readString(body.channelLabel, "channelLabel"),
      authorDisplayName: readString(body.authorDisplayName, "authorDisplayName"),
    });

    const response: CommentReplyDraftResponse = { drafts };
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate reply drafts";
    const status = message.includes("configured") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
