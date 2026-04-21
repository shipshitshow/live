import { formatDistanceToNow } from "date-fns";
import type { PipelineStage, PipelineStageStatus } from "@shipshitshow/types";

interface PipelineSidebarProps {
  stages: PipelineStage[];
  rejectionReason?: string;
}

const STATUS_STYLES: Record<PipelineStageStatus, { dot: string; label: string }> = {
  done: { dot: "bg-green-500", label: "Done" },
  running: { dot: "bg-accent-red animate-pulse", label: "Running" },
  failed: { dot: "bg-red-500", label: "Failed" },
  pending: { dot: "bg-surface-border", label: "Pending" },
  skipped: { dot: "bg-text-muted", label: "Skipped" },
};

export function PipelineSidebar({ stages, rejectionReason }: PipelineSidebarProps) {
  return (
    <div className="space-y-3">
      {rejectionReason && (
        <div className="bg-accent-red/10 border border-accent-red/30 rounded-xl px-4 py-3">
          <p className="text-xs font-medium text-accent-red uppercase tracking-widest mb-1">
            Previous Rejection
          </p>
          <p className="text-xs text-text-secondary">{rejectionReason}</p>
        </div>
      )}

      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-surface-border">
          <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest">
            Pipeline Stages
          </h3>
        </div>
        <div className="divide-y divide-surface-border">
          {stages.map((stage, idx) => {
            const style = STATUS_STYLES[stage.status];
            const duration =
              stage.started_at && stage.completed_at
                ? formatDistanceToNow(new Date(stage.started_at), {
                    addSuffix: false,
                  })
                : null;

            return (
              <div key={stage.name} className="px-5 py-3">
                <div className="flex items-start gap-3">
                  {/* step number + connector */}
                  <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
                    <div
                      className={`w-2 h-2 rounded-full ${style.dot}`}
                    />
                    {idx < stages.length - 1 && (
                      <div className="w-px flex-1 bg-surface-border mt-1 min-h-[16px]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-text-primary">{stage.label}</p>
                      <span className={`text-[10px] font-mono ${
                        stage.status === "done" ? "text-green-500" :
                        stage.status === "failed" ? "text-red-400" :
                        stage.status === "running" ? "text-accent-red" :
                        "text-text-muted"
                      }`}>
                        {style.label}
                      </span>
                    </div>

                    {stage.completed_at && (
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {formatDistanceToNow(new Date(stage.completed_at), { addSuffix: true })}
                        {duration && ` · ${duration}`}
                      </p>
                    )}

                    {stage.error && (
                      <p className="text-[10px] text-red-400 mt-1 line-clamp-2">{stage.error}</p>
                    )}

                    {stage.output && Object.keys(stage.output).length > 0 && (
                      <div className="mt-1.5 space-y-0.5">
                        {Object.entries(stage.output).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-1.5">
                            <span className="text-[10px] text-text-muted font-mono">{key}:</span>
                            <span className="text-[10px] text-text-secondary font-mono truncate">
                              {String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
