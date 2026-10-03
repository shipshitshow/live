import type { VideoStats } from '@shipshitshow/types';

export type VideoSortKey =
  | 'published_at'
  | 'views'
  | 'impressions'
  | 'ctr'
  | 'likes'
  | 'comments'
  | 'watch_time_minutes';

export const VIDEO_TABLE_PAGE_SIZE = 10;

export interface VideoPageWindow {
  /** Zero-based page that is actually rendered; always within range. */
  page: number;
  totalPages: number;
  /** One-based first row for the "start–end of total" label; 0 when empty. */
  start: number;
  end: number;
  total: number;
}

function sortValue(video: VideoStats, key: VideoSortKey): number {
  return key === 'published_at'
    ? new Date(video.published_at).getTime()
    : video[key];
}

export function sortVideos(
  videos: VideoStats[],
  key: VideoSortKey,
  desc: boolean,
): VideoStats[] {
  return [...videos].sort((a, b) => {
    const aValue = sortValue(a, key);
    const bValue = sortValue(b, key);
    return desc ? bValue - aValue : aValue - bValue;
  });
}

/**
 * Clamps a requested page to the current dataset. Switching channel or range,
 * or a refresh that returns fewer videos, must never leave the table on a page
 * past the end (#77).
 */
export function getVideoPageWindow(
  total: number,
  requestedPage: number,
  pageSize = VIDEO_TABLE_PAGE_SIZE,
): VideoPageWindow {
  const totalPages = Math.ceil(total / pageSize);
  const page = Math.min(
    Math.max(0, requestedPage),
    Math.max(0, totalPages - 1),
  );

  return {
    end: Math.min((page + 1) * pageSize, total),
    page,
    start: total === 0 ? 0 : page * pageSize + 1,
    total,
    totalPages,
  };
}

export function getAriaSort(
  isActive: boolean,
  isDescending: boolean,
): 'ascending' | 'descending' | 'none' {
  if (!isActive) return 'none';
  return isDescending ? 'descending' : 'ascending';
}
