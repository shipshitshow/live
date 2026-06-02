import { NextRequest, NextResponse } from 'next/server';
import {
  getSocialOAuthConfig,
  isSocialOAuthPlatform,
} from '@/lib/social/oauth';

function encodeState(payload: { next: string; nonce: string }) {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;
  if (!isSocialOAuthPlatform(platform)) {
    return NextResponse.json({ error: 'Unknown platform' }, { status: 404 });
  }

  const next = request.nextUrl.searchParams.get('next') || '/analytics';
  const config = getSocialOAuthConfig(platform, request.nextUrl.origin);
  const state = encodeState({
    next,
    nonce: crypto.randomUUID(),
  });

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

  return NextResponse.redirect(
    `${config.authorizeUrl}?${new URLSearchParams(query)}`,
  );
}
