import { NextResponse } from 'next/server';
import { todayLocalDate } from '@/lib/date';
import {
  getTopicBySlug,
  readTopicDrawing,
  saveTopicDrawing,
} from '@/lib/livestreams-store';
import { StorageWriteError } from '@/lib/producer-storage';
import {
  isStorageWritable,
  storageUnavailableResponse,
  storageWriteFailedResponse,
} from '@/lib/storage-capability-server';

const MAX_DRAWING_BYTES = 1_000_000;

interface DrawingUpdateRequest {
  content?: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || todayLocalDate();

  if (!(await getTopicBySlug(date, slug))) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  try {
    return NextResponse.json(await readTopicDrawing(date, slug));
  } catch {
    return NextResponse.json(
      { error: 'Drawing file is invalid' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isStorageWritable()) {
    return storageUnavailableResponse('drawings');
  }

  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || todayLocalDate();

  if (!(await getTopicBySlug(date, slug))) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  const { content }: DrawingUpdateRequest = await request.json();
  if (!content) {
    return NextResponse.json(
      { error: 'Drawing content is required' },
      { status: 400 },
    );
  }

  if (Buffer.byteLength(content, 'utf8') > MAX_DRAWING_BYTES) {
    return NextResponse.json(
      { error: 'Drawing is too large to save (limit 1,000,000 bytes)' },
      { status: 413 },
    );
  }

  try {
    JSON.parse(content);
  } catch {
    return NextResponse.json(
      { error: 'Drawing content must be valid JSON' },
      { status: 400 },
    );
  }

  try {
    const updatedAt = await saveTopicDrawing(date, slug, content);
    return NextResponse.json({ ok: true, updatedAt });
  } catch (error) {
    if (error instanceof StorageWriteError) {
      return storageWriteFailedResponse('the drawing');
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to save drawing',
      },
      { status: 503 },
    );
  }
}
