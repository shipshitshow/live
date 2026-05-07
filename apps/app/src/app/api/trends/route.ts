import { buildTrendsResponse } from '@shipshitshow/talking-points';
import { NextResponse } from 'next/server';
import {
  fetchAppHNTrending,
  fetchAppRedditTrending,
  fetchAppXTrending,
  fetchAppYouTubeTrending,
} from '@/lib/talking-points-sources';

export async function GET() {
  const response = await buildTrendsResponse([
    ['hackernews', fetchAppHNTrending],
    ['reddit', fetchAppRedditTrending],
    ['youtube', fetchAppYouTubeTrending],
    ['x', fetchAppXTrending],
  ] as const);

  return NextResponse.json(response);
}
