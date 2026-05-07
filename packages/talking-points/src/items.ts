import type { TrendItem } from '@shipshitshow/types';

export function dedupeTrendItems(items: TrendItem[]): TrendItem[] {
  const unique = new Map<string, TrendItem>();

  for (const item of items) {
    if (!unique.has(item.id)) {
      unique.set(item.id, item);
    }
  }

  return Array.from(unique.values());
}

export function sortTrendSearchItems(items: TrendItem[]): TrendItem[] {
  return [...items].sort((a, b) => {
    const showDiff = (b.showScore ?? 0) - (a.showScore ?? 0);
    if (showDiff !== 0) return showDiff;

    const scoreDiff = b.score - a.score;
    if (scoreDiff !== 0) return scoreDiff;

    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

export function slugify(value: string, maxLength = 60): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLength);
}
