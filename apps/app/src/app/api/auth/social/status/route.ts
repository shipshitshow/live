import { NextResponse } from 'next/server';
import { requireProducer } from '@/lib/producer-auth';
import { SOCIAL_OAUTH_PLATFORMS } from '@/lib/social/oauth';
import { getSocialToken } from '@/lib/social/tokens';

export async function GET() {
  const producer = await requireProducer();
  if (!producer.ok) return producer.response;

  const statuses = await Promise.all(
    SOCIAL_OAUTH_PLATFORMS.map(async (platform) => ({
      connected: Boolean(await getSocialToken(platform)),
      platform,
    })),
  );

  return NextResponse.json(
    { statuses },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
