import { type NextRequest, NextResponse } from 'next/server';
import { generateCommentReplyDrafts } from '@/lib/comment-reply-drafts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const drafts = await generateCommentReplyDrafts(body);
    return NextResponse.json({ drafts });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Failed to generate drafts';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
