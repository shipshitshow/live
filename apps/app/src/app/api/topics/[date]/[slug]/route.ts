import { type NextRequest, NextResponse } from 'next/server';
import { saveTopicUpdate } from '@/lib/livestreams-store';
import { StorageWriteError } from '@/lib/producer-storage';
import {
  isStorageWritable,
  storageUnavailableResponse,
  storageWriteFailedResponse,
} from '@/lib/storage-capability-server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ date: string; slug: string }> },
) {
  if (!isStorageWritable()) {
    return storageUnavailableResponse('topic changes');
  }

  const { date, slug } = await params;
  const { status } = await req.json();

  let ok: boolean;
  try {
    ok = await saveTopicUpdate(date, slug, { status });
  } catch (error) {
    if (error instanceof StorageWriteError) {
      return storageWriteFailedResponse('the topic change');
    }
    throw error;
  }

  if (!ok) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
