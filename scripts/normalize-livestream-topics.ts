import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = 'apps/app/data/livestream';

function useful(title: string): boolean {
  const normalized = title.toLowerCase();
  return (
    normalized === 'summary' ||
    normalized === 'hot take' ||
    normalized.startsWith('cold open') ||
    normalized.startsWith('talking points') ||
    normalized.startsWith('close') ||
    normalized.startsWith('closing') ||
    normalized.startsWith('tweets') ||
    normalized.startsWith('sources')
  );
}

function normalizeHeading(title: string, hasSummary: boolean): string {
  const trimmed = title.trim();
  const normalized = trimmed.toLowerCase();

  if (useful(trimmed)) return trimmed;
  if (normalized === 'episode thesis') {
    return hasSummary ? 'Talking Points — Episode Thesis' : 'Summary';
  }
  if (normalized === 'source') return 'Sources — Source';
  if (normalized.includes('tweet')) return `Tweets — ${trimmed}`;
  if (
    normalized.includes('youtube') ||
    normalized.includes('x timeline') ||
    normalized.includes('x references') ||
    normalized.includes('x / social') ||
    normalized.includes('reference')
  ) {
    return `Sources — ${trimmed}`;
  }
  if (normalized === 'conclusion') return 'Closing Take';

  return `Talking Points — ${trimmed}`;
}

function sectionName(title: string): string {
  return (
    title.replace(/^Talking Points\s*(?:[—-]\s*)?/i, '').trim() || 'this topic'
  );
}

function wrapTalkingPoint(title: string, body: string): string {
  const hasSegment = /^### Segment Thesis\s*$/m.test(body);
  const hasTalking = /^### Talking Points\s*$/m.test(body);
  const hasHost = /^### Host Notes\s*$/m.test(body);
  if (hasSegment && hasTalking && hasHost) return body;

  const demoted = body.replace(/^###\s+/gm, '#### ').trim();
  const name = sectionName(title);
  const thesis =
    name === 'this topic'
      ? 'Okay, so this is the useful part of the topic.'
      : `Okay, so this segment is about ${name}.`;

  return [
    '### Segment Thesis',
    '',
    thesis,
    '',
    '### Talking Points',
    '',
    demoted || '- Add the useful live talking points here.',
    '',
    '### Host Notes',
    '',
    '- Ask Mitchell:',
    '- Pull up:',
    "- Don't pretend:",
  ].join('\n');
}

function transform(text: string): string {
  const hasSummary = /^## Summary\s*$/m.test(text);
  const normalized = text.replace(/^## (.+)$/gm, (_, title: string) => {
    return `## ${normalizeHeading(title, hasSummary)}`;
  });

  const matches = Array.from(normalized.matchAll(/^## (.+)$/gm));
  if (matches.length === 0) return normalized;

  let output = normalized.slice(0, matches[0].index);
  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const next = matches[i + 1];
    const title = match[1].trim();
    const bodyStart = (match.index ?? 0) + match[0].length;
    const body = normalized.slice(bodyStart, next?.index).trim();

    output += `## ${title}\n\n`;
    if (title.toLowerCase().startsWith('talking points')) {
      output += `${wrapTalkingPoint(title, body)}\n\n`;
    } else if (body) {
      output += `${body}\n\n`;
    }
  }

  return `${output.trimEnd()}\n`;
}

const files = readdirSync(root).flatMap((date) => {
  const dir = join(root, date);
  try {
    return readdirSync(dir)
      .filter((file) => file.endsWith('.md'))
      .map((file) => join(dir, file));
  } catch {
    return [];
  }
});

let changed = 0;
for (const file of files) {
  const before = readFileSync(file, 'utf8');
  const after = transform(before);
  if (after !== before) {
    writeFileSync(file, after, 'utf8');
    changed += 1;
    console.log(file);
  }
}

console.log(`changed=${changed}`);
