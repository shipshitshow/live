import { type NextRequest, NextResponse } from 'next/server';
import type { YouTubeCommentThread } from '@shipshitshow/types';
import { fetchCommentThreads } from '@/lib/youtube/comments';
import { getAccessToken, getChannelConfigs } from '@/lib/youtube/token';

export async function GET(req: NextRequest) {
  const maxResults = Number(req.nextUrl.searchParams.get('maxResults') ?? 100);

  try {
    const channels = await getChannelConfigs();
    const allItems: YouTubeCommentThread[] = [];

    for (const channel of channels) {
      const token = await getAccessToken(channel);
      const threads = await fetchCommentThreads(token, channel, { maxResults });
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
