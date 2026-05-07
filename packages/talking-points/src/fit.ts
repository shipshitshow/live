import type { TrendItem } from '@shipshitshow/types';

interface Rule {
  label: string;
  patterns: RegExp[];
  score: number;
}

const SHOW_FIT_RULES: Rule[] = [
  {
    label: 'coding agents',
    patterns: [
      /claude code/i,
      /\bcodex\b/i,
      /\bcursor\b/i,
      /openclaw/i,
      /windsurf/i,
      /github copilot/i,
      /replit agent/i,
      /coding agent/i,
      /ai coding/i,
    ],
    score: 30,
  },
  {
    label: 'agent workflows',
    patterns: [
      /agentic/i,
      /ai agents?/i,
      /orchestrat/i,
      /\bmcp\b/i,
      /harness/i,
      /workflow/i,
      /codebase/i,
      /\brepo\b/i,
      /\bcli\b/i,
      /terminal/i,
      /discord/i,
      /slack/i,
    ],
    score: 24,
  },
  {
    label: 'operator stakes',
    patterns: [
      /token/i,
      /pricing/i,
      /\bcost\b/i,
      /\bbill\b/i,
      /security/i,
      /trust/i,
      /benchmark/i,
      /outage/i,
      /bug/i,
      /production/i,
      /review/i,
    ],
    score: 20,
  },
  {
    label: 'software reset',
    patterns: [
      /\bsaas\b/i,
      /github/i,
      /linear/i,
      /open source/i,
      /software engineering/i,
      /developer/i,
      /founder/i,
      /startup/i,
    ],
    score: 16,
  },
  {
    label: 'model labs',
    patterns: [
      /openai/i,
      /anthropic/i,
      /claude/i,
      /\bgpt/i,
      /gemini/i,
      /deepseek/i,
      /\bqwen\b/i,
      /ollama/i,
      /local llm/i,
    ],
    score: 12,
  },
];

const CREATOR_BOOSTS: Rule[] = [
  {
    label: 'builder signal',
    patterns: [
      /theo/i,
      /t3\.gg/i,
      /riley brown/i,
      /karpathy/i,
      /aakash gupta/i,
      /gergely/i,
      /mitchell hashimoto/i,
      /openai/i,
      /anthropic/i,
      /cursor/i,
      /linear/i,
      /sequoia/i,
    ],
    score: 12,
  },
];

const GENERIC_PENALTIES: Rule[] = [
  {
    label: 'generic ai',
    patterns: [
      /viral videos?/i,
      /chatgpt conversation/i,
      /ai magic/i,
      /top \d+ ai tools/i,
      /make money with ai/i,
      /futuretech/i,
    ],
    score: -18,
  },
  {
    label: 'non-english signal',
    patterns: [
      /制限|解説|なのだ|بديل|بدون|Вайбкодинг|ПОБЕДИЛ|Dijital|programador/i,
    ],
    score: -14,
  },
];

function getHaystack(item: TrendItem): string {
  return [item.title, item.summary, item.author, item.subreddit, item.url]
    .filter(Boolean)
    .join(' ');
}

function applyRules(
  haystack: string,
  rules: Rule[],
): { reasons: string[]; score: number } {
  const reasons: string[] = [];
  let score = 0;

  for (const rule of rules) {
    if (!rule.patterns.some((pattern) => pattern.test(haystack))) continue;
    score += rule.score;
    reasons.push(rule.label);
  }

  return { reasons, score };
}

export function getShowFit(item: TrendItem): {
  reasons: string[];
  score: number;
} {
  const haystack = getHaystack(item);
  const positive = applyRules(haystack, SHOW_FIT_RULES);
  const creators = applyRules(haystack, CREATOR_BOOSTS);
  const penalties = applyRules(haystack, GENERIC_PENALTIES);
  const sourceFloor = item.source === 'x' || item.source === 'youtube' ? 8 : 0;
  const score = Math.max(
    0,
    Math.min(
      100,
      positive.score + creators.score + penalties.score + sourceFloor,
    ),
  );

  return {
    reasons: Array.from(
      new Set([...positive.reasons, ...creators.reasons]),
    ).slice(0, 4),
    score,
  };
}

export function withShowFit(item: TrendItem): TrendItem {
  const fit = getShowFit(item);

  return {
    ...item,
    showReasons: fit.reasons,
    showScore: fit.score,
  };
}

export function withShowFitItems(items: TrendItem[]): TrendItem[] {
  return items.map(withShowFit);
}
