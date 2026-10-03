import { type NextRequest, NextResponse } from 'next/server';
import { createTopic, getTopicsForDate } from '@/lib/livestreams-store';
import { requireProducer } from '@/lib/producer-auth';
import { StorageWriteError } from '@/lib/producer-storage';
import {
  isStorageWritable,
  storageUnavailableResponse,
  storageWriteFailedResponse,
} from '@/lib/storage-capability-server';

function todayLocalDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function GET(req: NextRequest) {
  const producer = await requireProducer();
  if (!producer.ok) return producer.response;

  const date = req.nextUrl.searchParams.get('date') || todayLocalDate();
  const topics = await getTopicsForDate(date);
  return NextResponse.json({ topics });
}

export async function POST(req: NextRequest) {
  const producer = await requireProducer();
  if (!producer.ok) return producer.response;

  if (!isStorageWritable()) {
    return storageUnavailableResponse('research topics');
  }

  const body = await req.json();

  try {
    const result = await createTopic(body);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    if (e instanceof StorageWriteError) {
      return storageWriteFailedResponse('the research topic');
    }
    const message = e instanceof Error ? e.message : 'Failed to create topic';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
