import { type NextRequest, NextResponse } from 'next/server';
import { createTopic, getTopicsForDate } from '@/lib/livestreams-store';

function todayLocalDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date') || todayLocalDate();
  const topics = await getTopicsForDate(date);
  return NextResponse.json({ topics });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const result = await createTopic(body);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create topic';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
