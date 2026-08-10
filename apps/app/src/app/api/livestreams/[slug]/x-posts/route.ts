import type { XEpisodePostInput } from '@shipshitshow/types';
import { NextResponse } from 'next/server';
import { resolveStreamDate } from '@/lib/livestreams-routing';
import {
  getEpisodeXMetrics,
  saveEpisodeXPosts,
} from '@/lib/livestreams-x-posts';

function parsePostInputs(value: unknown): XEpisodePostInput[] | null {
  if (!value || typeof value !== 'object') return null;

  const posts = (value as { posts?: unknown }).posts;
  if (!Array.isArray(posts)) return null;

  const inputs: XEpisodePostInput[] = [];
  for (const entry of posts) {
    if (!entry || typeof entry !== 'object') return null;

    const post = entry as Record<string, unknown>;
    if (typeof post.id !== 'string' || !post.id.trim()) return null;

    const input: XEpisodePostInput = { id: post.id };

    if ('url' in post) {
      if (post.url !== null && typeof post.url !== 'string') return null;
      input.url = post.url as string | null;
    }

    if ('manual_metrics' in post) {
      if (
        post.manual_metrics !== null &&
        typeof post.manual_metrics !== 'object'
      ) {
        return null;
      }
      input.manual_metrics = post.manual_metrics as
        | XEpisodePostInput['manual_metrics']
        | null;
    }

    inputs.push(input);
  }

  return inputs;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const date = await resolveStreamDate(slug);
  if (!date) {
    return NextResponse.json(
      { error: 'Livestream not found' },
      { status: 404 },
    );
  }

  const { searchParams } = new URL(request.url);
  const refresh = searchParams.get('refresh') === 'true';

  return NextResponse.json(await getEpisodeXMetrics(date, { refresh }));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const date = await resolveStreamDate(slug);
  if (!date) {
    return NextResponse.json(
      { error: 'Livestream not found' },
      { status: 404 },
    );
  }

  const body = await request.json().catch(() => null);
  const posts = parsePostInputs(body);
  if (!posts) {
    return NextResponse.json(
      { error: 'Expected { posts: [{ id, url?, manual_metrics? }] }' },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await saveEpisodeXPosts(date, { posts }));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to save X posts',
      },
      { status: 503 },
    );
  }
}
