import { parseSections, parseSubSections } from '@/lib/markdown-render';
import { stripMarkdown } from '@/lib/text';

const OPENING_BRACKETS: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
};
const CLOSING_BRACKETS = new Set(Object.values(OPENING_BRACKETS));
const QUOTES = new Set(["'", '"', '‘', '’', '“', '”']);
const WORD_CHAR = /[\p{L}\p{N}]/u;
/** Generated prep files stub every thesis as `Okay, so this segment is about <heading>.` */
const PLACEHOLDER_THESIS = /^okay, so this segment is about\b/i;

function splitTopLevel(source: string, honorQuotes: boolean): string[] | null {
  const parts: string[] = [];
  const brackets: string[] = [];
  let inQuote = false;
  let current = '';

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const prev = source[i - 1] ?? '';
    const next = source[i + 1] ?? '';

    if (honorQuotes && QUOTES.has(char)) {
      // An apostrophe inside a word (`Dario's`) neither opens nor closes.
      if (!inQuote && !WORD_CHAR.test(prev)) inQuote = true;
      else if (inQuote && !WORD_CHAR.test(next)) inQuote = false;
    } else if (!inQuote && OPENING_BRACKETS[char]) {
      brackets.push(OPENING_BRACKETS[char]);
    } else if (!inQuote && CLOSING_BRACKETS.has(char)) {
      if (brackets.at(-1) === char) brackets.pop();
    } else if (char === ',' && !inQuote && brackets.length === 0) {
      parts.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  if (inQuote || brackets.length > 0) return null;
  parts.push(current);
  return parts;
}

/**
 * `source` is a freeform citation list. Commas separate citations only at the
 * top level: a comma inside `(…)`, `[…]` or a quoted title belongs to that
 * citation. Unbalanced quotes or brackets degrade to a plain comma split.
 */
export function parseTopicSources(source: string): string[] {
  const parts =
    splitTopLevel(source, true) ??
    splitTopLevel(source, false) ??
    source.split(',');

  return parts.map((part) => part.trim()).filter(Boolean);
}

function firstThesisParagraph(body: string): string | null {
  const thesis = firstProseParagraph(body);
  return thesis && !PLACEHOLDER_THESIS.test(thesis) ? thesis : null;
}

function firstProseParagraph(body: string): string | null {
  for (const block of body.split(/\n\s*\n/)) {
    const trimmed = block.trim();
    if (!trimmed || /^(#|-|\*\s|\d+\.\s|\||>)/.test(trimmed)) continue;
    const text = stripMarkdown(trimmed);
    if (text) return text;
  }
  return null;
}

/**
 * The card summary contract: the first prose paragraph of `## Summary`, else
 * the first written segment thesis (`## … Segment Thesis` or
 * `### Segment Thesis`). Notes, logistics, talking points and generated
 * placeholder theses never stand in for the topic's framing.
 */
export function getTopicSummary(content: string): string | null {
  const sections = parseSections(content);

  const summary = sections.find(
    (section) => section.title.trim().toLowerCase() === 'summary',
  );
  const fromSummary = summary ? firstProseParagraph(summary.body) : null;
  if (fromSummary) return fromSummary;

  for (const section of sections) {
    if (/segment thesis$/i.test(section.title.trim())) {
      const thesis = firstThesisParagraph(section.body);
      if (thesis) return thesis;
    }

    for (const sub of parseSubSections(section.body)) {
      if (sub.title.trim().toLowerCase() !== 'segment thesis') continue;
      const thesis = firstThesisParagraph(sub.body);
      if (thesis) return thesis;
    }
  }

  return null;
}
