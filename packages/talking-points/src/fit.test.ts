import { describe, expect, test } from 'bun:test';
import type { TrendItem } from '@shipshitshow/types';
import { getShowFit, withShowFitItems } from './fit';
import { sortTrendItems } from './ranking';

function buildItem(
  overrides: Partial<TrendItem> & { title: string },
): TrendItem {
  return {
    commentCount: 60,
    id: overrides.title,
    score: 120,
    source: 'hackernews',
    timestamp: new Date().toISOString(),
    url: 'https://news.ycombinator.com/item?id=1',
    ...overrides,
  };
}

const PHONE_LINE = buildItem({
  summary:
    'Their receptionist quit and the front desk was dropping inbound calls, ' +
    'so we built a voice agent that books appointments instead.',
  title: 'A dental practice could not staff its phone line',
});

const BENCHMARK = buildItem({
  summary:
    'The new model tops the leaderboard and beats Claude on agentic coding.',
  title: 'GPT-5.5 sets a new state-of-the-art benchmark score',
});

describe('getShowFit', () => {
  test('scores a staffing problem above model benchmark news', () => {
    expect(getShowFit(PHONE_LINE).score).toBeGreaterThan(
      getShowFit(BENCHMARK).score,
    );
  });

  test('leads the reasons with the business angle', () => {
    const { reasons } = getShowFit(PHONE_LINE);

    expect(reasons[0]).toBe('solvable business problem');
    expect(reasons).toContain('demo-able live');
  });

  test('keeps model news visible but framed as build-tool context', () => {
    const { reasons } = getShowFit(BENCHMARK);

    expect(reasons).toContain('build-tool news');
    expect(reasons).not.toContain('solvable business problem');
  });

  test('drops the model-news discount when a problem is attached', () => {
    const paired = buildItem({
      summary: 'We replaced a $90/seat helpdesk with it over a weekend.',
      title: 'GPT-5.5 launch: we rebuilt our support ticket triage on it',
    });

    expect(getShowFit(paired).score).toBeGreaterThan(
      getShowFit(BENCHMARK).score,
    );
  });

  test('does not reward generic AI slop', () => {
    const slop = buildItem({ title: 'Top 10 AI tools to make money with AI' });

    expect(getShowFit(slop).score).toBe(0);
  });
});

describe('sortTrendItems', () => {
  test('ranks the business problem first at equal engagement', () => {
    const sorted = sortTrendItems(withShowFitItems([BENCHMARK, PHONE_LINE]));

    expect(sorted.map((item) => item.title)).toEqual([
      PHONE_LINE.title,
      BENCHMARK.title,
    ]);
  });

  test('still surfaces model news that has real engagement', () => {
    const sorted = sortTrendItems(withShowFitItems([BENCHMARK]));

    expect(sorted).toHaveLength(1);
  });
});
