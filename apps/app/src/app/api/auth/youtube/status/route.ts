import { NextResponse } from 'next/server';
import { isYouTubeAuthEnabled } from '@/lib/dev-tools';
import { getYouTubeAuthStatus } from '@/lib/youtube/token';

export async function GET() {
  if (!isYouTubeAuthEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const status = await getYouTubeAuthStatus();
    return NextResponse.json(status, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    // A misconfigured client id/secret (or transient refresh failure) must not
    // 500 the status probe — report it as needing reauth instead.
    const message =
      error instanceof Error ? error.message : 'Failed to read YouTube status';
    return NextResponse.json(
      {
        channelLabelsNeedingAuth: [],
        connected: false,
        error: message,
        status: 'reauth_required',
      },
      { headers: { 'Cache-Control': 'no-store' }, status: 200 },
    );
  }
}
