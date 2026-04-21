import { NextResponse } from 'next/server';
import { logEvent } from '@/lib/logger';

interface ClientLogBody {
  event?: unknown;
  payload?: unknown;
  type?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  let body: ClientLogBody;

  try {
    body = (await request.json()) as ClientLogBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const type = body.type;
  const event = body.event;
  const payload = body.payload;

  if ((type !== 'event' && type !== 'perf') || typeof event !== 'string') {
    return NextResponse.json(
      { error: "Expected { type: 'event' | 'perf', event: string }" },
      { status: 400 },
    );
  }

  logEvent(`client.${type}.${event}`, isRecord(payload) ? payload : {});
  return new NextResponse(null, { status: 204 });
}
