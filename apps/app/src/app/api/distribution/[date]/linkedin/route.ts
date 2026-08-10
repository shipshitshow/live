import type { LinkedInPostsUpdate } from '@shipshitshow/types';
import { NextResponse } from 'next/server';
import { getEpisodeLinkedInMeasurement } from '@/lib/linkedin-measurement';
import {
  findInvalidLinkedInPostIndexes,
  isLivestreamDate,
  saveLinkedInPosts,
} from '@/lib/linkedin-metrics-store';
import { logError, logEvent } from '@/lib/logger';

/**
 * Manual LinkedIn post metrics for one episode date (issue #20). Metrics are
 * typed in by hand because LinkedIn exposes no analytics API for personal
 * profiles, so the store — not the client — decides provenance.
 */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  if (!isLivestreamDate(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  try {
    return NextResponse.json(await getEpisodeLinkedInMeasurement(date));
  } catch (error) {
    logError('api.distribution.linkedin_read_failed', error, { date });
    return NextResponse.json(
      { error: 'Failed to load LinkedIn measurement' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  if (!isLivestreamDate(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Untrusted: shaped like a LinkedInPostsUpdate, validated by the store.
  const posts = (body as Partial<LinkedInPostsUpdate> | null)?.posts;
  if (!Array.isArray(posts)) {
    return NextResponse.json(
      { error: 'Expected a posts array' },
      { status: 400 },
    );
  }

  const invalidIndexes = findInvalidLinkedInPostIndexes(posts);
  if (invalidIndexes.length > 0) {
    return NextResponse.json(
      {
        error:
          'Every post needs an author and an https://linkedin.com permalink',
        invalidIndexes,
      },
      { status: 400 },
    );
  }

  try {
    const saved = await saveLinkedInPosts(date, posts);

    logEvent('api.distribution.linkedin_saved', {
      date,
      postCount: saved.length,
    });

    return NextResponse.json({ posts: saved });
  } catch (error) {
    logError('api.distribution.linkedin_save_failed', error, { date });
    return NextResponse.json(
      { error: 'Failed to save LinkedIn metrics' },
      { status: 500 },
    );
  }
}
