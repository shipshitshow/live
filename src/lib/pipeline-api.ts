import type { PipelineJob, ReviewAction } from "@/lib/pipeline-types";

const PIPELINE_BASE = process.env.PIPELINE_API_URL ?? "http://localhost:8001";

export async function fetchReviewQueue(signal?: AbortSignal): Promise<PipelineJob[]> {
  const res = await fetch(`${PIPELINE_BASE}/pipeline/jobs?status=ready_for_review`, {
    signal,
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Pipeline API error: ${res.status} ${res.statusText}`);
  return res.json() as Promise<PipelineJob[]>;
}

export async function fetchJob(jobId: string, signal?: AbortSignal): Promise<PipelineJob> {
  const res = await fetch(`${PIPELINE_BASE}/pipeline/jobs/${jobId}`, {
    signal,
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Pipeline API error: ${res.status} ${res.statusText}`);
  return res.json() as Promise<PipelineJob>;
}

export async function submitReview(jobId: string, body: ReviewAction): Promise<PipelineJob> {
  const res = await fetch(`${PIPELINE_BASE}/pipeline/jobs/${jobId}/review`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Pipeline API error: ${res.status} ${res.statusText}`);
  return res.json() as Promise<PipelineJob>;
}
