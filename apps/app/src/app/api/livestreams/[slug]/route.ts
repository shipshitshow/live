import { NextResponse } from 'next/server';
import { todayLocalDate } from '@/lib/date';
import { readTopicRaw } from '@/lib/livestreams-store';

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
