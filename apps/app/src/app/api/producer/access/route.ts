import { NextResponse } from 'next/server';
import {
  evaluateProducerAccess,
  PRODUCER_USER_IDS_ENV,
  parseProducerUserIds,
} from '@/lib/producer-access';
import { producerSession } from '@/lib/producer-session';

export const dynamic = 'force-dynamic';

export async function GET() {
  let userId: string | null = null;
  try {
    userId = await producerSession.getUserId();
  } catch {
    userId = null;
  }
  const raw = process.env[PRODUCER_USER_IDS_ENV];
  return NextResponse.json(
    {
      allowlistConfigured: parseProducerUserIds(raw).length > 0,
      isProducer: evaluateProducerAccess(userId, raw).ok,
      signedIn: userId !== null,
      userId,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
