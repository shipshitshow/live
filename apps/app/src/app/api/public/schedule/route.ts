import type { Topic } from '@shipshitshow/types';
import { NextResponse } from 'next/server';
import {
  getTopicsForDate,
  listAvailableLivestreamDates,
  resolveLivestreamDate,
} from '@/lib/livestream-store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const availableDates = await listAvailableLivestreamDates();
  const requestedDate = searchParams.get('date') ?? availableDates[0];

  if (!requestedDate) {
    return NextResponse.json({
      availableDates,
      resolvedDate: null,
      topics: [],
    });
  }

  const resolvedDate = await resolveLivestreamDate(requestedDate);
  const topics: Topic[] = await getTopicsForDate(resolvedDate);

  const publicTopics = topics
    .filter((t) => t.status !== 'backlog')
    .map((t) => ({
      date: t.date,
      slug: t.slug,
      status: t.status,
      title: t.title,
    }));

  return NextResponse.json({
    availableDates,
    resolvedDate,
    topics: publicTopics,
  });
}
