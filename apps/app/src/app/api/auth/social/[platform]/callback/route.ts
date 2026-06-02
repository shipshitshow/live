import { NextRequest, NextResponse } from 'next/server';
import {
  getSocialOAuthConfig,
  isSocialOAuthPlatform,
} from '@/lib/social/oauth';
import { saveSocialToken } from '@/lib/social/tokens';

function decodeState(raw: string | null): { next: string } | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(raw, 'base64url').toString('utf8'),
    ) as { next?: string };
    return typeof parsed.next === 'string' ? { next: parsed.next } : null;
  } catch {
    return null;
  }
}

function expiresAt(seconds: number | undefined): string | undefined {
  if (!seconds) return undefined;
  return new Date(Date.now() + seconds * 1000).toISOString();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;
  if (!isSocialOAuthPlatform(platform)) {
    return NextResponse.json({ error: 'Unknown platform' }, { status: 404 });
  }

  const code = request.nextUrl.searchParams.get('code');
  const error =
    request.nextUrl.searchParams.get('error_description') ||
    request.nextUrl.searchParams.get('error');
  const state = decodeState(request.nextUrl.searchParams.get('state'));

  if (error || !code || !state) {
    const redirectUrl = new URL('/auth/social', request.nextUrl.origin);
    redirectUrl.searchParams.set('platform', platform);
    redirectUrl.searchParams.set('error', error || 'invalid_callback');
    return NextResponse.redirect(redirectUrl);
  }

  const config = getSocialOAuthConfig(platform, request.nextUrl.origin);
  const tokenBody =
    platform === 'tiktok'
      ? new URLSearchParams({
          client_key: config.clientId,
          client_secret: config.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: config.redirectUri,
        })
      : new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: config.redirectUri,
        });

  const tokenRes = await fetch(config.tokenUrl, {
    body: tokenBody,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  });

  const body = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
    expires_in?: number;
    open_id?: string;
    refresh_expires_in?: number;
    refresh_token?: string;
    scope?: string;
    user_id?: string;
  };

  if (!tokenRes.ok || !body.access_token) {
    const redirectUrl = new URL('/auth/social', request.nextUrl.origin);
    redirectUrl.searchParams.set('platform', platform);
    redirectUrl.searchParams.set(
      'error',
      body.error_description || body.error || 'token_exchange_failed',
    );
    return NextResponse.redirect(redirectUrl);
  }

  await saveSocialToken(platform, {
    accessToken: body.access_token,
    accountId: body.open_id || body.user_id,
    expiresAt: expiresAt(body.expires_in),
    refreshToken: body.refresh_token,
    scope: body.scope,
  });

  const nextPath = state.next.startsWith('/') ? state.next : '/analytics';
  return NextResponse.redirect(new URL(nextPath, request.nextUrl.origin));
}
