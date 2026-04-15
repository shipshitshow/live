import { NextResponse } from "next/server";
import { replyToComment } from "@/lib/youtube/comments";
import { getAccessToken, getChannelConfigs } from "@/lib/youtube/token";

interface ReplyRequestBody {
  parentCommentId?: unknown;
  channelId?: unknown;
  text?: unknown;
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
  let body: ReplyRequestBody;

  try {
    body = (await request.json()) as ReplyRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const parentCommentId = readString(body.parentCommentId, "parentCommentId");
    const channelId = readString(body.channelId, "channelId");
    const text = readString(body.text, "text");
    const channelConfig = getChannelConfigs().find((channel) => channel.id === channelId);

    if (!channelConfig) {
      return NextResponse.json({ error: "Unknown channel" }, { status: 404 });
    }

    const token = await getAccessToken(channelConfig);
    const reply = await replyToComment(token, parentCommentId, text);
    return NextResponse.json(reply);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reply";
    const status = message.includes("Missing") || message.includes("Invalid") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
