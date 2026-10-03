import type { YouTubeCommentThread } from '@shipshitshow/types';
import { type NextRequest, NextResponse } from 'next/server';
import { requireProducer } from '@/lib/producer-auth';
import { fetchCommentThreads } from '@/lib/youtube/comments';
import {
  getAccessToken,
  getChannelConfigs,
  getConfiguredChannelMeta,
} from '@/lib/youtube/token';

export async function GET(req: NextRequest) {
  const producer = await requireProducer();
  if (!producer.ok) return producer.response;

  const maxResults = Number(req.nextUrl.searchParams.get('maxResults') ?? 100);

  try {
    const channels = await getChannelConfigs();
    const ownedChannelIds = getConfiguredChannelMeta().map(
      (channel) => channel.id,
    );
    const allItems: YouTubeCommentThread[] = [];

    for (const channel of channels) {
      const token = await getAccessToken(channel);
      const threads = await fetchCommentThreads(token, channel, {
        maxResults,
        ownedChannelIds,
      });
      allItems.push(...threads);
    }

    allItems.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

    return NextResponse.json({
      fetchedAt: new Date().toISOString(),
      items: allItems,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch comments';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
