export type PipelineJobStatus =
  | "pending"
  | "running"
  | "ready_for_review"
  | "approved"
  | "rejected"
  | "uploading"
  | "done"
  | "failed";

export type PipelineStageStatus = "pending" | "running" | "done" | "failed" | "skipped";

export type PipelineStageName = "script" | "audio" | "video" | "thumbnail" | "upload";

export interface PipelineStage {
  name: PipelineStageName;
  label: string;
  status: PipelineStageStatus;
  started_at?: string;
  completed_at?: string;
  output?: Record<string, string | number | boolean | null>;
  error?: string;
}

export interface PipelineJob {
  id: string;
  episode_id: string;
  title: string;
  topic: string;
  status: PipelineJobStatus;
  created_at: string;
  updated_at: string;
  stages: PipelineStage[];
  video_url?: string;
  thumbnail_url?: string;
  rejection_reason?: string;
}

export interface ReviewAction {
  action: "approve" | "reject";
  reason?: string;
}
