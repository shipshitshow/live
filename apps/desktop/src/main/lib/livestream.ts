import fs from 'node:fs';
import path from 'node:path';
import type {
  ContentField,
  Topic,
  TopicFrontmatter,
  TopicGeneratedContent,
  TopicStatus,
  TopicUpdate,
} from '@shipshitshow/types';
import { CONTENT_FIELDS } from '@shipshitshow/types';

function resolveDataDir(): string {
  if (process.env.APP_DATA_DIR) {
    return process.env.APP_DATA_DIR;
  }

  const candidates = [
    path.join(process.cwd(), '..', 'app', 'data', 'livestream'),
    path.join(process.cwd(), 'apps', 'app', 'data', 'livestream'),
    path.resolve(__dirname, '..', '..', '..', 'app', 'data', 'livestream'),
    path.resolve(__dirname, '..', '..', '..', '..', 'app', 'data', 'livestream'),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0];
}

const DATA_DIR = resolveDataDir();

const EMPTY_GENERATED: TopicGeneratedContent = {
  linkedin_post: null,
  livestream_tweet: null,
  recap_tweet: null,
  thumbnail_v1: null,
  thumbnail_v2: null,
  thumbnail_v3: null,
  youtube_description: null,
  youtube_title: null,
};

function updateFrontmatterField(
  raw: string,
  key: string,
  value: string | null,
): string {
  const valStr = value === null ? 'null' : `"${value}"`;
  const regex = new RegExp(`^(${key}:).*$`, 'm');
  if (regex.test(raw)) {
    return raw.replace(regex, `$1 ${valStr}`);
  }
  return raw.replace(/\n---\n/, `\n${key}: ${valStr}\n---\n`);
}

function updateGeneratedField(
  raw: string,
  field: ContentField,
  value: string,
): string {
  const marker = '## Generated Content';
  const tag = `<!-- ${field} -->`;
  const endTag = `<!-- /${field} -->`;

  if (!raw.includes(marker)) {
    raw = `${raw.trimEnd()}\n\n${marker}\n\n`;
  }

  const tagIdx = raw.indexOf(tag);
  const endTagIdx = raw.indexOf(endTag);
  if (tagIdx !== -1 && endTagIdx !== -1) {
    return `${raw.slice(0, tagIdx + tag.length)}\n${value}\n${raw.slice(endTagIdx)}`;
  }

  return `${raw.trimEnd()}\n${tag}\n${value}\n${endTag}\n`;
}

function parseGeneratedContent(raw: string): TopicGeneratedContent {
  const marker = '## Generated Content';
  const idx = raw.indexOf(marker);
  if (idx === -1) return { ...EMPTY_GENERATED };

  const section = raw.slice(idx + marker.length);
  const result: TopicGeneratedContent = { ...EMPTY_GENERATED };

  for (const field of CONTENT_FIELDS) {
    const tag = `<!-- ${field} -->`;
    const endTag = `<!-- /${field} -->`;
    const start = section.indexOf(tag);
    const end = section.indexOf(endTag);
    if (start !== -1 && end !== -1) {
      result[field] = section.slice(start + tag.length, end).trim() || null;
    }
  }

  return result;
}

function isTopicStatus(value: string | null): value is TopicStatus {
  return value === 'backlog' || value === 'in_progress' || value === 'done';
}

export function parseFrontmatter(raw: string): {
  frontmatter: TopicFrontmatter;
  content: string;
  generated: TopicGeneratedContent;
} {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('Invalid frontmatter');

  const fm: Record<string, string | null> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val: string | null = line.slice(idx + 1).trim();
    if (val === 'null') val = null;
    if (typeof val === 'string') val = val.replace(/^["']|["']$/g, '');
    fm[key] = val;
  }

  const body = match[2].trim();
  const genMarker = '## Generated Content';
  const genIdx = body.indexOf(genMarker);
  const content = genIdx !== -1 ? body.slice(0, genIdx).trim() : body;
  const generated = parseGeneratedContent(raw);

  if (
    typeof fm.title !== 'string' ||
    typeof fm.slug !== 'string' ||
    typeof fm.source !== 'string' ||
    !isTopicStatus(fm.status) ||
    typeof fm.date !== 'string'
  ) {
    throw new Error('Invalid topic frontmatter');
  }

  return {
    content,
    frontmatter: {
      announcement_tweet: fm.announcement_tweet ?? null,
      date: fm.date,
      slug: fm.slug,
      source: fm.source,
      status: fm.status,
      thumbnail_prompt: fm.thumbnail_prompt,
      title: fm.title,
    },
    generated,
  };
}

export function getTopicsForDate(dateStr: string): Topic[] {
  const dir = path.join(DATA_DIR, dateStr);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((fileName) => {
      const raw = fs.readFileSync(path.join(dir, fileName), 'utf-8');
      const { frontmatter, content, generated } = parseFrontmatter(raw);
      return { ...frontmatter, content, fileName, generated };
    });
}

export function listDates(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];

  return fs
    .readdirSync(DATA_DIR, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name),
    )
    .map((entry) => entry.name)
    .sort((a, b) => b.localeCompare(a));
}

function findTopicFile(slug: string, date: string): string | null {
  const dir = path.join(DATA_DIR, date);
  if (!fs.existsSync(dir)) return null;

  const match = fs.readdirSync(dir).find((f) => f.endsWith(`-${slug}.md`));
  return match ? path.join(dir, match) : null;
}

export function saveTopicUpdate(
  date: string,
  slug: string,
  updates: TopicUpdate,
): boolean {
  const filePath = findTopicFile(slug, date);
  if (!filePath) return false;

  let raw = fs.readFileSync(filePath, 'utf-8');

  if (updates.status) {
    raw = updateFrontmatterField(raw, 'status', updates.status);
  }
  if (updates.thumbnail_prompt !== undefined) {
    raw = updateFrontmatterField(
      raw,
      'thumbnail_prompt',
      updates.thumbnail_prompt,
    );
  }

  if (updates.generated) {
    for (const field of CONTENT_FIELDS) {
      const value = updates.generated[field];
      if (value !== undefined && value !== null) {
        raw = updateGeneratedField(raw, field, value);
      }
    }
  }

  fs.writeFileSync(filePath, raw, 'utf-8');
  return true;
}

export function createTopic(input: {
  content: string;
  date: string;
  slug: string;
  source: string;
  title: string;
}): { fileName: string; slug: string; status: TopicStatus } {
  const topics = getTopicsForDate(input.date);
  const nextNum = topics.length + 1;
  const padded = String(nextNum).padStart(2, '0');
  const fileName = `topic-${padded}-${input.slug}.md`;

  const dir = path.join(DATA_DIR, input.date);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const markdown = `---
title: "${input.title}"
slug: "${input.slug}"
source: "${input.source}"
status: "backlog"
date: "${input.date}"
announcement_tweet: null
thumbnail_prompt: null
---

${input.content}

## Generated Content
`;

  fs.writeFileSync(path.join(dir, fileName), markdown, 'utf-8');
  return { fileName, slug: input.slug, status: 'backlog' };
}

export function readTopicRaw(date: string, slug: string): string | null {
  const filePath = findTopicFile(slug, date);
  if (!filePath) return null;
  return fs.readFileSync(filePath, 'utf-8');
}
