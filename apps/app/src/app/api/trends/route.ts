import { buildTrendsResponse } from '@shipshitshow/talking-points';
import { NextResponse } from 'next/server';
import { requireProducer } from '@/lib/producer-auth';
import {
  fetchAppHNTrending,
  fetchAppRedditTrending,
  fetchAppXTrending,
  fetchAppYouTubeTrending,
} from '@/lib/talking-points-sources';

export async function GET() {
  const producer = await requireProducer();
  if (!producer.ok) return producer.response;

  const response = await buildTrendsResponse([
    ['hackernews', fetchAppHNTrending],
    ['reddit', fetchAppRedditTrending],
    ['youtube', fetchAppYouTubeTrending],
    ['x', fetchAppXTrending],
  ] as const);

  return NextResponse.json(response);
}
