import { NextRequest, NextResponse } from 'next/server';
import { isYouTubeAuthEnabled } from '@/lib/dev-tools';
import { getYouTubeOAuthRedirectUri } from '@/lib/youtube/token';

export async function GET(request: NextRequest) {
  if (!isYouTubeAuthEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(
    { redirectUri: getYouTubeOAuthRedirectUri(request.nextUrl.origin) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
