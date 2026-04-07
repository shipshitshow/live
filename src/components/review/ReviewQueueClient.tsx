"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { PipelineJob } from "@/lib/pipeline-types";

export function ReviewQueueClient() {
  const [jobs, setJobs] = useState<PipelineJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pipeline/jobs?status=ready_for_review", {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data: PipelineJob[] = await res.json();
      setJobs(data);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load queue");
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="text-accent-red text-4xl">⚠</div>
        <p className="text-text-secondary text-sm">{error}</p>
        <button
          onClick={load}
          className="text-xs px-4 py-2 bg-surface-card border border-surface-border rounded-lg hover:border-accent-red transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!loading && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <div className="w-12 h-12 rounded-xl bg-surface-card border border-surface-border flex items-center justify-center text-text-muted text-xl">
          ✓
        </div>
        <p className="text-text-primary font-medium text-sm">Queue is clear</p>
        <p className="text-text-muted text-xs">No videos awaiting review</p>
        <button
          onClick={load}
          className="text-xs px-4 py-2 bg-surface-card border border-surface-border rounded-lg hover:border-accent-red transition-colors mt-2"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={`space-y-3 transition-opacity duration-200 ${loading ? "opacity-50" : ""}`}>
        {jobs.map((job) => (
          <JobRow key={job.id} job={job} />
        ))}
        {loading && jobs.length === 0 && (
          <>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-surface-card border border-surface-border rounded-xl h-20 animate-pulse"
              />
            ))}
          </>
        )}
      </div>
      <div className="flex justify-end pt-2">
        <button
          onClick={load}
          disabled={loading}
          className="text-xs text-text-muted hover:text-text-secondary transition-colors disabled:opacity-40"
        >
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>
    </div>
  );
}

function JobRow({ job }: { job: PipelineJob }) {
  const completedStages = job.stages.filter((s) => s.status === "done").length;
  const totalStages = job.stages.length;

  return (
    <Link
      href={`/review/${job.id}`}
      className="block bg-surface-card border border-surface-border rounded-xl px-5 py-4 hover:border-accent-red/50 transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
              {job.episode_id}
            </span>
            <span className="w-1 h-1 rounded-full bg-surface-border" />
            <span className="text-[10px] text-text-muted">
              {formatDistanceToNow(new Date(job.updated_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm font-medium text-text-primary group-hover:text-accent-red transition-colors truncate">
            {job.title}
          </p>
          <p className="text-xs text-text-muted mt-0.5 truncate">{job.topic}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs text-text-muted">Stages</p>
            <p className="text-xs font-mono text-text-secondary">
              {completedStages}/{totalStages}
            </p>
          </div>
          <div className="w-6 h-6 rounded-full border border-surface-border flex items-center justify-center group-hover:border-accent-red/50 transition-colors">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M3 2L7 5L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted group-hover:text-accent-red transition-colors" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
