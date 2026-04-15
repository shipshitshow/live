import { NextResponse } from 'next/server';
import { getDevTerminalManager } from '@/lib/dev-terminal';
import { isDevToolsEnabled } from '@/lib/dev-tools';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isDevToolsEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const cursor = Number(searchParams.get('cursor') ?? '0');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  try {
    const snapshot = getDevTerminalManager().readSession(sessionId, cursor);
    return NextResponse.json(snapshot, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Terminal session not found',
      },
      { status: 404 },
    );
  }
}

export async function POST(request: Request) {
  if (!isDevToolsEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let body: { action?: 'create' | 'exec'; sessionId?: string; input?: string };
  try {
    body = (await request.json()) as {
      action?: 'create' | 'exec';
      sessionId?: string;
      input?: string;
    };
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    );
  }

  if (body.action === 'exec') {
    if (!body.sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }
    if (typeof body.input !== 'string') {
      return NextResponse.json({ error: 'Missing input' }, { status: 400 });
    }

    try {
      const snapshot = await getDevTerminalManager().executeCommand(
        body.sessionId,
        body.input,
      );
      return NextResponse.json(snapshot, {
        headers: { 'Cache-Control': 'no-store' },
      });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Terminal session not found',
        },
        { status: 404 },
      );
    }
  }

  const session = await getDevTerminalManager().createSession();
  return NextResponse.json(session, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function DELETE(request: Request) {
  if (!isDevToolsEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  getDevTerminalManager().closeSession(sessionId);
  return NextResponse.json(
    { ok: true },
    {
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
