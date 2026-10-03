import { describe, expect, test } from 'bun:test';
import type { VideoStats } from '@shipshitshow/types';
import { getAriaSort, getVideoPageWindow, sortVideos } from '@/lib/video-table';

function video(id: string, views: number, published_at: string): VideoStats {
  return {
    avg_view_duration_seconds: 0,
    comments: 0,
    ctr: 0,
    impressions: 0,
    likes: 0,
    published_at,
    title: id,
    video_id: id,
    views,
    watch_time_minutes: 0,
  };
}

describe('getVideoPageWindow', () => {
  test('clamps a final page that no longer exists after the dataset shrinks', () => {
    // Page 8 of 77 videos, then the channel switch leaves 27 (#77).
    expect(getVideoPageWindow(77, 7)).toEqual({
      end: 77,
      page: 7,
      start: 71,
      total: 77,
      totalPages: 8,
    });
    expect(getVideoPageWindow(27, 7)).toEqual({
      end: 27,
      page: 2,
      start: 21,
      total: 27,
      totalPages: 3,
    });
  });

  test('keeps an empty dataset on page zero with a zero range', () => {
    expect(getVideoPageWindow(0, 4)).toEqual({
      end: 0,
      page: 0,
      start: 0,
      total: 0,
      totalPages: 0,
    });
  });

  test('never returns a negative page', () => {
    expect(getVideoPageWindow(15, -3).page).toBe(0);
  });

  test('keeps a valid page untouched', () => {
    expect(getVideoPageWindow(25, 1)).toMatchObject({
      end: 20,
      page: 1,
      start: 11,
    });
  });
});

describe('sortVideos', () => {
  const videos = [
    video('a', 5, '2026-09-01T00:00:00Z'),
    video('b', 50, '2026-08-01T00:00:00Z'),
    video('c', 20, '2026-10-01T00:00:00Z'),
  ];

  test('sorts numeric columns in both directions without mutating input', () => {
    expect(sortVideos(videos, 'views', true).map((v) => v.video_id)).toEqual([
      'b',
      'c',
      'a',
    ]);
    expect(sortVideos(videos, 'views', false).map((v) => v.video_id)).toEqual([
      'a',
      'c',
      'b',
    ]);
    expect(videos.map((v) => v.video_id)).toEqual(['a', 'b', 'c']);
  });

  test('sorts by publish date', () => {
    expect(
      sortVideos(videos, 'published_at', true).map((v) => v.video_id),
    ).toEqual(['c', 'a', 'b']);
  });
});

describe('getAriaSort', () => {
  test('exposes direction only on the active column', () => {
    expect(getAriaSort(true, true)).toBe('descending');
    expect(getAriaSort(true, false)).toBe('ascending');
    expect(getAriaSort(false, true)).toBe('none');
  });
});
