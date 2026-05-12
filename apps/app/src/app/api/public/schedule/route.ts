import type { Topic } from '@shipshitshow/types';
import { NextResponse } from 'next/server';
import { todayLocalDate } from '@/lib/date';
import {
  getTopicsForDate,
  listAvailableLivestreamDates,
  resolveLivestreamDate,
} from '@/lib/livestreams-store';

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
  const isPast = resolvedDate < todayLocalDate();

  const publicTopics = topics.reduce<
    { date: string; slug: string; status: string; title: string }[]
  >((acc, t) => {
    if (t.status !== 'backlog') {
      acc.push({
        date: t.date,
        slug: t.slug,
        status: isPast ? 'done' : t.status,
        title: t.title,
      });
    }
    return acc;
  }, []);

  return NextResponse.json({
    availableDates,
    resolvedDate,
    topics: publicTopics,
  });
}
