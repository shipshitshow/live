import { NextRequest, NextResponse } from 'next/server';
import { isYouTubeAuthEnabled } from '@/lib/dev-tools';
import { requireProducer } from '@/lib/producer-auth';
import {
  createOAuthState,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_MAX_AGE_SECONDS,
  sanitizeNextPath,
} from '@/lib/youtube/oauth-state';
import {
  getConfiguredChannelMeta,
  getYouTubeOAuthConfig,
  getYouTubeOAuthRedirectUri,
} from '@/lib/youtube/token';

export async function GET(request: NextRequest) {
  const producer = await requireProducer();
  if (!producer.ok) return producer.response;

  if (!isYouTubeAuthEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { clientId, scopes } = getYouTubeOAuthConfig();
  const channel = request.nextUrl.searchParams.get('channel') || 'main';
  const next = sanitizeNextPath(request.nextUrl.searchParams.get('next'), '/');
  const allowedChannels = new Set(
    getConfiguredChannelMeta().map((item) => item.label),
  );

  if (!allowedChannels.has(channel)) {
    return NextResponse.json(
      { error: 'Unknown YouTube channel' },
      { status: 400 },
    );
  }

  const redirectUri = getYouTubeOAuthRedirectUri(request.nextUrl.origin);
  const { state, nonce } = createOAuthState({ channel, next });
  const authUrl =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    new URLSearchParams({
      access_type: 'offline',
      client_id: clientId,
      prompt: 'select_account consent',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      state,
    }).toString();

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(OAUTH_STATE_COOKIE, nonce, {
    httpOnly: true,
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
    path: '/api/auth/youtube',
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
  });
  return response;
}
