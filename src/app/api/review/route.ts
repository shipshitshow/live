import { NextResponse } from 'next/server';
import type { ErrorResponse } from '@/lib/api-types';
import { listReviewQueueVideos } from '@/lib/review-queue';

export async function GET() {
  try {
    return NextResponse.json(await listReviewQueueVideos());
  } catch (error) {
    const response: ErrorResponse =
      error instanceof Error
        ? {
            code:
              'code' in error && typeof error.code === 'string'
                ? error.code
                : undefined,
            error: error.message,
            hint:
              'hint' in error && typeof error.hint === 'string'
                ? error.hint
                : undefined,
          }
        : { error: 'Failed to fetch review queue videos' };
    return NextResponse.json(response, { status: 500 });
  }
}
