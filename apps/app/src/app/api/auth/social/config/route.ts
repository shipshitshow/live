import { NextRequest, NextResponse } from 'next/server';
import { getSocialOAuthPublicConfigs } from '@/lib/social/oauth';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { platforms: getSocialOAuthPublicConfigs(request.nextUrl.origin) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
