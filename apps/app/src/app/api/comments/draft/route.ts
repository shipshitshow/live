import type {
  CommentReplyDraftCapability,
  ErrorResponse,
} from '@shipshitshow/types';
import { type NextRequest, NextResponse } from 'next/server';
import {
  CommentDraftError,
  generateCommentReplyDrafts,
  getCommentDraftCapability,
} from '@/lib/comment-reply-drafts';
import { logError } from '@/lib/logger';

const REQUIRED_FIELDS = [
  'videoTitle',
  'commentText',
  'channelLabel',
  'authorDisplayName',
] as const;

export async function GET() {
  return NextResponse.json<CommentReplyDraftCapability>(
    getCommentDraftCapability(),
  );
}

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
    if (e instanceof CommentDraftError) {
      return NextResponse.json<ErrorResponse>(
        { code: e.code, error: e.message, hint: e.hint },
        { status: e.status },
      );
    }
    // Unknown failures may carry provider internals; log them, return a generic error.
    logError('api.comments.draft_failed', e);
    return NextResponse.json<ErrorResponse>(
      {
        code: 'draft_failed',
        error: 'Failed to generate drafts.',
        hint: 'Retry in a moment.',
      },
      { status: 502 },
    );
  }
}
