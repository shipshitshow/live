import type { TrendItem } from '@shipshitshow/types';

interface Rule {
  label: string;
  patterns: RegExp[];
  score: number;
}

// Since the 2026-08-10 pivot an episode is a business problem solved live, so
// the scorer leads with problem-shaped signals. Everything below is a plain
// keyword rule on purpose — the score has to be reproducible without a model
// call, because it also drives the ranking thresholds in ranking.ts.
const B2B_PROBLEM_RULES: Rule[] = [
  {
    label: 'solvable business problem',
    patterns: [
      // Phone lines and support desks — what a receptionist absorbs today.
      /call cent(er|re)/i,
      /phone (line|system|calls?)/i,
      /inbound calls?/i,
      /missed calls?/i,
      /answering service/i,
      /receptionist/i,
      /front desk/i,
      /customer (support|service)/i,
      /help ?desk/i,
      /support (queue|tickets?)/i,
      /\bivr\b/i,
      // Hiring and staffing gaps.
      /hiring/i,
      /recruit(er|ing|ment)/i,
      /applicants?/i,
      /candidate screening/i,
      /can'?t (hire|staff|find)\b/i,
      /(under|short)[- ]staffed/i,
      /headcount/i,
      // Back office and money movement.
      /invoic/i,
      /accounts (payable|receivable)/i,
      /bookkeep/i,
      /payroll/i,
      /expense reports?/i,
      /purchase orders?/i,
      /reconcil/i,
      // Sales ops and client delivery.
      /\bcrm\b/i,
      /sales (ops|pipeline|team)/i,
      /lead (gen|qualification|routing)/i,
      /(client|customer|employee) onboarding/i,
      /\bagenc(y|ies)\b/i,
      /appointments?/i,
      /no[- ]shows?/i,
    ],
    score: 36,
  },
  {
    label: 'demo-able live',
    patterns: [
      /\b(we|i) (built|shipped|replaced|automated)\b/i,
      /weekend (project|build)/i,
      /show hn/i,
      /fork(ed|ing)? (an?|the|our|my) \w+/i,
      /voice (agent|ai|bot)/i,
      /\b(vapi|retell|bland|livekit|twilio)\b/i,
      /webhooks?/i,
      /no[- ]code/i,
    ],
    score: 22,
  },
  {
    label: 'manual work to automate',
    patterns: [
      /manual(ly)? (process(es)?|work|entry|review|steps?)/i,
      /data entry/i,
      /copy[- ]?past/i,
      /spreadsheets?/i,
      /google sheets/i,
      /back[- ]?office/i,
      /paperwork/i,
      /ticket (triage|queue)/i,
      /repetitive (tasks?|work)/i,
      /hours (a|per) week/i,
      /\bautomat(e|es|ed|ing|ion)\b/i,
      /\b(zapier|n8n|make\.com|airtable|retool)\b/i,
    ],
    score: 22,
  },
  {
    label: 'replaces a SaaS seat',
    patterns: [
      /per[- ]seat/i,
      /cost per (seat|user)/i,
      /seat licen[cs]e/i,
      /\$\d+ ?\/ ?(seat|user|month)/i,
      /cancel(l?ed|l?ing)? (our|their|the|my) (subscription|contract)/i,
      /vendor lock[- ]?in/i,
      /open[- ]source alternative/i,
      /self[- ]host/i,
      /replac\w* (salesforce|hubspot|zendesk|intercom|jira|notion|airtable|workday|greenhouse|calendly|docusign|servicenow)/i,
      /replac\w* (a|an|our|their|the|my) (saas|vendor|crm|erp|help ?desk|tool|subscription)/i,
    ],
    score: 20,
  },
  {
    label: 'smb pain',
    patterns: [
      /small business(es)?/i,
      /\bsmbs?\b/i,
      /\bsmes?\b/i,
      /local business(es)?/i,
      /(dental|medical|law|accounting|insurance) (firm|office|practice|clinic|agency)/i,
      /restaurants?/i,
      /property manage/i,
      /field service/i,
      /ops team/i,
      /customer churn/i,
    ],
    score: 16,
  },
];

const SHOW_FIT_RULES: Rule[] = [
  {
    label: 'build tool',
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
    score: 20,
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
    score: 16,
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
      /outage/i,
      /production/i,
    ],
    score: 14,
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
    score: 10,
  },
  {
    // Lab and leaderboard news is what we build *with*, not what an episode is
    // about, so it stays visible as a reason while carrying little weight.
    label: 'build-tool news',
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
      /benchmark/i,
      /leaderboard/i,
      /\bevals?\b/i,
    ],
    score: 12,
  },
];

// Applied only when nothing buildable matched: a bare version bump or a
// leaderboard scrap is not a business problem we can solve on stream.
const MODEL_NEWS_DISCOUNTS: Rule[] = [
  {
    label: 'model news only',
    patterns: [
      /\b(gpt|claude|gemini|llama|qwen|grok|mistral|deepseek)[- ]?\d/i,
      /new (model|llm)\b/i,
      /model (launch|release|drop)/i,
      /benchmark/i,
      /leaderboard/i,
      /\bevals?\b/i,
      /\bsota\b/i,
      /state[- ]of[- ]the[- ]art/i,
      /outperform/i,
      /beats? (gpt|claude|gemini|llama|o\d)/i,
      /context window/i,
      /open[- ]weights?/i,
    ],
    score: -10,
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
  const problems = applyRules(haystack, B2B_PROBLEM_RULES);
  const positive = applyRules(haystack, SHOW_FIT_RULES);
  const creators = applyRules(haystack, CREATOR_BOOSTS);
  const penalties = applyRules(haystack, GENERIC_PENALTIES);
  const modelNews = problems.reasons.length
    ? { reasons: [], score: 0 }
    : applyRules(haystack, MODEL_NEWS_DISCOUNTS);
  const sourceFloor = item.source === 'x' || item.source === 'youtube' ? 8 : 0;
  const score = Math.max(
    0,
    Math.min(
      100,
      problems.score +
        positive.score +
        creators.score +
        penalties.score +
        modelNews.score +
        sourceFloor,
    ),
  );

  return {
    // Problem reasons come first so the trends UI spends its four chips on the
    // business angle before the build-tool context.
    reasons: Array.from(
      new Set([...problems.reasons, ...positive.reasons, ...creators.reasons]),
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
