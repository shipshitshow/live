import { NextResponse } from 'next/server';
import {
  getTopicsForDate,
  resolvePublicLivestreamDate,
} from '@/lib/livestreams-store';
import { getVisibleTopics, isPastDate } from '@/lib/livestreams-visibility';

/** Anonymous, producer-safe data: let the edge absorb repeat reads. */
const CACHE_HEADERS = {
  'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { availableDates, resolvedDate } = await resolvePublicLivestreamDate(
    searchParams.get('date'),
  );

  if (!resolvedDate) {
    return NextResponse.json(
      {
        availableDates,
        resolvedDate: null,
        topics: [],
      },
      { headers: CACHE_HEADERS },
    );
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

  return NextResponse.json(
    {
      availableDates,
      resolvedDate,
      topics,
    },
    { headers: CACHE_HEADERS },
  );
}
