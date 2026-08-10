import { describe, expect, test } from 'bun:test';
import type { LinkedInPostEntry } from '@shipshitshow/types';
import {
  findInvalidLinkedInPostIndexes,
  isLivestreamDate,
  normalizeLinkedInPosts,
  parseStoredLinkedInPosts,
} from '@/lib/linkedin-metrics-store';

const NOW = '2026-08-10T12:00:00.000Z';
const POST_URL = 'https://www.linkedin.com/feed/update/urn:li:activity:1/';

function buildInput(overrides: Record<string, unknown> = {}) {
  return {
    author: 'vincent',
    id: 'post-1',
    metrics: { comments: null, impressions: 5, reactions: null },
    postUrl: POST_URL,
    publishedOn: '2026-08-10',
    ...overrides,
  };
}

describe('isLivestreamDate', () => {
  test('accepts only YYYY-MM-DD', () => {
    expect(isLivestreamDate('2026-08-10')).toBe(true);
    expect(isLivestreamDate('2026-8-10')).toBe(false);
    expect(isLivestreamDate('../secrets')).toBe(false);
  });
});

describe('parseStoredLinkedInPosts', () => {
  test('keeps the stored recording timestamp on read', () => {
    const [post] = parseStoredLinkedInPosts([
      buildInput({ metricsRecordedAt: '2026-08-01T09:00:00.000Z' }),
    ]);

    expect(post.metricsRecordedAt).toBe('2026-08-01T09:00:00.000Z');
    expect(post.metricsProvenance).toBe('manual');
    expect(post.metrics.impressions).toBe(5);
  });

  test('drops entries that are not LinkedIn permalinks', () => {
    expect(
      parseStoredLinkedInPosts([
        buildInput({ postUrl: 'https://example.com/post' }),
      ]),
    ).toEqual([]);
  });

  test('drops entries from an unknown author', () => {
    expect(parseStoredLinkedInPosts([buildInput({ author: 'anon' })])).toEqual(
      [],
    );
  });

  test('has no timestamp when no metric was ever recorded', () => {
    const [post] = parseStoredLinkedInPosts([
      buildInput({
        metrics: { comments: null, impressions: null, reactions: null },
        metricsRecordedAt: '2026-08-01T09:00:00.000Z',
      }),
    ]);

    expect(post.metricsRecordedAt).toBeNull();
  });

  test('returns nothing for a non-array payload', () => {
    expect(parseStoredLinkedInPosts(undefined)).toEqual([]);
  });
});

describe('normalizeLinkedInPosts', () => {
  test('stamps the recording time when metrics first arrive', () => {
    const [post] = normalizeLinkedInPosts([buildInput()], [], NOW);

    expect(post.metricsRecordedAt).toBe(NOW);
    expect(post.metricsProvenance).toBe('manual');
  });

  test('keeps the original timestamp when the numbers are unchanged', () => {
    const existing: LinkedInPostEntry[] = [
      {
        author: 'vincent',
        id: 'post-1',
        metrics: { comments: null, impressions: 5, reactions: null },
        metricsProvenance: 'manual',
        metricsRecordedAt: '2026-08-01T09:00:00.000Z',
        postUrl: POST_URL,
        publishedOn: '2026-08-10',
      },
    ];

    const [post] = normalizeLinkedInPosts([buildInput()], existing, NOW);

    expect(post.metricsRecordedAt).toBe('2026-08-01T09:00:00.000Z');
  });

  test('re-stamps when a number actually changes', () => {
    const existing: LinkedInPostEntry[] = [
      {
        author: 'vincent',
        id: 'post-1',
        metrics: { comments: null, impressions: 5, reactions: null },
        metricsProvenance: 'manual',
        metricsRecordedAt: '2026-08-01T09:00:00.000Z',
        postUrl: POST_URL,
        publishedOn: '2026-08-10',
      },
    ];

    const [post] = normalizeLinkedInPosts(
      [buildInput({ metrics: { impressions: 9 } })],
      existing,
      NOW,
    );

    expect(post.metrics.impressions).toBe(9);
    expect(post.metricsRecordedAt).toBe(NOW);
  });

  test('treats unrecorded metrics as null rather than zero', () => {
    const [post] = normalizeLinkedInPosts(
      [
        buildInput({
          metrics: { comments: '', impressions: -3, reactions: 'n/a' },
        }),
      ],
      [],
      NOW,
    );

    expect(post.metrics).toEqual({
      comments: null,
      impressions: null,
      reactions: null,
    });
    expect(post.metricsRecordedAt).toBeNull();
  });

  test('never lets a client claim API provenance', () => {
    const [post] = normalizeLinkedInPosts(
      [buildInput({ metricsProvenance: 'api' })],
      [],
      NOW,
    );

    expect(post.metricsProvenance).toBe('manual');
  });

  test('ignores an unusable publishedOn', () => {
    const [post] = normalizeLinkedInPosts(
      [buildInput({ publishedOn: 'yesterday' })],
      [],
      NOW,
    );

    expect(post.publishedOn).toBeNull();
  });
});

describe('findInvalidLinkedInPostIndexes', () => {
  test('points at the rows a save would silently drop', () => {
    expect(
      findInvalidLinkedInPostIndexes([
        buildInput(),
        buildInput({ postUrl: 'https://example.com/post' }),
        buildInput({ author: 'anon' }),
      ]),
    ).toEqual([1, 2]);
  });

  test('is empty when every row is usable', () => {
    expect(findInvalidLinkedInPostIndexes([buildInput()])).toEqual([]);
  });
});
