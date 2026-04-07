"use client";

import { useState } from "react";
import { formatNumber, formatCtr, formatWatchTime } from "@/lib/format";
import type { VideoStats } from "@/lib/types";

type SortKey = "views" | "ctr" | "watch_time_minutes" | "impressions";

const PAGE_SIZE = 10;

const CHANNEL_HANDLES: Record<string, { handle: string; cls: string }> = {
  main: { handle: "@shipshitshow", cls: "bg-accent-red/20 text-accent-red" },
  clips: { handle: "@sssclips", cls: "bg-blue-500/20 text-blue-400" },
};

export function VideoTable({ videos, showChannel = false }: { videos: VideoStats[]; showChannel?: boolean }) {
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [desc, setDesc] = useState(true);
  const [page, setPage] = useState(0);

  const sorted = [...videos].sort((a, b) =>
    desc ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]
  );

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey === key) setDesc((d) => !d);
    else { setSortKey(key); setDesc(true); }
    setPage(0);
  }

  const cols: { key: SortKey; label: string }[] = [
    { key: "views", label: "Views" },
    { key: "impressions", label: "Impressions" },
    { key: "ctr", label: "CTR" },
    { key: "watch_time_minutes", label: "Watch Time" },
  ];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left py-3 px-4 text-text-secondary font-medium text-xs uppercase tracking-wider">
                Video
              </th>
              {cols.map((col) => (
                <th
                  key={col.key}
                  className="text-right py-3 px-4 text-text-secondary font-medium text-xs uppercase tracking-wider cursor-pointer select-none hover:text-text-primary transition-colors"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1 text-accent-red">{desc ? "↓" : "↑"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((v) => {
              const chInfo = v.channel_label ? CHANNEL_HANDLES[v.channel_label] : null;
              return (
                <tr
                  key={v.video_id}
                  className="border-b border-surface-border/50 hover:bg-surface-elevated/50 transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {showChannel && chInfo && (
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${chInfo.cls}`}>
                          {chInfo.handle}
                        </span>
                      )}
                      <a
                        href={`https://youtu.be/${v.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-primary group-hover:text-accent-red transition-colors line-clamp-2 max-w-xs"
                      >
                        {v.title}
                      </a>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-text-secondary">
                    {formatNumber(v.views)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-text-secondary">
                    {v.impressions ? formatNumber(v.impressions) : "—"}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-text-secondary">
                    {v.ctr ? formatCtr(v.ctr) : "—"}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-text-secondary">
                    {v.watch_time_minutes ? formatWatchTime(v.watch_time_minutes) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="text-center text-text-muted py-12 text-sm">No video data available</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-surface-border">
          <span className="text-[11px] text-text-muted">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-xs px-2.5 py-1 rounded bg-surface-elevated border border-surface-border text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`text-xs w-7 h-7 rounded transition-colors ${
                  page === i
                    ? "bg-accent-red/10 text-accent-red border border-accent-red/30"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="text-xs px-2.5 py-1 rounded bg-surface-elevated border border-surface-border text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
