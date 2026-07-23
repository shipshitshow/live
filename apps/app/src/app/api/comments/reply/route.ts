import type { ErrorResponse } from '@shipshitshow/types';
import { type NextRequest, NextResponse } from 'next/server';
import { replyToComment } from '@/lib/youtube/comments';
import { getAccessToken, getChannelConfigs } from '@/lib/youtube/token';

const MAX_REPLY_LENGTH = 10000; // YouTube's comment ceiling

function statusForCode(code: string | undefined): number {
  if (code === 'youtube_quota_exceeded') return 429;
  if (code === 'youtube_unauthorized') return 401;
  return 502;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { parentCommentId, channelId, text } = (body ?? {}) as {
    parentCommentId?: unknown;
    channelId?: unknown;
    text?: unknown;
  };

  if (typeof parentCommentId !== 'string' || !parentCommentId.trim()) {
    return NextResponse.json(
      { error: 'parentCommentId is required' },
      { status: 400 },
    );
  }
  if (typeof channelId !== 'string' || !channelId.trim()) {
    return NextResponse.json(
      { error: 'channelId is required' },
      { status: 400 },
    );
  }
  if (typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }
  if (text.length > MAX_REPLY_LENGTH) {
    return NextResponse.json(
      { error: `text exceeds ${MAX_REPLY_LENGTH} characters` },
      { status: 400 },
    );
  }

  try {
    const channels = await getChannelConfigs();
    const channel = channels.find((ch) => ch.id === channelId);
    if (!channel) {
      return NextResponse.json(
        { error: `Channel ${channelId} not configured` },
        { status: 400 },
      );
    }

    const token = await getAccessToken(channel);
    const reply = await replyToComment(token, parentCommentId, text);
    return NextResponse.json(reply);
  } catch (e) {
    const err = e as Partial<ErrorResponse> & { message?: string };
    const response: ErrorResponse = {
      code: err.code,
      error: err.message ?? 'Failed to send reply',
      hint: err.hint,
    };
    return NextResponse.json(response, { status: statusForCode(err.code) });
  }
}
