import { NextResponse } from "next/server";
import { MOCK_JOBS } from "@/lib/mock-pipeline-data";

const PIPELINE_BASE = process.env.PIPELINE_API_URL ?? "http://localhost:8001";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "ready_for_review";

  try {
    const res = await fetch(`${PIPELINE_BASE}/pipeline/jobs?status=${status}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Pipeline API error: ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    // Pipeline API unreachable — serve mock data for demo
    const filtered = MOCK_JOBS.filter((j) => j.status === status);
    return NextResponse.json(filtered);
  }
}
