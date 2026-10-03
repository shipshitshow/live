import { NextRequest, NextResponse } from 'next/server';
import { requireProducer } from '@/lib/producer-auth';
import {
  getSocialOAuthConfig,
  isSocialOAuthPlatform,
} from '@/lib/social/oauth';
import {
  createOAuthState,
  OAUTH_STATE_MAX_AGE_SECONDS,
  SOCIAL_OAUTH_STATE_COOKIE,
  sanitizeNextPath,
} from '@/lib/youtube/oauth-state';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const producer = await requireProducer();
  if (!producer.ok) return producer.response;

  const { platform } = await params;
  if (!isSocialOAuthPlatform(platform)) {
    return NextResponse.json({ error: 'Unknown platform' }, { status: 404 });
  }

  const next = sanitizeNextPath(
    request.nextUrl.searchParams.get('next'),
    '/analytics',
  );
  const config = getSocialOAuthConfig(platform, request.nextUrl.origin);
  const { state, nonce } = createOAuthState({ channel: platform, next });

  const query: Record<string, string> =
    platform === 'tiktok'
      ? {
          client_key: config.clientId,
          redirect_uri: config.redirectUri,
          response_type: 'code',
          scope: config.scopes.join(','),
          state,
        }
      : {
          client_id: config.clientId,
          redirect_uri: config.redirectUri,
          response_type: 'code',
          scope: config.scopes.join(','),
          state,
        };

  const response = NextResponse.redirect(
    `${config.authorizeUrl}?${new URLSearchParams(query)}`,
  );
  response.cookies.set(SOCIAL_OAUTH_STATE_COOKIE, nonce, {
    httpOnly: true,
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
    path: '/api/auth/social',
    sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:',
  });
  return response;
}
