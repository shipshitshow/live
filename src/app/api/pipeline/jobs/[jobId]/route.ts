import { NextResponse } from "next/server";
import type { ReviewAction } from "@/lib/pipeline-types";
import { getMockJob, reviewMockJob } from "@/lib/mock-pipeline-data";

const PIPELINE_BASE = process.env.PIPELINE_API_URL ?? "http://localhost:8001";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  try {
    const res = await fetch(`${PIPELINE_BASE}/pipeline/jobs/${jobId}`);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Pipeline API error: ${res.status}` },
        { status: res.status }
      );
    }
    return NextResponse.json(await res.json());
  } catch {
    // Pipeline API unreachable — serve mock data for demo
    const job = getMockJob(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json(job);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  let body: ReviewAction;
  try {
    body = (await request.json()) as ReviewAction;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${PIPELINE_BASE}/pipeline/jobs/${jobId}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Pipeline API error: ${res.status}` },
        { status: res.status }
      );
    }
    return NextResponse.json(await res.json());
  } catch {
    // Pipeline API unreachable — simulate review with mock data
    const result = reviewMockJob(jobId, body.action, body.reason);
    if (!result) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  }
}
