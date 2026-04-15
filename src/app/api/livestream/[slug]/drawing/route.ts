import fs from 'node:fs';
import { NextResponse } from 'next/server';
import { todayLocalDate } from '@/lib/date';
import {
  ensureTopicDrawingDir,
  findTopicFile,
  getTopicDrawingFile,
} from '@/lib/livestream-files';

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

  if (!findTopicFile(slug, date)) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  const drawingFile = getTopicDrawingFile(slug, date);
  if (!drawingFile || !fs.existsSync(drawingFile)) {
    return NextResponse.json({ scene: null, updatedAt: null });
  }

  try {
    const raw = fs.readFileSync(drawingFile, 'utf-8');
    const stat = fs.statSync(drawingFile);

    return NextResponse.json({
      scene: JSON.parse(raw) as Record<string, unknown>,
      updatedAt: stat.mtime.toISOString(),
    });
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
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || todayLocalDate();

  if (!findTopicFile(slug, date)) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  const { content }: DrawingUpdateRequest = await request.json();
  if (!content) {
    return NextResponse.json(
      { error: 'Drawing content is required' },
      { status: 400 },
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

  ensureTopicDrawingDir(slug, date);
  const drawingFile = getTopicDrawingFile(slug, date);
  if (!drawingFile) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  fs.writeFileSync(drawingFile, content, 'utf-8');
  return NextResponse.json({ ok: true, updatedAt: new Date().toISOString() });
}
