import type { TrendItem } from '@shipshitshow/types';
import { slugify } from './items';
import { TREND_SOURCE_LABELS } from './source-labels';

function getTrendMetricLabel(item: TrendItem): string {
  if (item.source === 'youtube') return 'views';
  return 'points';
}

export function buildLivestreamTopicDraft(item: TrendItem): {
  content: string;
  slug: string;
  source: string;
  title: string;
} {
  const source = TREND_SOURCE_LABELS[item.source];
  const content = `## Source

- [${source}](${item.url}) — ${item.score.toLocaleString()} ${getTrendMetricLabel(item)}, ${item.commentCount.toLocaleString()} comments

## Summary

${item.summary || item.title}`;

  return {
    content,
    slug: slugify(item.title),
    source,
    title: item.title,
  };
}
