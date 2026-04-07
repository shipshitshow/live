"use client";

import { useState } from "react";
import { formatNumber, formatCtr, formatWatchTime } from "@/lib/format";
import type { VideoStats } from "@/lib/types";

type SortKey = "views" | "ctr" | "watch_time_minutes" | "impressions";

export function VideoTable({ videos }: { videos: VideoStats[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [desc, setDesc] = useState(true);

  const sorted = [...videos].sort((a, b) =>
    desc ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]
  );

  function handleSort(key: SortKey) {
    if (sortKey === key) setDesc((d) => !d);
    else { setSortKey(key); setDesc(true); }
  }

  const cols: { key: SortKey; label: string }[] = [
    { key: "views", label: "Views" },
    { key: "impressions", label: "Impressions" },
    { key: "ctr", label: "CTR" },
    { key: "watch_time_minutes", label: "Watch Time" },
  ];

  return (
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
          {sorted.map((v) => (
            <tr
              key={v.video_id}
              className="border-b border-surface-border/50 hover:bg-surface-elevated/50 transition-colors group"
            >
              <td className="py-3 px-4">
                <a
                  href={`https://youtu.be/${v.video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-primary group-hover:text-accent-red transition-colors line-clamp-2 max-w-xs"
                >
                  {v.title}
                </a>
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
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <div className="text-center text-text-muted py-12 text-sm">No video data available</div>
      )}
    </div>
  );
}
