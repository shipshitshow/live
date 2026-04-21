import { NextResponse } from 'next/server';
import type { ErrorResponse } from '@shipshitshow/types';
import { todayLocalDate } from '@/lib/date';
import {
  createTopic,
  getTopicsForDate,
  listAvailableLivestreamDates,
  resolveLivestreamDate,
} from '@/lib/livestream-store';
import type { LivestreamListResponse } from '@shipshitshow/types';
import { logError, logEvent } from '@/lib/logger';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedDate = searchParams.get('date') || todayLocalDate();

  try {
    const resolvedDate = await resolveLivestreamDate(requestedDate);
    const availableDates = await listAvailableLivestreamDates();
    const topics = await getTopicsForDate(resolvedDate);
    logEvent('api.livestream.list', {
      isFallback: requestedDate !== resolvedDate,
      requestedDate,
      resolvedDate,
      topicCount: topics.length,
    });

    const response: LivestreamListResponse = {
      availableDates,
      isFallback: requestedDate !== resolvedDate,
      requestedDate,
      resolvedDate,
      topics,
    };

    return NextResponse.json(response);
  } catch (error) {
    logError('api.livestream.list_failed', error, {
      requestedDate,
    });
    const response: ErrorResponse = {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to load livestream topics',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, source, date, content } = body as {
      title: string;
      slug: string;
      source: string;
      date: string;
      content: string;
    };

    const created = await createTopic({ content, date, slug, source, title });
    logEvent('api.livestream.created', {
      date,
      fileName: created.fileName,
      slug,
      source,
      title,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const response: ErrorResponse = {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create livestream topic',
    };
    return NextResponse.json(response, { status: 503 });
  }
}
