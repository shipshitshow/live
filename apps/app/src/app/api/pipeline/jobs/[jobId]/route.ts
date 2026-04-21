import type { ReviewAction } from '@shipshitshow/types';
import { NextResponse } from 'next/server';

const PIPELINE_BASE = process.env.PIPELINE_API_URL ?? 'http://localhost:8001';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  try {
    const res = await fetch(`${PIPELINE_BASE}/pipeline/jobs/${jobId}`);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Pipeline API error: ${res.status}` },
        { status: res.status },
      );
    }
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json(
      { error: 'Pipeline API unavailable' },
      { status: 503 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  let body: ReviewAction;
  try {
    body = (await request.json()) as ReviewAction;
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${PIPELINE_BASE}/pipeline/jobs/${jobId}/review`, {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Pipeline API error: ${res.status}` },
        { status: res.status },
      );
    }
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json(
      { error: 'Pipeline API unavailable' },
      { status: 503 },
    );
  }
}
