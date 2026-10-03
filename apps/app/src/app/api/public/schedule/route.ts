import { NextResponse } from 'next/server';
import {
  getTopicsForDate,
  resolvePublicLivestreamDate,
} from '@/lib/livestreams-store';
import { getVisibleTopics, isPastDate } from '@/lib/livestreams-visibility';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { availableDates, resolvedDate } = await resolvePublicLivestreamDate(
    searchParams.get('date'),
  );

  if (!resolvedDate) {
    return NextResponse.json({
      availableDates,
      resolvedDate: null,
      topics: [],
    });
  }

  const isPast = isPastDate(resolvedDate);
  const topics = getVisibleTopics(
    await getTopicsForDate(resolvedDate),
    resolvedDate,
  ).map((t) => ({
    date: t.date,
    slug: t.slug,
    status: isPast ? 'done' : t.status,
    title: t.title,
  }));

  return NextResponse.json({
    availableDates,
    resolvedDate,
    topics,
  });
}
