import type { TrendItem, TrendsSearchResponse } from '@shipshitshow/types';
import { NextRequest, NextResponse } from 'next/server';
import { searchHN } from '@/lib/trends/hackernews';
import { searchReddit } from '@/lib/trends/reddit';
import { searchX } from '@/lib/trends/x';
import { searchYouTube } from '@/lib/trends/youtube';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  if (!query) {
    return NextResponse.json({ error: 'Missing q parameter' }, { status: 400 });
  }

  const results = await Promise.allSettled([
    searchHN(query),
    searchReddit(query),
    searchYouTube(query),
    searchX(query),
  ]);

  const items: TrendItem[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      items.push(...result.value);
    }
  }

  items.sort((a, b) => b.score - a.score);

  const response: TrendsSearchResponse = { items, query };

  return NextResponse.json(response);
}
