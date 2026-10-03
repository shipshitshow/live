import { NextResponse } from 'next/server';
import { listAvailableLivestreamDates } from '@/lib/livestreams-store';
import { requireProducer } from '@/lib/producer-auth';

export async function GET() {
  const producer = await requireProducer();
  if (!producer.ok) return producer.response;

  const dates = await listAvailableLivestreamDates();
  return NextResponse.json({ dates });
}
