import { describe, expect, test } from 'bun:test';
import { mapCampaignClickRows } from '@/lib/posthog/client';

describe('mapCampaignClickRows', () => {
  test('splits PostHog rows into per-channel counts', () => {
    expect(
      mapCampaignClickRows([
        ['linkedin', 12],
        ['x', 3],
      ]),
    ).toEqual({ linkedin: 12, total: 15, x: 3 });
  });

  test('reports a measured zero for a channel PostHog did not return', () => {
    expect(mapCampaignClickRows([['linkedin', 4]])).toEqual({
      linkedin: 4,
      total: 4,
      x: 0,
    });
  });

  test('coerces the numeric strings ClickHouse can hand back', () => {
    expect(mapCampaignClickRows([['linkedin', '7']])).toEqual({
      linkedin: 7,
      total: 7,
      x: 0,
    });
  });

  test('ignores sources outside the convention', () => {
    expect(
      mapCampaignClickRows([
        ['linkedin', 2],
        ['newsletter', 99],
      ]),
    ).toEqual({ linkedin: 2, total: 2, x: 0 });
  });

  test('survives a malformed payload without inventing clicks', () => {
    expect(mapCampaignClickRows(null)).toEqual({ linkedin: 0, total: 0, x: 0 });
    expect(mapCampaignClickRows([null, 'nope', []])).toEqual({
      linkedin: 0,
      total: 0,
      x: 0,
    });
  });
});
