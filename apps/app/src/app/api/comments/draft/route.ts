import { type NextRequest, NextResponse } from 'next/server';
import { generateCommentReplyDrafts } from '@/lib/comment-reply-drafts';

const REQUIRED_FIELDS = [
  'videoTitle',
  'commentText',
  'channelLabel',
  'authorDisplayName',
] as const;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const record = (body ?? {}) as Record<string, unknown>;
  const missing = REQUIRED_FIELDS.filter(
    (field) => typeof record[field] !== 'string' || !record[field],
  );
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing or invalid field(s): ${missing.join(', ')}` },
      { status: 400 },
    );
  }

  try {
    const drafts = await generateCommentReplyDrafts({
      authorDisplayName: record.authorDisplayName as string,
      channelLabel: record.channelLabel as string,
      commentText: record.commentText as string,
      videoTitle: record.videoTitle as string,
    });
    return NextResponse.json({ drafts });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Failed to generate drafts';
    // Missing API key is a server-config problem, not a client error.
    const status = message.includes('OPENAI_API_KEY') ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
