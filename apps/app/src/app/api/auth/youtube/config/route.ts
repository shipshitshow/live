import { NextRequest, NextResponse } from 'next/server';
import { isYouTubeAuthEnabled } from '@/lib/dev-tools';
import { requireProducer } from '@/lib/producer-auth';
import { getYouTubeOAuthRedirectUri } from '@/lib/youtube/token';

export async function GET(request: NextRequest) {
  const producer = await requireProducer();
  if (!producer.ok) return producer.response;

  if (!isYouTubeAuthEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(
    { redirectUri: getYouTubeOAuthRedirectUri(request.nextUrl.origin) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
