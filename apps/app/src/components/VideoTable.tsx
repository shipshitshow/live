'use client';

import type { VideoStats } from '@shipshitshow/types';
import { Button } from '@shipshitshow/ui';
import { useState } from 'react';
import { formatNumber, formatWatchTime } from '@/lib/format';

type SortKey =
  | 'published_at'
  | 'views'
  | 'likes'
  | 'comments'
  | 'watch_time_minutes';

const PAGE_SIZE = 10;

const DATE_FORMATTER = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const CHANNEL_HANDLES: Record<string, { handle: string; cls: string }> = {
  clips: { cls: 'bg-red-400/20 text-red-400', handle: '@sssclips' },
  main: { cls: 'bg-accent-red/20 text-accent-red', handle: '@shipshitshow' },
};

export function VideoTable({
  videos,
  showChannel = false,
}: {
  videos: VideoStats[];
  showChannel?: boolean;
}) {
  const [sortKey, setSortKey] = useState<SortKey>('views');
  const [desc, setDesc] = useState(true);
  const [page, setPage] = useState(0);

  const sorted = [...videos].sort((a, b) => {
    const aValue =
      sortKey === 'published_at'
        ? new Date(a.published_at).getTime()
        : a[sortKey];
    const bValue =
      sortKey === 'published_at'
        ? new Date(b.published_at).getTime()
        : b[sortKey];

    return desc ? bValue - aValue : aValue - bValue;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey === key) setDesc((d) => !d);
    else {
      setSortKey(key);
      setDesc(true);
    }
    setPage(0);
  }

  const cols: { key: SortKey; label: string }[] = [
    { key: 'published_at', label: 'Date' },
    { key: 'views', label: 'Views' },
    { key: 'likes', label: 'Likes' },
    { key: 'comments', label: 'Comments' },
    { key: 'watch_time_minutes', label: 'Watch Time' },
  ];

  function formatPublishDate(value: string) {
    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp)) return '—';

    return DATE_FORMATTER.format(timestamp);
  }

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
                    <span className="ml-1 text-accent-red">
                      {desc ? '↓' : '↑'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((v) => {
              const chInfo = v.channel_label
                ? CHANNEL_HANDLES[v.channel_label]
                : null;
              return (
                <tr
                  key={v.video_id}
                  className="border-b border-surface-border/50 hover:bg-surface-elevated/50 transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {showChannel && chInfo && (
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${chInfo.cls}`}
                        >
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
                  <td className="py-3 px-4 text-right tabular-nums text-text-secondary whitespace-nowrap">
                    {formatPublishDate(v.published_at)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-text-secondary">
                    {formatNumber(v.views)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-text-secondary">
                    {formatNumber(v.likes)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-text-secondary">
                    {formatNumber(v.comments)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-text-secondary">
                    {v.watch_time_minutes
                      ? formatWatchTime(v.watch_time_minutes)
                      : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="text-center text-text-muted py-12 text-sm">
            No video data available
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-surface-border">
          <span className="text-[11px] text-text-muted">
            {page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              size="sm"
              className="rounded bg-surface-elevated text-xs text-text-secondary hover:text-text-primary"
            >
              Prev
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                onClick={() => setPage(i)}
                size="icon"
                className={`size-7 rounded text-xs transition-colors ${
                  page === i
                    ? 'bg-accent-red/10 text-accent-red border border-accent-red/30'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              size="sm"
              className="rounded bg-surface-elevated text-xs text-text-secondary hover:text-text-primary"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
