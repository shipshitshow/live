import { stripMarkdown } from '@/lib/text';

export type TranscriptScoreId =
  | 'hook'
  | 'structure'
  | 'signal'
  | 'specificity'
  | 'delivery'
  | 'audience';

export interface TranscriptScoreCriterion {
  description: string;
  id: TranscriptScoreId;
  label: string;
  weight: number;
}

export interface TranscriptScoreItem extends TranscriptScoreCriterion {
  note: string;
  score: number;
}

export interface TranscriptScorecard {
  grade: string;
  improvements: string[];
  items: TranscriptScoreItem[];
  overall: number;
  stats: {
    estimatedMinutes: number;
    fillerPerThousand: number;
    questionCount: number;
    wordCount: number;
  };
  strengths: string[];
}

export const TRANSCRIPT_RATE_CARD: TranscriptScoreCriterion[] = [
  {
    description:
      'Opens with a clear promise, tension, or reason to keep watching.',
    id: 'hook',
    label: 'Hook',
    weight: 0.18,
  },
  {
    description:
      'Moves through setup, development, contrast, and close without drifting.',
    id: 'structure',
    label: 'Structure',
    weight: 0.17,
  },
  {
    description:
      'Maintains a high ratio of useful ideas to filler and repeated setup.',
    id: 'signal',
    label: 'Signal',
    weight: 0.2,
  },
  {
    description:
      'Uses concrete names, numbers, tools, examples, and claims that can be clipped.',
    id: 'specificity',
    label: 'Specificity',
    weight: 0.18,
  },
  {
    description:
      'Reads cleanly as spoken media: pace, filler, and repetition are controlled.',
    id: 'delivery',
    label: 'Delivery',
    weight: 0.12,
  },
  {
    description:
      'Gives the audience takeaways, stakes, and a reason to act or share.',
    id: 'audience',
    label: 'Audience Value',
    weight: 0.15,
  },
];

const FILLER_TERMS = [
  'actually',
  'basically',
  'i mean',
  'kind of',
  'like',
  'literally',
  'right',
  'sort of',
  'um',
  'uh',
  'you know',
];

const TECH_SIGNAL_TERMS = [
  'agent',
  'ai',
  'api',
  'app',
  'automation',
  'build',
  'claude',
  'code',
  'codex',
  'cursor',
  'developer',
  'github',
  'gpt',
  'model',
  'open source',
  'product',
  'software',
  'startup',
  'tool',
  'workflow',
];

const SPECIFICITY_TERMS = [
  'anthropic',
  'claude',
  'codex',
  'cursor',
  'github',
  'gpt',
  'openai',
  'sora',
  'vercel',
];

function clampScore(value: number): number {
  return Math.max(1, Math.min(10, Math.round(value)));
}

function countMatches(text: string, pattern: RegExp): number {
  return Array.from(text.matchAll(pattern)).length;
}

function countTerms(text: string, terms: string[]): number {
  return terms.reduce((count, term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return count + countMatches(text, new RegExp(`\\b${escaped}\\b`, 'gi'));
  }, 0);
}

function getWords(transcript: string): string[] {
  return stripMarkdown(transcript)
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^a-z0-9'$%.-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function getGrade(score: number): string {
  if (score >= 9) return 'A';
  if (score >= 8) return 'B';
  if (score >= 7) return 'C';
  if (score >= 6) return 'D';
  return 'F';
}

function getNote(id: TranscriptScoreId, score: number): string {
  const level =
    score >= 8 ? 'strong' : score >= 6 ? 'mixed' : 'needs tightening';

  const notes: Record<TranscriptScoreId, string> = {
    audience:
      level === 'strong'
        ? 'Clear viewer stakes and reusable takeaways.'
        : level === 'mixed'
          ? 'Some audience value, but the payoff could be sharper.'
          : 'Needs clearer takeaways and viewer-facing stakes.',
    delivery:
      level === 'strong'
        ? 'Spoken flow is controlled and clip-friendly.'
        : level === 'mixed'
          ? 'Readable, with some filler or pacing drag.'
          : 'Filler and repetition dilute the delivery.',
    hook:
      level === 'strong'
        ? 'Starts with a clear reason to keep watching.'
        : level === 'mixed'
          ? 'Opening has a promise, but it could land faster.'
          : 'Opening needs a sharper promise or conflict.',
    signal:
      level === 'strong'
        ? 'Dense with useful ideas relative to runtime.'
        : level === 'mixed'
          ? 'Useful material is present, with some drift.'
          : 'Signal gets buried under repetition or setup.',
    specificity:
      level === 'strong'
        ? 'Grounded in concrete tools, numbers, and examples.'
        : level === 'mixed'
          ? 'Some concrete references, but more proof would help.'
          : 'Needs more named examples, numbers, or receipts.',
    structure:
      level === 'strong'
        ? 'Progression is easy to follow.'
        : level === 'mixed'
          ? 'Mostly coherent, with some loose transitions.'
          : 'Needs clearer sections and a stronger close.',
  };

  return notes[id];
}

export function analyzeTranscriptScorecard(
  transcript: string | null | undefined,
): TranscriptScorecard | null {
  if (!transcript?.trim()) return null;

  const words = getWords(transcript);
  if (words.length === 0) return null;

  const lowerText = words.join(' ');
  const firstWords = words.slice(0, 140).join(' ');
  const uniqueRatio = new Set(words).size / words.length;
  const estimatedMinutes = Math.max(1, Math.round(words.length / 150));
  const fillerCount = countTerms(lowerText, FILLER_TERMS);
  const fillerPerThousand = (fillerCount / words.length) * 1000;
  const questionCount = countMatches(transcript, /\?/g);
  const transitionCount = countMatches(
    lowerText,
    /\b(first|second|third|next|then|but|because|so|finally|the point is|what this means|here's why)\b/gi,
  );
  const numberCount = countMatches(lowerText, /\b(?:\d+|\$[\d,.]+|\d+%)\b/g);
  const signalCount = countTerms(lowerText, TECH_SIGNAL_TERMS);
  const specificityCount =
    countTerms(lowerText, SPECIFICITY_TERMS) + numberCount;
  const audienceCount = countMatches(
    lowerText,
    /\b(you|your|watch|build|ship|need|should|learn|takeaway|subscribe|comment|share|try|use this)\b/gi,
  );
  const hookCount = countMatches(
    firstWords,
    /\b(dead|future|why|today|need|problem|build|rebuild|limit|killed|best|worst|watch|talk about)\b/gi,
  );

  const scores: Record<TranscriptScoreId, number> = {
    audience: clampScore(
      4 + Math.min(4, audienceCount / 35) + Math.min(2, questionCount / 4),
    ),
    delivery: clampScore(10 - fillerPerThousand / 7 + uniqueRatio * 2),
    hook: clampScore(4 + Math.min(5, hookCount) + (questionCount > 0 ? 1 : 0)),
    signal: clampScore(
      4 +
        Math.min(4, signalCount / 55) +
        uniqueRatio * 3 -
        fillerPerThousand / 20,
    ),
    specificity: clampScore(3 + Math.min(7, specificityCount / 12)),
    structure: clampScore(
      4 +
        Math.min(4, transitionCount / 75) +
        (estimatedMinutes >= 20 && estimatedMinutes <= 90 ? 1 : 0),
    ),
  };

  const items = TRANSCRIPT_RATE_CARD.map((criterion) => ({
    ...criterion,
    note: getNote(criterion.id, scores[criterion.id]),
    score: scores[criterion.id],
  }));

  const overall = clampScore(
    items.reduce((total, item) => total + item.score * item.weight, 0),
  );
  const sorted = [...items].sort((a, b) => b.score - a.score);

  return {
    grade: getGrade(overall),
    improvements: sorted.slice(-2).map((item) => item.note),
    items,
    overall,
    stats: {
      estimatedMinutes,
      fillerPerThousand: Number(fillerPerThousand.toFixed(1)),
      questionCount,
      wordCount: words.length,
    },
    strengths: sorted.slice(0, 2).map((item) => item.note),
  };
}
