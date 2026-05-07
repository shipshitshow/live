import { type NextRequest, NextResponse } from 'next/server';
import { replyToComment } from '@/lib/youtube/comments';
import { getAccessToken, getChannelConfigs } from '@/lib/youtube/token';

export async function POST(req: NextRequest) {
  try {
    const { parentCommentId, channelId, text } = await req.json();

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
    const message = e instanceof Error ? e.message : 'Failed to send reply';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
