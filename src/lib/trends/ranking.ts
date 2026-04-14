import type { TrendItem, TrendSource } from "@/lib/trends-types";

const SCORE_UNITS: Record<TrendSource, number> = {
  hackernews: 30,
  reddit: 40,
  youtube: 20000,
  x: 120,
};

const COMMENT_UNITS: Record<TrendSource, number> = {
  hackernews: 12,
  reddit: 15,
  youtube: 40,
  x: 8,
};

const MAX_AGE_HOURS: Record<TrendSource, number> = {
  hackernews: 48,
  reddit: 72,
  youtube: 96,
  x: 24,
};

function getAgeHours(timestamp: string): number {
  const ageMs = Date.now() - new Date(timestamp).getTime();
  return Math.max(0, ageMs / (1000 * 60 * 60));
}

export function hasMinimumTrendEngagement(item: TrendItem): boolean {
  switch (item.source) {
    case "reddit":
      return item.score >= 25 || item.commentCount >= 12;
    case "hackernews":
      return item.score >= 20 || item.commentCount >= 10;
    case "youtube":
      return item.score >= 10000 || item.commentCount >= 25;
    case "x":
      return item.score >= 80 || item.commentCount >= 5;
    default:
      return true;
  }
}

export function getTrendRank(item: TrendItem): number {
  const ageHours = getAgeHours(item.timestamp);
  const maxAge = MAX_AGE_HOURS[item.source];

  if (ageHours > maxAge) {
    return -1;
  }

  const normalizedScore = item.score / SCORE_UNITS[item.source];
  const normalizedComments = item.commentCount / COMMENT_UNITS[item.source];
  const discussionBoost = 1 + Math.min(0.75, Math.log10(item.commentCount + 1) * 0.35);
  const freshness = Math.max(0.2, 1 - ageHours / maxAge);
  const breakingBoost = ageHours <= 6 ? 1.15 : 1;

  return (normalizedScore + normalizedComments) * discussionBoost * freshness * breakingBoost;
}

export function sortTrendItems(items: TrendItem[]): TrendItem[] {
  return items
    .filter(hasMinimumTrendEngagement)
    .sort((a, b) => {
      const rankDiff = getTrendRank(b) - getTrendRank(a);
      if (rankDiff !== 0) return rankDiff;

      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) return scoreDiff;

      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
}
