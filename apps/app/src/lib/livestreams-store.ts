import fs from 'node:fs';
import path from 'node:path';
import type {
  ContentField,
  Topic,
  TopicDrawingResponse,
  TopicFrontmatter,
  TopicGeneratedContent,
  TopicStatus,
  TopicUpdate,
} from '@shipshitshow/types';
import { CONTENT_FIELDS } from '@shipshitshow/types';
import { get, list, put } from '@vercel/blob';
import { findTopicFile, getTopicDrawingFile } from '@/lib/livestreams-files';
import {
  extractLivestreamYouTubeUrl,
  extractVideoId,
} from '@/lib/livestreams-youtube';

const DATA_DIR =
  process.env.DATA_DIR || path.join(process.cwd(), 'data', 'livestream');
const TRANSCRIPTS_DIR = path.join(process.cwd(), 'data', 'transcripts');
const CLEAN_TRANSCRIPTS_DIR = path.join(TRANSCRIPTS_DIR, 'clean');
const BLOB_TOPICS_PREFIX = 'livestream/topics';
const BLOB_TOPIC_OVERRIDES_PREFIX = 'livestream/topic-overrides';
const BLOB_DRAWINGS_PREFIX = 'livestream/drawings';

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

interface StoredTopicOverride {
  generated?: Partial<TopicGeneratedContent>;
  status?: TopicStatus;
  thumbnail_prompt?: string | null;
}

export interface LivestreamHistoryItem {
  date: string;
  title: string;
  transcriptPath: string;
  videoId: string | null;
  youtubeUrl: string | null;
}

export type PublishedVideoType = 'livestream' | 'video';

export interface PublishedVideoItem {
  date: string;
  routeSlug: string;
  title: string;
  transcriptPath: string;
  type: PublishedVideoType;
  videoId: string | null;
  wordCount: number;
  youtubeUrl: string | null;
}

export interface LivestreamArchiveItem {
  date: string;
  hasTranscript: boolean;
  title: string;
  topicCount: number;
  topics: Topic[];
  transcriptPath: string | null;
  transcriptTitle: string | null;
  videoId: string | null;
  youtubeUrl: string | null;
}

function isBlobPersistenceEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isReadOnlyVercelRuntime(): boolean {
  return Boolean(process.env.VERCEL) && !isBlobPersistenceEnabled();
}

function createWritableStorageError(): Error {
  return new Error(
    'Writable livestream storage requires BLOB_READ_WRITE_TOKEN on Vercel',
  );
}

function getBlobTopicPath(date: string, slug: string): string {
  return `${BLOB_TOPICS_PREFIX}/${date}/${slug}.json`;
}

function getBlobTopicOverridePath(date: string, slug: string): string {
  return `${BLOB_TOPIC_OVERRIDES_PREFIX}/${date}/${slug}.json`;
}

function getBlobDrawingPath(date: string, slug: string): string {
  return `${BLOB_DRAWINGS_PREFIX}/${date}/${slug}.json`;
}

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

function normalizeHistoryKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleFromSlug(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getTranscriptWordCount(transcriptPath: string): number {
  const transcript = fs.readFileSync(transcriptPath, 'utf-8');
  return transcript.split(/\s+/).filter(Boolean).length;
}

function getPublishedVideoRouteSlug(
  date: string,
  type: PublishedVideoType,
  rawTitleSlug: string,
  videoId: string | null,
): string {
  return videoId ?? `${date}-${type}-${rawTitleSlug}`;
}

function getYoutubeUrl(videoId: string | null): string | null {
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
}

function getRawTranscriptVideoMap(): Map<
  string,
  { title: string; videoId: string }
> {
  const videoMap = new Map<string, { title: string; videoId: string }>();

  if (!fs.existsSync(TRANSCRIPTS_DIR)) return videoMap;

  for (const fileName of fs.readdirSync(TRANSCRIPTS_DIR)) {
    const match = fileName.match(/^([\w-]{11})-(.+)\.en\.vtt$/);
    if (!match) continue;

    const [, videoId, rawTitle] = match;
    const isLive = /^\[LIVE\]\s*/i.test(rawTitle);
    const type: PublishedVideoType = isLive ? 'livestream' : 'video';
    const title = rawTitle.replace(/^\[LIVE\]\s*/i, '');
    videoMap.set(`${type}:${normalizeHistoryKey(title)}`, { title, videoId });
  }

  return videoMap;
}

function listFilesystemPublishedVideos(): PublishedVideoItem[] {
  if (!fs.existsSync(CLEAN_TRANSCRIPTS_DIR)) return [];

  const videoMap = getRawTranscriptVideoMap();

  const items: PublishedVideoItem[] = [];
  for (const fileName of fs.readdirSync(CLEAN_TRANSCRIPTS_DIR)) {
    const match = fileName.match(
      /^(\d{4}-\d{2}-\d{2})-(livestream|video)-(.+)\.txt$/,
    );
    if (!match) continue;

    const [, date, type, rawTitleSlug] = match;
    const typed = type as PublishedVideoType;
    const transcriptPath = path.join(CLEAN_TRANSCRIPTS_DIR, fileName);
    const mapped = videoMap.get(
      `${typed}:${normalizeHistoryKey(rawTitleSlug)}`,
    );
    const title = mapped?.title ?? titleFromSlug(rawTitleSlug);
    const videoId = mapped?.videoId ?? null;

    items.push({
      date,
      routeSlug: getPublishedVideoRouteSlug(
        date,
        typed,
        rawTitleSlug,
        videoId,
      ),
      title,
      transcriptPath,
      type: typed,
      videoId,
      wordCount: getTranscriptWordCount(transcriptPath),
      youtubeUrl: getYoutubeUrl(videoId),
    } satisfies PublishedVideoItem);
  }

  return items.sort(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      a.type.localeCompare(b.type) ||
      a.title.localeCompare(b.title),
  );
}

export function isTopicStatus(value: string | null): value is TopicStatus {
  return value === 'draft' || value === 'backlog' || value === 'in_progress' || value === 'done';
}

function parseFrontmatter(raw: string): {
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
  const title = fm.title;
  const slug = fm.slug;
  const source = fm.source;
  const status = fm.status;
  const date = fm.date;

  if (
    typeof title !== 'string' ||
    typeof slug !== 'string' ||
    typeof source !== 'string' ||
    !isTopicStatus(status) ||
    typeof date !== 'string'
  ) {
    throw new Error('Invalid topic frontmatter');
  }

  return {
    content,
    frontmatter: {
      announcement_tweet: fm.announcement_tweet ?? null,
      date,
      slug,
      source,
      status,
      thumbnail_prompt: fm.thumbnail_prompt,
      title,
    },
    generated,
  };
}

function topicToMarkdown(topic: Topic): string {
  const announcementTweet = topic.announcement_tweet ?? null;
  let markdown = `---
title: "${topic.title}"
slug: "${topic.slug}"
source: "${topic.source}"
status: "${topic.status}"
date: "${topic.date}"
announcement_tweet: ${announcementTweet === null ? 'null' : `"${announcementTweet}"`}
thumbnail_prompt: ${topic.thumbnail_prompt === null ? 'null' : `"${topic.thumbnail_prompt}"`}
---

${topic.content}

## Generated Content
`;

  for (const field of CONTENT_FIELDS) {
    const value = topic.generated[field];
    if (!value) continue;
    markdown = `${markdown}\n<!-- ${field} -->\n${value}\n<!-- /${field} -->\n`;
  }

  return markdown.trimEnd();
}

function getFilesystemTopicsForDate(dateStr: string): Topic[] {
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

function listFilesystemDates(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];

  return fs
    .readdirSync(DATA_DIR, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name),
    )
    .map((entry) => entry.name)
    .sort((a, b) => b.localeCompare(a));
}

function listFilesystemLivestreamHistory(): LivestreamHistoryItem[] {
  return listFilesystemPublishedVideos().reduce<LivestreamHistoryItem[]>(
    (acc, item) => {
      if (item.type === 'livestream') {
        acc.push({
          date: item.date,
          title: item.title,
          transcriptPath: item.transcriptPath,
          videoId: item.videoId,
          youtubeUrl: item.youtubeUrl,
        });
      }
      return acc;
    },
    [],
  );
}

async function readBlobJson<T>(
  pathname: string,
): Promise<{ data: T; updatedAt: string } | null> {
  if (!isBlobPersistenceEnabled()) return null;

  try {
    const result = await get(pathname, { access: 'private', useCache: false });
    if (!result || result.statusCode !== 200) return null;

    const text = await new Response(result.stream).text();
    return {
      data: JSON.parse(text) as T,
      updatedAt: result.blob.uploadedAt.toISOString(),
    };
  } catch {
    return null;
  }
}

async function putBlobJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

async function listAllBlobs(
  prefix: string,
): Promise<Array<{ pathname: string }>> {
  if (!isBlobPersistenceEnabled()) return [];

  try {
    const blobs: Array<{ pathname: string }> = [];
    let cursor: string | undefined;

    do {
      const result = await list({ cursor, prefix });
      blobs.push(...result.blobs.map((blob) => ({ pathname: blob.pathname })));
      cursor = result.hasMore ? result.cursor : undefined;
    } while (cursor);

    return blobs;
  } catch {
    return [];
  }
}

async function listBlobDates(prefix: string): Promise<string[]> {
  if (!isBlobPersistenceEnabled()) return [];

  try {
    const folders = new Set<string>();
    let cursor: string | undefined;

    do {
      const result = await list({
        cursor,
        mode: 'folded',
        prefix: `${prefix}/`,
      });
      for (const folder of result.folders) {
        const parts = folder.split('/').filter(Boolean);
        const date = parts.at(-1);
        if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
          folders.add(date);
        }
      }
      cursor = result.hasMore ? result.cursor : undefined;
    } while (cursor);

    return Array.from(folders);
  } catch {
    return [];
  }
}

function applyTopicUpdate(topic: Topic, updates: TopicUpdate): Topic {
  const nextTopic: Topic = {
    ...topic,
    generated: { ...topic.generated },
  };

  if (updates.status) {
    nextTopic.status = updates.status;
  }

  if (updates.thumbnail_prompt !== undefined) {
    nextTopic.thumbnail_prompt = updates.thumbnail_prompt;
  }

  if (updates.generated) {
    for (const field of CONTENT_FIELDS) {
      const value = updates.generated[field];
      if (value !== undefined && value !== null) {
        nextTopic.generated[field] = value;
      }
    }
  }

  return nextTopic;
}

async function getBlobTopicOverridesForDate(
  date: string,
): Promise<Map<string, TopicUpdate>> {
  const overrides = new Map<string, TopicUpdate>();
  const blobs = await listAllBlobs(`${BLOB_TOPIC_OVERRIDES_PREFIX}/${date}/`);

  await Promise.all(
    blobs.map(async ({ pathname }) => {
      const result = await readBlobJson<StoredTopicOverride>(pathname);
      if (!result) return;

      const slug = pathname
        .split('/')
        .pop()
        ?.replace(/\.json$/, '');
      if (!slug) return;

      overrides.set(slug, result.data);
    }),
  );

  return overrides;
}

async function getBlobTopicsForDate(date: string): Promise<Topic[]> {
  const blobs = await listAllBlobs(`${BLOB_TOPICS_PREFIX}/${date}/`);
  const topics = await Promise.all(
    blobs.map(async ({ pathname }) => {
      const result = await readBlobJson<Topic>(pathname);
      return result?.data ?? null;
    }),
  );

  return topics.filter((topic): topic is Topic => topic !== null);
}

export async function listAvailableLivestreamDates(): Promise<string[]> {
  const dates = new Set<string>(listFilesystemDates());

  for (const date of await listBlobDates(BLOB_TOPICS_PREFIX)) {
    dates.add(date);
  }
  for (const date of await listBlobDates(BLOB_TOPIC_OVERRIDES_PREFIX)) {
    dates.add(date);
  }

  return Array.from(dates).sort((a, b) => b.localeCompare(a));
}

export async function resolveLivestreamDate(
  requestedDate: string,
): Promise<string> {
  const availableDates = await listAvailableLivestreamDates();
  if (availableDates.includes(requestedDate)) return requestedDate;
  return availableDates[0] || requestedDate;
}

export async function listLivestreamHistory(): Promise<
  LivestreamHistoryItem[]
> {
  return listFilesystemLivestreamHistory();
}

export async function listPublishedVideos(): Promise<PublishedVideoItem[]> {
  return listFilesystemPublishedVideos();
}

export async function getPublishedVideoBySlug(
  slug: string,
): Promise<(PublishedVideoItem & { transcript: string }) | null> {
  const item =
    listFilesystemPublishedVideos().find(
      (video) => video.routeSlug === slug || video.videoId === slug,
    ) ?? null;
  if (!item) return null;

  return {
    ...item,
    transcript: fs.readFileSync(item.transcriptPath, 'utf-8'),
  };
}

function buildArchiveTitle(
  date: string,
  topics: Topic[],
  historyItem: LivestreamHistoryItem | null,
): string {
  if (historyItem && topics.length === 0) return historyItem.title;
  if (topics.length === 1) return topics[0].title;
  return `${date} Livestream Rundown`;
}

export async function listLivestreamArchive(): Promise<
  LivestreamArchiveItem[]
> {
  const historyByDate = new Map(
    listFilesystemLivestreamHistory().map((item) => [item.date, item]),
  );
  const dates = new Set<string>([
    ...Array.from(historyByDate.keys()),
    ...(await listAvailableLivestreamDates()),
  ]);

  const items = await Promise.all(
    Array.from(dates).map(async (date) => {
      const topics = await getTopicsForDate(date);
      const historyItem = historyByDate.get(date) ?? null;
      const topicVideoUrl = topics
        .map((topic) => extractLivestreamYouTubeUrl(topic.content))
        .find((url): url is string => Boolean(url));
      const topicVideoId = topicVideoUrl ? extractVideoId(topicVideoUrl) : null;
      const youtubeUrl = historyItem?.youtubeUrl ?? topicVideoUrl ?? null;
      const videoId = historyItem?.videoId ?? topicVideoId;

      return {
        date,
        hasTranscript: Boolean(historyItem),
        title: buildArchiveTitle(date, topics, historyItem),
        topicCount: topics.length,
        topics,
        transcriptPath: historyItem?.transcriptPath ?? null,
        transcriptTitle: historyItem?.title ?? null,
        videoId,
        youtubeUrl,
      } satisfies LivestreamArchiveItem;
    }),
  );

  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getLivestreamArchiveByDate(
  date: string,
): Promise<(LivestreamArchiveItem & { transcript: string | null }) | null> {
  const item =
    (await listLivestreamArchive()).find((archive) => archive.date === date) ??
    null;
  if (!item) return null;

  return {
    ...item,
    transcript: item.transcriptPath
      ? fs.readFileSync(item.transcriptPath, 'utf-8')
      : null,
  };
}

export async function getLivestreamArchiveByVideoId(
  videoId: string,
): Promise<(LivestreamArchiveItem & { transcript: string | null }) | null> {
  const item =
    (await listLivestreamArchive()).find(
      (archive) => archive.videoId === videoId,
    ) ?? null;
  if (!item) return null;

  return {
    ...item,
    transcript: item.transcriptPath
      ? fs.readFileSync(item.transcriptPath, 'utf-8')
      : null,
  };
}

export async function getTopicsForDate(date: string): Promise<Topic[]> {
  const merged = new Map<string, Topic>();

  for (const topic of getFilesystemTopicsForDate(date)) {
    merged.set(topic.slug, topic);
  }

  for (const topic of await getBlobTopicsForDate(date)) {
    merged.set(topic.slug, topic);
  }

  const overrides = await getBlobTopicOverridesForDate(date);
  for (const [slug, updates] of overrides) {
    const topic = merged.get(slug);
    if (!topic) continue;
    merged.set(slug, applyTopicUpdate(topic, updates));
  }

  return Array.from(merged.values()).sort((a, b) =>
    a.fileName.localeCompare(b.fileName),
  );
}

export async function getTopicBySlug(
  date: string,
  slug: string,
): Promise<Topic | null> {
  const topics = await getTopicsForDate(date);
  return topics.find((topic) => topic.slug === slug) ?? null;
}

export async function readTopicRaw(
  date: string,
  slug: string,
): Promise<string | null> {
  if (!isBlobPersistenceEnabled()) {
    const filePath = findTopicFile(slug, date);
    if (!filePath) return null;
    return fs.readFileSync(filePath, 'utf-8');
  }

  const topic = await getTopicBySlug(date, slug);
  return topic ? topicToMarkdown(topic) : null;
}

export async function saveTopicUpdate(
  date: string,
  slug: string,
  updates: TopicUpdate,
): Promise<boolean> {
  if (isReadOnlyVercelRuntime()) {
    throw createWritableStorageError();
  }

  if (!isBlobPersistenceEnabled()) {
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

  const topic = await getTopicBySlug(date, slug);
  if (!topic) return false;

  const current =
    (
      await readBlobJson<StoredTopicOverride>(
        getBlobTopicOverridePath(date, slug),
      )
    )?.data ?? {};

  await putBlobJson(getBlobTopicOverridePath(date, slug), {
    ...current,
    ...updates,
    generated: {
      ...(current.generated ?? {}),
      ...(updates.generated ?? {}),
    },
  } satisfies StoredTopicOverride);

  return true;
}

export async function createTopic(input: {
  content: string;
  date: string;
  slug: string;
  source: string;
  title: string;
}): Promise<{ fileName: string; slug: string; status: TopicStatus }> {
  if (isReadOnlyVercelRuntime()) {
    throw createWritableStorageError();
  }

  const topics = await getTopicsForDate(input.date);
  const nextNum = topics.length + 1;
  const padded = String(nextNum).padStart(2, '0');
  const fileName = `topic-${padded}-${input.slug}.md`;

  if (!isBlobPersistenceEnabled()) {
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

  const topic: Topic = {
    announcement_tweet: null,
    content: input.content,
    date: input.date,
    fileName,
    generated: { ...EMPTY_GENERATED },
    slug: input.slug,
    source: input.source,
    status: 'backlog',
    thumbnail_prompt: null,
    title: input.title,
  };

  await putBlobJson(getBlobTopicPath(input.date, input.slug), topic);
  return { fileName, slug: input.slug, status: 'backlog' };
}

export async function readTopicDrawing(
  date: string,
  slug: string,
): Promise<TopicDrawingResponse> {
  if (!isBlobPersistenceEnabled()) {
    const drawingFile = getTopicDrawingFile(slug, date);
    if (!drawingFile || !fs.existsSync(drawingFile)) {
      return { scene: null, updatedAt: null };
    }

    const raw = fs.readFileSync(drawingFile, 'utf-8');
    const stat = fs.statSync(drawingFile);

    return {
      scene: JSON.parse(raw) as Record<string, unknown>,
      updatedAt: stat.mtime.toISOString(),
    };
  }

  const drawing = await readBlobJson<Record<string, unknown>>(
    getBlobDrawingPath(date, slug),
  );
  if (!drawing) {
    return { scene: null, updatedAt: null };
  }

  return {
    scene: drawing.data,
    updatedAt: drawing.updatedAt,
  };
}

export async function saveTopicDrawing(
  date: string,
  slug: string,
  content: string,
): Promise<string> {
  if (isReadOnlyVercelRuntime()) {
    throw createWritableStorageError();
  }

  if (!isBlobPersistenceEnabled()) {
    const drawingFile = getTopicDrawingFile(slug, date);
    if (!drawingFile) {
      throw new Error('Topic not found');
    }

    fs.mkdirSync(path.dirname(drawingFile), { recursive: true });
    fs.writeFileSync(drawingFile, content, 'utf-8');
    return new Date().toISOString();
  }

  await putBlobJson(getBlobDrawingPath(date, slug), JSON.parse(content));
  return new Date().toISOString();
}
