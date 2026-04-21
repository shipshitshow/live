import { NextResponse } from 'next/server';
import { todayLocalDate } from '@/lib/date';
import { readTopicRaw, saveTopicUpdate } from '@/lib/livestream-store';
import type { TopicUpdate } from '@shipshitshow/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(_request.url);
  const date = searchParams.get('date') || todayLocalDate();
  const raw = await readTopicRaw(date, slug);
  if (!raw) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  return NextResponse.json({ raw });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || todayLocalDate();

  try {
    const updates: TopicUpdate = await request.json();
    const saved = await saveTopicUpdate(date, slug, updates);

    if (!saved) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to update topic',
      },
      { status: 503 },
    );
  }
}
