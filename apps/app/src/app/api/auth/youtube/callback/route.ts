import { NextRequest, NextResponse } from 'next/server';
import { isYouTubeAuthEnabled } from '@/lib/dev-tools';
import {
  OAUTH_STATE_COOKIE,
  verifyOAuthState,
} from '@/lib/youtube/oauth-state';
import {
  getConfiguredChannelMeta,
  getYouTubeOAuthConfig,
  getYouTubeOAuthRedirectUri,
  saveRefreshToken,
} from '@/lib/youtube/token';

function clearStateCookie(response: NextResponse): NextResponse {
  response.cookies.set(OAUTH_STATE_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/api/auth/youtube',
    sameSite: 'lax',
  });
  return response;
}

export async function GET(request: NextRequest) {
  if (!isYouTubeAuthEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');
  const cookieNonce = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const state = verifyOAuthState(
    request.nextUrl.searchParams.get('state'),
    cookieNonce,
  );

  if (error) {
    const redirectUrl = new URL('/auth/youtube', request.nextUrl.origin);
    redirectUrl.searchParams.set('error', error);
    if (state?.next) redirectUrl.searchParams.set('next', state.next);
    return clearStateCookie(NextResponse.redirect(redirectUrl));
  }

  // A missing/invalid state means the callback wasn't initiated by this browser
  // via /start — reject rather than trust an attacker-supplied code + channel.
  if (!code || !state) {
    return clearStateCookie(
      NextResponse.redirect(
        new URL('/auth/youtube?error=invalid_callback', request.nextUrl.origin),
      ),
    );
  }

  const allowedChannels = new Set(
    getConfiguredChannelMeta().map((item) => item.label),
  );
  if (!allowedChannels.has(state.channel)) {
    return clearStateCookie(
      NextResponse.redirect(
        new URL('/auth/youtube?error=unknown_channel', request.nextUrl.origin),
      ),
    );
  }

  const { clientId, clientSecret } = getYouTubeOAuthConfig();
  const redirectUri = getYouTubeOAuthRedirectUri(request.nextUrl.origin);

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  });

  const body = (await tokenRes.json()) as {
    refresh_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenRes.ok || !body.refresh_token) {
    const redirectUrl = new URL('/auth/youtube', request.nextUrl.origin);
    redirectUrl.searchParams.set(
      'error',
      body.error_description || body.error || 'token_exchange_failed',
    );
    redirectUrl.searchParams.set('next', state.next);
    return clearStateCookie(NextResponse.redirect(redirectUrl));
  }

  await saveRefreshToken(state.channel, body.refresh_token);

  const nextPath = state.next.startsWith('/') ? state.next : '/';
  return clearStateCookie(
    NextResponse.redirect(new URL(nextPath, request.nextUrl.origin)),
  );
}
