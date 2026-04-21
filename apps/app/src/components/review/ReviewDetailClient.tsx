'use client';

import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { PipelineSidebar } from '@/components/review/PipelineSidebar';
import { ReviewChecklist } from '@/components/review/ReviewChecklist';
import { VideoPlayer } from '@/components/review/VideoPlayer';
import { Button } from '@shipshitshow/ui';
import { Textarea } from '@shipshitshow/ui';
import { parseJsonResponse } from '@/lib/parse-json-response';
import type { PipelineJob } from '@shipshitshow/types';

interface ReviewDetailClientProps {
  jobId: string;
}

export function ReviewDetailClient({ jobId }: ReviewDetailClientProps) {
  const router = useRouter();
  const [job, setJob] = useState<PipelineJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checklistPassed, setChecklistPassed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pipeline/jobs/${jobId}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await parseJsonResponse<PipelineJob>(res);
      setJob(data);
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      setError(e instanceof Error ? e.message : 'Failed to load job');
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleApprove() {
    if (!checklistPassed || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/pipeline/jobs/${jobId}`, {
        body: JSON.stringify({ action: 'approve' }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      router.push('/review');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to approve');
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim() || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/pipeline/jobs/${jobId}`, {
        body: JSON.stringify({ action: 'reject', reason: rejectReason.trim() }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      router.push('/review');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to reject');
      setSubmitting(false);
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="text-accent-red text-4xl">⚠</div>
        <p className="text-text-secondary text-sm">{error}</p>
        <Button onClick={load} className="text-xs hover:border-accent-red">
          Retry
        </Button>
      </div>
    );
  }

  if (loading || !job) {
    return (
      <div className="animate-pulse grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <div className="bg-surface-card border border-surface-border rounded-xl aspect-video" />
          <div className="bg-surface-card border border-surface-border rounded-xl h-48" />
          <div className="bg-surface-card border border-surface-border rounded-xl h-24" />
        </div>
        <div className="bg-surface-card border border-surface-border rounded-xl h-96" />
      </div>
    );
  }

  const isAlreadyReviewed =
    job.status === 'approved' || job.status === 'rejected';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* Main column */}
      <div className="space-y-4">
        {/* Job header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                {job.episode_id}
              </span>
              <span className="w-1 h-1 rounded-full bg-surface-border" />
              <span className="text-[10px] text-text-muted">
                Updated{' '}
                {formatDistanceToNow(new Date(job.updated_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <h2 className="text-lg font-bold text-text-primary">{job.title}</h2>
            <p className="text-text-muted text-sm mt-0.5">{job.topic}</p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        {/* Video preview */}
        {job.video_url ? (
          <VideoPlayer src={job.video_url} thumbnailUrl={job.thumbnail_url} />
        ) : (
          <div className="aspect-video bg-surface-card border border-surface-border rounded-xl flex flex-col items-center justify-center gap-2">
            <span className="text-text-muted text-2xl">▶</span>
            <p className="text-xs text-text-muted">Video not available</p>
          </div>
        )}

        {/* Checklist (only shown for pending review) */}
        {!isAlreadyReviewed && (
          <ReviewChecklist onChange={setChecklistPassed} />
        )}

        {/* Action area */}
        {!isAlreadyReviewed && (
          <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest">
              Decision
            </h3>

            {submitError && (
              <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg px-3 py-2">
                <p className="text-xs text-accent-red">{submitError}</p>
              </div>
            )}

            {rejectMode ? (
              <div className="space-y-3">
                <Textarea
                  value={rejectReason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
                  placeholder="Describe what needs to be fixed before re-review…"
                  className="min-h-[80px] resize-none bg-surface-elevated"
                  disabled={submitting}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleReject}
                    disabled={!rejectReason.trim() || submitting}
                    variant="accent"
                    className="flex-1"
                  >
                    {submitting ? 'Sending back…' : 'Send back for fixes'}
                  </Button>
                  <Button
                    onClick={() => {
                      setRejectMode(false);
                      setRejectReason('');
                    }}
                    disabled={submitting}
                    className="bg-surface-elevated hover:border-text-muted"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={!checklistPassed || submitting}
                  title={
                    !checklistPassed
                      ? 'Complete all checklist items first'
                      : undefined
                  }
                  className="flex-1 border-green-500/30 bg-green-600 text-white hover:bg-green-500 hover:text-white"
                >
                  {submitting
                    ? 'Approving…'
                    : 'Approve — send to YouTube upload'}
                </Button>
                <Button
                  onClick={() => setRejectMode(true)}
                  disabled={submitting}
                  className="bg-surface-elevated hover:border-accent-red/50 hover:text-accent-red"
                >
                  Reject
                </Button>
              </div>
            )}

            {!checklistPassed && !rejectMode && (
              <p className="text-[11px] text-text-muted">
                Complete all checklist items to enable approval
              </p>
            )}
          </div>
        )}

        {isAlreadyReviewed && (
          <div
            className={`rounded-xl px-5 py-4 border ${
              job.status === 'approved'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-accent-red/10 border-accent-red/30'
            }`}
          >
            <p
              className={`text-sm font-medium ${
                job.status === 'approved' ? 'text-green-400' : 'text-accent-red'
              }`}
            >
              {job.status === 'approved'
                ? '✓ Approved — queued for YouTube upload'
                : '✗ Rejected'}
            </p>
            {job.rejection_reason && (
              <p className="text-xs text-text-secondary mt-1">
                {job.rejection_reason}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div>
        <PipelineSidebar
          stages={job.stages}
          rejectionReason={job.rejection_reason}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: PipelineJob['status'] }) {
  const styles: Partial<Record<PipelineJob['status'], string>> = {
    approved: 'bg-green-500/15 text-green-400 border-green-500/30',
    done: 'bg-green-500/15 text-green-400 border-green-500/30',
    failed: 'bg-red-500/15 text-red-400 border-red-500/30',
    ready_for_review: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    rejected: 'bg-accent-red/15 text-accent-red border-accent-red/30',
    uploading: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  };

  const labels: Partial<Record<PipelineJob['status'], string>> = {
    approved: 'Approved',
    done: 'Done',
    failed: 'Failed',
    pending: 'Pending',
    ready_for_review: 'Ready for Review',
    rejected: 'Rejected',
    running: 'Running',
    uploading: 'Uploading',
  };

  const cls =
    styles[status] ?? 'bg-surface-card text-text-muted border-surface-border';
  return (
    <span
      className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border flex-shrink-0 ${cls}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
