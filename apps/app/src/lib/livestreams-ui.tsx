import type { Topic } from '@shipshitshow/types';
import { todayLocalDate } from '@/lib/date';
import {
  buildYouTubeThumbnailUrl,
  extractVideoId,
  extractYouTubeUrl,
} from '@/lib/livestreams-youtube';

interface MarkdownSection {
  body: string;
  title: string;
}

export const STATUS_META = {
  done: {
    badgeClass: 'bg-green-500/10 text-green-400 border-green-500/20',
    copy: 'Past livestream dates are treated as done.',
    empty: 'No finished topics for this livestream yet.',
    label: 'Done',
  },
  selected: {
    badgeClass: 'bg-accent-red/10 text-accent-red border-accent-red/20',
    copy: 'Only selected topics stay here. Backlog remains in the desktop Kanban.',
    empty: 'No topic is selected for the current livestream yet.',
    label: 'Selected',
  },
} as const;

export interface LivestreamCard {
  effectiveStatus: keyof typeof STATUS_META;
  thumbnailUrl: string;
  topic: Topic;
}

const DATE_FORMATTER = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});

export function formatLivestreamDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return DATE_FORMATTER.format(new Date(Date.UTC(year, month - 1, day)));
}

export function isPastDate(date: string): boolean {
  return date < todayLocalDate();
}

export function sortTopics(topics: Topic[]): Topic[] {
  return [...topics].sort(
    (a, b) =>
      b.date.localeCompare(a.date) || a.fileName.localeCompare(b.fileName),
  );
}

export function getVisibleTopics(topics: Topic[], date: string): Topic[] {
  if (isPastDate(date)) {
    return topics.filter((topic) => topic.status !== 'backlog');
  }
  return topics.filter((topic) => topic.status === 'in_progress');
}

export function getEffectiveStatus(
  date: string,
): keyof typeof STATUS_META {
  return isPastDate(date) ? 'done' : 'selected';
}

export function getLivestreamTitle(
  date: string,
  topics: Topic[],
  archiveTitle?: string,
): string {
  if (archiveTitle && topics.length === 0) return archiveTitle;
  if (topics.length === 1) return topics[0].title;
  return `${formatLivestreamDate(date)} Livestream`;
}

export function getYoutubeUrl(
  topics: Topic[],
  archiveUrl?: string | null,
): string | null {
  if (archiveUrl) return archiveUrl;
  return (
    topics
      .map((topic) => extractYouTubeUrl(topic.content))
      .find((url): url is string => Boolean(url)) ?? null
  );
}

export function parseSections(content: string): MarkdownSection[] {
  const sections: MarkdownSection[] = [];
  const matches = Array.from(content.matchAll(/^## (.+)$/gm));

  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const next = matches[i + 1];
    const title = match[1].trim();
    const body = content
      .slice((match.index ?? 0) + match[0].length, next?.index)
      .trim();

    if (body.length > 0) sections.push({ body, title });
  }

  return sections;
}

export function isUsefulSection(title: string): boolean {
  const normalized = title.toLowerCase();
  return (
    normalized === 'summary' ||
    normalized === 'hot take' ||
    normalized.startsWith('cold open') ||
    normalized.startsWith('talking points') ||
    normalized.startsWith('close') ||
    normalized.startsWith('tweets')
  );
}

export function extractTweetIds(body: string): string[] {
  const matches = body.matchAll(
    /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/g,
  );
  return Array.from(new Set(Array.from(matches, (m) => m[1])));
}

export function extractYouTubeVideoIds(body: string): string[] {
  const matches = body.matchAll(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/g,
  );
  return Array.from(new Set(Array.from(matches, (m) => m[1])));
}

export function stripEmbedUrls(body: string): string {
  return body
    .replace(/https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status\/\d+/g, '')
    .replace(
      /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}[^\s)"]*/g,
      '',
    );
}

function renderAutoLinkedText(text: string, keyPrefix: string) {
  const urlPattern = /(https?:\/\/[^\s),]+)/g;
  const segments = text.split(urlPattern);
  return segments.map((seg, i) => {
    if (/^https?:\/\//.test(seg)) {
      const display = seg
        .replace(/^https?:\/\/(?:www\.)?/, '')
        .replace(/\/$/, '');
      return (
        <a
          key={`${keyPrefix}-url-${i}`}
          href={seg}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-red hover:underline break-all"
        >
          {display}
        </a>
      );
    }
    return seg;
  });
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-red hover:underline"
        >
          {linkMatch[1]}
        </a>
      );
    }

    const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) return <strong key={index}>{boldMatch[1]}</strong>;

    const codeMatch = part.match(/^`(.*?)`$/);
    if (codeMatch) {
      return (
        <code key={index} className="rounded bg-surface-elevated px-1 py-0.5">
          {codeMatch[1]}
        </code>
      );
    }

    return <span key={index}>{renderAutoLinkedText(part, String(index))}</span>;
  });
}

export function MarkdownBody({
  body,
  large,
}: {
  body: string;
  large?: boolean;
}) {
  const lines = body.split('\n').filter((line) => line.trim().length > 0);
  const textSize = large ? 'text-lg' : 'text-sm';
  const leading = large ? 'leading-[1.8]' : 'leading-relaxed';

  return (
    <div className={large ? 'space-y-4' : 'space-y-2.5'}>
      {lines.map((line, index) => {
        const trimmed = line.trim();
        const bullet = trimmed.match(/^-+\s+(.+)$/);
        const quote = trimmed.match(/^>\s?(.+)$/);

        if (bullet) {
          return (
            <p
              key={`${index}-${trimmed}`}
              className={`pl-5 ${textSize} ${leading} text-text-secondary before:-ml-5 before:mr-2 before:text-accent-red before:content-['-']`}
            >
              {renderInlineMarkdown(bullet[1])}
            </p>
          );
        }

        if (quote) {
          return (
            <blockquote
              key={`${index}-${trimmed}`}
              className={`border-l-2 border-accent-red/50 pl-4 ${textSize} ${leading} text-text-primary`}
            >
              {renderInlineMarkdown(quote[1])}
            </blockquote>
          );
        }

        return (
          <p
            key={`${index}-${trimmed}`}
            className={`${textSize} ${leading} text-text-secondary`}
          >
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

async function getTopicThumbnailUrl(topic: Topic): Promise<string> {
  const youtubeUrl = extractYouTubeUrl(topic.content);
  const videoId = youtubeUrl ? extractVideoId(youtubeUrl) : null;

  if (videoId) {
    return buildYouTubeThumbnailUrl(videoId);
  }

  return `/api/og/livestreams/${encodeURIComponent(topic.slug)}?date=${encodeURIComponent(topic.date)}`;
}

export async function buildCards(
  topics: Topic[],
  effectiveStatus: keyof typeof STATUS_META,
): Promise<LivestreamCard[]> {
  return Promise.all(
    topics.map(async (topic) => ({
      effectiveStatus,
      thumbnailUrl: await getTopicThumbnailUrl(topic),
      topic,
    })),
  );
}
