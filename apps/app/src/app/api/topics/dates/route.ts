import { NextResponse } from 'next/server';
import { listAvailableLivestreamDates } from '@/lib/livestreams-store';

export async function GET() {
  const dates = await listAvailableLivestreamDates();
  return NextResponse.json({ dates });
}
