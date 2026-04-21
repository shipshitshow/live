import type {
  ErrorResponse,
  LivestreamListResponse,
} from '@shipshitshow/types';
import { NextResponse } from 'next/server';
import { todayLocalDate } from '@/lib/date';
import {
  getTopicsForDate,
  listAvailableLivestreamDates,
  resolveLivestreamDate,
} from '@/lib/livestream-store';
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
