import { buildTrendsSearchResponse } from '@shipshitshow/talking-points';
import { NextRequest, NextResponse } from 'next/server';
import {
  searchAppHN,
  searchAppReddit,
  searchAppX,
  searchAppYouTube,
} from '@/lib/talking-points-sources';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  if (!query) {
    return NextResponse.json({ error: 'Missing q parameter' }, { status: 400 });
  }

  const response = await buildTrendsSearchResponse(query, [
    () => searchAppHN(query),
    () => searchAppReddit(query),
    () => searchAppYouTube(query),
    () => searchAppX(query),
  ]);

  return NextResponse.json(response);
}
