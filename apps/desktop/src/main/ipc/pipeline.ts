import { ipcMain } from 'electron';
import type { PipelineJob } from '@shipshitshow/types';

const PIPELINE_API_URL =
  process.env.PIPELINE_API_URL || 'http://localhost:8001';

export function registerPipelineHandlers() {
  ipcMain.handle(
    'pipeline:list-jobs',
    async (_event, status?: string): Promise<PipelineJob[]> => {
      const url = status
        ? `${PIPELINE_API_URL}/pipeline/jobs?status=${encodeURIComponent(status)}`
        : `${PIPELINE_API_URL}/pipeline/jobs`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Pipeline API error: ${res.status}`);
      return (await res.json()) as PipelineJob[];
    },
  );

  ipcMain.handle(
    'pipeline:get-job',
    async (_event, jobId: string): Promise<PipelineJob> => {
      const res = await fetch(`${PIPELINE_API_URL}/pipeline/jobs/${jobId}`);
      if (!res.ok) throw new Error(`Pipeline API error: ${res.status}`);
      return (await res.json()) as PipelineJob;
    },
  );

  ipcMain.handle(
    'pipeline:review-job',
    async (
      _event,
      { jobId, action, reason }: { jobId: string; action: string; reason?: string },
    ) => {
      const res = await fetch(
        `${PIPELINE_API_URL}/pipeline/jobs/${jobId}/review`,
        {
          body: JSON.stringify({ action, reason }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        },
      );
      if (!res.ok) throw new Error(`Pipeline API error: ${res.status}`);
      return (await res.json()) as PipelineJob;
    },
  );
}
