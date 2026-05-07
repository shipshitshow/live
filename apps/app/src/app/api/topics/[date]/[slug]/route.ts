import { type NextRequest, NextResponse } from 'next/server';
import { saveTopicUpdate } from '@/lib/livestreams-store';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ date: string; slug: string }> },
) {
  const { date, slug } = await params;
  const { status } = await req.json();

  const ok = await saveTopicUpdate(date, slug, { status });
  if (!ok) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
