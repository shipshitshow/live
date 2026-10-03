import { NextRequest, NextResponse } from 'next/server';
import { requireProducer } from '@/lib/producer-auth';
import { getSocialOAuthPublicConfigs } from '@/lib/social/oauth';

export async function GET(request: NextRequest) {
  const producer = await requireProducer();
  if (!producer.ok) return producer.response;

  return NextResponse.json(
    { platforms: getSocialOAuthPublicConfigs(request.nextUrl.origin) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
