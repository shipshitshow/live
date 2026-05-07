import fs from 'node:fs';
import type { Topic } from '@shipshitshow/types';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Tweet } from 'react-tweet';
import { TranscriptScorecard } from '@/components/TranscriptScorecard';
import { todayLocalDate } from '@/lib/date';
import { formatNumber } from '@/lib/format';
import {
  getLivestreamArchiveByDate,
  getTopicsForDate,
  listAvailableLivestreamDates,
  listLivestreamArchive,
  resolveLivestreamDate,
} from '@/lib/livestreams-store';
import {
  buildYouTubeThumbnailUrl,
  extractVideoId,
  extractYouTubeUrl,
  fetchVideoStats,
} from '@/lib/livestreams-youtube';
import {
  analyzeTranscriptScorecard,
  type TranscriptScorecard as TranscriptScorecardData,
} from '@/lib/transcript-scorecard';

interface MarkdownLink {
  text: string;
  url: string;
}

function extractMarkdownLinks(text: string): MarkdownLink[] {
  return Array.from(text.matchAll(/\[(.*?)\]\((.*?)\)/g)).map((match) => ({
    text: match[1],
    url: match[2],
  }));
}

function extractLivestreamNotes(content: string): MarkdownLink[] {
  const match = content.match(/## Livestream Notes\n([\s\S]*?)(?:\n## |\n?$)/);
  if (!match) return [];
  return extractMarkdownLinks(match[1]);
}

function isRestreamUrl(url: string): boolean {
  return /studio\.restream\.io/i.test(url);
}

function extractTweetIds(body: string): string[] {
  const matches = body.matchAll(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/g);
  return Array.from(new Set(Array.from(matches, (m) => m[1])));
}

function extractYouTubeVideoIds(body: string): string[] {
  const matches = body.matchAll(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/g,
  );
  return Array.from(new Set(Array.from(matches, (m) => m[1])));
}

function stripEmbedUrls(body: string): string {
  return body
    .replace(/https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status\/\d+/g, '')
    .replace(
      /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}[^\s)"]*/g,
      '',
    );
}

const DATE_FORMATTER = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});

const STATUS_META = {
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

const TAB_META = {
  'talking-points': 'Talking Points',
  transcript: 'Transcript',
} as const;

type LivestreamTab = keyof typeof TAB_META;

interface LivestreamCard {
  effectiveStatus: keyof typeof STATUS_META;
  thumbnailUrl: string;
  topic: Topic;
}

interface MarkdownSection {
  body: string;
  title: string;
}

interface StreamListItem {
  date: string;
  hasTranscript: boolean;
  routeSlug: string;
  thumbnailUrl: string;
  title: string;
  topicCount: number;
  transcriptGrade: string | null;
  transcriptScore: number | null;
  transcriptWords: number | null;
  transcriptMinutes: number | null;
}

function formatLivestreamDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return DATE_FORMATTER.format(new Date(Date.UTC(year, month - 1, day)));
}

function sortTopics(topics: Topic[]): Topic[] {
  return [...topics].sort(
    (a, b) =>
      b.date.localeCompare(a.date) || a.fileName.localeCompare(b.fileName),
  );
}

function isPastDate(date: string): boolean {
  return date < todayLocalDate();
}

function resolveTab(tab: string | undefined): LivestreamTab {
  if (tab === 'transcript') return 'transcript';
  return 'talking-points';
}

function parseSections(content: string): MarkdownSection[] {
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

function isUsefulSection(title: string): boolean {
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

function MarkdownBody({ body, large }: { body: string; large?: boolean }) {
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

async function buildCards(
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

function LivestreamCardGrid({
  cards,
  streamSlug,
}: {
  cards: LivestreamCard[];
  streamSlug?: string;
}) {
  const emptyMeta = STATUS_META.selected;

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card/40 p-8 text-center">
        <p className="text-sm font-medium text-text-primary">
          {emptyMeta.empty}
        </p>
        <p className="mt-2 text-xs text-text-muted">{emptyMeta.copy}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {cards.map(({ effectiveStatus, thumbnailUrl, topic }) => {
        const meta = STATUS_META[effectiveStatus];
        const href = streamSlug
          ? `/livestreams/${encodeURIComponent(streamSlug)}/talking-points#${encodeURIComponent(topic.slug)}`
          : `#${encodeURIComponent(topic.slug)}`;

        return (
          <Link
            key={`${topic.date}-${topic.slug}`}
            href={href}
            className="group overflow-hidden rounded-2xl border border-surface-border bg-surface-card transition-colors hover:border-accent-red/40"
          >
            <div className="aspect-[16/9] overflow-hidden bg-surface-elevated">
              <img
                src={thumbnailUrl}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
                    {formatLivestreamDate(topic.date)}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-text-primary transition-colors group-hover:text-accent-red">
                    {topic.title}
                  </h3>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium ${meta.badgeClass}`}
                >
                  {meta.label}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[11px] text-text-muted">
                <span className="truncate">{topic.source}</span>
                <span>Talking point</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function LivestreamTabs({
  activeTab,
  dateHrefMode,
  date,
  streamSlug,
}: {
  activeTab: LivestreamTab;
  dateHrefMode: 'path' | 'query';
  date: string;
  streamSlug?: string;
}) {
  const pathSlug = encodeURIComponent(streamSlug ?? date);
  const hrefForTab = (tab: string) =>
    dateHrefMode === 'path'
      ? `/livestreams/${pathSlug}/${tab}`
      : `/livestreams?date=${encodeURIComponent(date)}&tab=${tab}`;

  return (
    <div className="flex flex-wrap gap-2 border-b border-surface-border">
      {Object.entries(TAB_META).map(([tab, label]) => {
        const isActive = tab === activeTab;

        return (
          <Link
            key={tab}
            href={hrefForTab(tab)}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              isActive
                ? 'border-accent-red text-text-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

function TalkingPointsPanel({ cards }: { cards: LivestreamCard[] }) {
  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-surface-border bg-surface-card/40 p-6 text-sm text-text-muted">
        No talking points have been selected for this livestream yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cards.map(({ topic }) => {
        const sections = parseSections(topic.content).filter((section) =>
          isUsefulSection(section.title),
        );

        return (
          <article
            key={`${topic.date}-${topic.slug}`}
            id={topic.slug}
            className="rounded-xl border border-surface-border bg-surface-card p-5"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
                {topic.source}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-text-primary">
                {topic.title}
              </h3>
            </div>

            <div className="mt-5 space-y-5">
              {sections.map((section) => (
                <section
                  key={`${topic.slug}-${section.title}`}
                  className="space-y-2"
                >
                  <h4 className="text-xs font-medium uppercase tracking-widest text-text-secondary">
                    {section.title}
                  </h4>
                  <MarkdownBody body={section.body} />
                </section>
              ))}
              {sections.length === 0 ? (
                <p className="text-sm text-text-muted">
                  No summary or talking point sections found in this topic.
                </p>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function StreamRundownPanel({ cards }: { cards: LivestreamCard[] }) {
  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-surface-border bg-surface-card/40 p-6 text-base text-text-muted">
        No talking points have been selected for this livestream yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {cards.map(({ topic }) => {
        const sections = parseSections(topic.content).filter((section) =>
          isUsefulSection(section.title),
        );

        return sections.map((section) => {
          const tweetIds = extractTweetIds(section.body);
          const videoIds = extractYouTubeVideoIds(section.body);
          const hasEmbeds = tweetIds.length > 0 || videoIds.length > 0;
          const cleanedBody = hasEmbeds
            ? stripEmbedUrls(section.body)
            : section.body;

          return (
            <article
              key={`${topic.slug}-${section.title}`}
              className="rounded-xl border border-surface-border bg-surface-card p-6"
            >
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-text-muted">
                {section.title}
              </h3>
              <MarkdownBody body={cleanedBody} large />
            </article>
          );
        });
      })}
    </div>
  );
}

function TranscriptPanel({
  title,
  transcript,
}: {
  title: string;
  transcript: string | null;
}) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-text-muted">
          Transcript
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-text-primary">
          {title}
        </h2>
      </div>

      {transcript ? (
        <pre className="max-h-[720px] overflow-auto whitespace-pre-wrap rounded-xl border border-surface-border bg-surface-card p-5 text-sm leading-relaxed text-text-secondary">
          {transcript}
        </pre>
      ) : (
        <div className="rounded-xl border border-dashed border-surface-border bg-surface-card/40 p-6 text-sm text-text-muted">
          No clean transcript has been imported for this livestream yet.
        </div>
      )}
    </section>
  );
}

function StreamInfoSidebar({
  commentCount,
  effectiveStatus,
  resolvedDate,
  scorecard,
  thumbnailUrl,
  title,
  viewCount,
  youtubeUrl,
}: {
  commentCount: number | null;
  effectiveStatus: keyof typeof STATUS_META;
  resolvedDate: string;
  scorecard: TranscriptScorecardData | null;
  thumbnailUrl: string | null;
  title: string;
  viewCount: number | null;
  youtubeUrl: string | null;
}) {
  const statusMeta = STATUS_META[effectiveStatus];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        {thumbnailUrl ? (
          <div className="aspect-video overflow-hidden bg-surface-elevated">
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <div className="space-y-3 p-4">
          <h1 className="text-base font-semibold leading-snug text-text-primary">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusMeta.badgeClass}`}
            >
              {statusMeta.label}
            </span>
            <span className="text-xs text-text-muted">
              {formatLivestreamDate(resolvedDate)}
            </span>
          </div>

          {viewCount !== null || commentCount !== null ? (
            <div className="flex items-center gap-4 text-xs text-text-muted">
              {viewCount !== null ? (
                <span>{formatNumber(viewCount)} views</span>
              ) : null}
              {commentCount !== null ? (
                <span>{formatNumber(commentCount)} comments</span>
              ) : null}
            </div>
          ) : null}

          {youtubeUrl ? (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-accent-red px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-accent-red/85"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              {isPastDate(resolvedDate) ? 'Watch replay' : 'Watch stream'}
            </a>
          ) : null}
        </div>
      </div>

      <TranscriptScorecard scorecard={scorecard} />
    </div>
  );
}

function getVisibleTopics(topics: Topic[], date: string): Topic[] {
  if (isPastDate(date)) {
    return topics.filter((topic) => topic.status !== 'backlog');
  }

  return topics.filter((topic) => topic.status === 'in_progress');
}

function getEffectiveStatus(date: string): keyof typeof STATUS_META {
  return isPastDate(date) ? 'done' : 'selected';
}

function getLivestreamTitle(
  date: string,
  topics: Topic[],
  archiveTitle?: string,
): string {
  if (archiveTitle && topics.length === 0) return archiveTitle;
  if (topics.length === 1) return topics[0].title;
  return `${formatLivestreamDate(date)} Livestream`;
}

function getLivestreamSubtitle(date: string, topicCount: number): string {
  const state = isPastDate(date) ? 'Done' : 'Scheduled';
  return `${state} · ${topicCount} talking point${topicCount === 1 ? '' : 's'}`;
}

function getYoutubeUrl(
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

async function resolveLivestreamPageDate(
  requestedDate: string,
  availableDates: string[],
): Promise<string> {
  if (availableDates.includes(requestedDate)) return requestedDate;
  return resolveLivestreamDate(requestedDate);
}

function ActionLinkButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:border-accent-red/30 hover:text-accent-red"
    >
      {children}
    </a>
  );
}

export async function LivestreamDateView({
  dateHrefMode = 'query',
  requestedDate,
  showDateSelector = true,
  streamSlug,
  tab,
}: {
  dateHrefMode?: 'path' | 'query';
  requestedDate: string;
  showDateSelector?: boolean;
  streamSlug?: string;
  tab?: string;
}) {
  const activeTab = resolveTab(tab);
  const [topicDates, livestreams] = await Promise.all([
    listAvailableLivestreamDates(),
    listLivestreamArchive(),
  ]);
  const availableDates = Array.from(
    new Set([...topicDates, ...livestreams.map((item) => item.date)]),
  ).sort((a, b) => b.localeCompare(a));
  const resolvedDate = await resolveLivestreamPageDate(
    requestedDate,
    availableDates,
  );
  const topics = await getTopicsForDate(resolvedDate);
  const visibleTopics = sortTopics(getVisibleTopics(topics, resolvedDate));
  const archive = await getLivestreamArchiveByDate(resolvedDate);
  const effectiveStatus = getEffectiveStatus(resolvedDate);
  const videoId = archive?.videoId ?? null;
  const [cards, videoStats] = await Promise.all([
    buildCards(visibleTopics, effectiveStatus),
    videoId && isPastDate(resolvedDate)
      ? fetchVideoStats(videoId)
      : Promise.resolve(null),
  ]);
  const title = getLivestreamTitle(resolvedDate, visibleTopics, archive?.title);
  const youtubeUrl = getYoutubeUrl(visibleTopics, archive?.youtubeUrl);
  const transcriptScorecard = analyzeTranscriptScorecard(archive?.transcript);
  const isUpcoming = !isPastDate(resolvedDate);
  const isSingleTopic = isUpcoming && visibleTopics.length === 1;
  const singleTopic = isSingleTopic ? visibleTopics[0] : null;

  const livestreamNoteLinks = singleTopic
    ? extractLivestreamNotes(singleTopic.content)
    : [];
  const restreamLink = livestreamNoteLinks.find((link) =>
    isRestreamUrl(link.url),
  );
  const thumbnailUrl = singleTopic
    ? await getTopicThumbnailUrl(singleTopic)
    : (cards[0]?.thumbnailUrl ?? null);

  const defaultContentArea = (
    <>
      <LivestreamCardGrid cards={cards} streamSlug={streamSlug} />

      <section className="overflow-hidden rounded-xl border border-surface-border bg-surface/30">
        <LivestreamTabs
          activeTab={activeTab}
          date={resolvedDate}
          dateHrefMode={dateHrefMode}
          streamSlug={streamSlug}
        />
        <div className="p-5">
          {activeTab === 'transcript' ? (
            <TranscriptPanel
              title={archive?.transcriptTitle ?? title}
              transcript={archive?.transcript ?? null}
            />
          ) : (
            <TalkingPointsPanel cards={cards} />
          )}
        </div>
      </section>
    </>
  );

  const sidebarEmbeds = (() => {
    if (!singleTopic)
      return { tweetIds: [] as string[], videoIds: [] as string[] };
    const sections = parseSections(singleTopic.content).filter((s) =>
      isUsefulSection(s.title),
    );
    const allTweetIds: string[] = [];
    const allVideoIds: string[] = [];
    const seenTweets = new Set<string>();
    const seenVideos = new Set<string>();
    for (const section of sections) {
      for (const id of extractTweetIds(section.body)) {
        if (!seenTweets.has(id)) {
          seenTweets.add(id);
          allTweetIds.push(id);
        }
      }
      for (const id of extractYouTubeVideoIds(section.body)) {
        if (!seenVideos.has(id)) {
          seenVideos.add(id);
          allVideoIds.push(id);
        }
      }
    }
    return { tweetIds: allTweetIds, videoIds: allVideoIds };
  })();

  const singleTopicSidebar = (
    <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[420px]">
      <div className="space-y-4">
        {thumbnailUrl ? (
          <div className="overflow-hidden rounded-xl border border-surface-border">
            <img
              src={thumbnailUrl}
              alt={title}
              className="aspect-video w-full object-cover"
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          {youtubeUrl ? (
            <ActionLinkButton href={youtubeUrl}>Open stream</ActionLinkButton>
          ) : null}
          {restreamLink ? (
            <ActionLinkButton href={restreamLink.url}>
              Open Restream Studio
            </ActionLinkButton>
          ) : null}
        </div>

        {sidebarEmbeds.videoIds.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
            <div className="border-b border-surface-border px-4 py-3">
              <h3 className="text-xs font-medium uppercase tracking-widest text-text-secondary">
                YouTube — React to These
              </h3>
            </div>
            <div className="space-y-3 p-3">
              {sidebarEmbeds.videoIds.map((id) => (
                <div
                  key={id}
                  className="overflow-hidden rounded-lg border border-surface-border"
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${id}`}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="aspect-video w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {sidebarEmbeds.tweetIds.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
            <div className="border-b border-surface-border px-4 py-3">
              <h3 className="text-xs font-medium uppercase tracking-widest text-text-secondary">
                Tweets — Pull Up Live
              </h3>
            </div>
            <div
              className="max-h-[60vh] space-y-3 overflow-y-auto p-3"
              data-theme="dark"
            >
              {sidebarEmbeds.tweetIds.map((id) => (
                <Suspense
                  key={id}
                  fallback={
                    <div className="h-[150px] animate-pulse rounded-xl bg-surface-elevated" />
                  }
                >
                  <Tweet id={id} />
                </Suspense>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {!isSingleTopic && showDateSelector ? (
        <div className="border-b border-surface-border bg-surface-card px-6 py-6">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-semibold text-text-primary lg:text-3xl">
              {title}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {getLivestreamSubtitle(resolvedDate, visibleTopics.length)}
              {archive?.hasTranscript ? ' · Transcript ready' : ''}
            </p>
            {youtubeUrl ? (
              <div className="mt-4">
                <ActionLinkButton href={youtubeUrl}>
                  {isPastDate(resolvedDate) ? 'Open replay' : 'Open stream'}
                </ActionLinkButton>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {isSingleTopic ? (
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-6 lg:flex-row lg:items-start">
          <main className="min-w-0 flex-1 space-y-6">
            <StreamRundownPanel cards={cards} />
          </main>
          {singleTopicSidebar}
        </div>
      ) : showDateSelector ? (
        <div className="mx-auto flex max-w-6xl">
          <aside className="hidden w-[200px] shrink-0 border-r border-surface-border py-6 pl-6 pr-4 md:block">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted">
              Dates
            </p>
            <nav className="flex flex-col gap-0.5">
              {availableDates.map((d) => {
                const active = d === resolvedDate;
                const href =
                  dateHrefMode === 'path'
                    ? `/livestreams/${encodeURIComponent(d)}/${activeTab}`
                    : `/livestreams?date=${encodeURIComponent(d)}&tab=${activeTab}`;

                return (
                  <Link
                    key={d}
                    href={href}
                    className={`rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-accent-red/10 text-accent-red'
                        : 'text-text-secondary hover:bg-surface-card hover:text-text-primary'
                    }`}
                  >
                    {formatLivestreamDate(d)}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <main className="min-w-0 flex-1 space-y-8 px-6 py-8">
            {defaultContentArea}
          </main>
        </div>
      ) : (
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-6 lg:flex-row lg:items-start">
          <main className="min-w-0 flex-1 space-y-6">
            <section className="overflow-hidden rounded-xl border border-surface-border bg-surface/30">
              <LivestreamTabs
                activeTab={activeTab}
                date={resolvedDate}
                dateHrefMode={dateHrefMode}
                streamSlug={streamSlug}
              />
              <div className="p-5">
                {activeTab === 'transcript' ? (
                  <TranscriptPanel
                    title={archive?.transcriptTitle ?? title}
                    transcript={archive?.transcript ?? null}
                  />
                ) : (
                  <StreamRundownPanel cards={cards} />
                )}
              </div>
            </section>
          </main>
          <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[380px]">
            <StreamInfoSidebar
              commentCount={videoStats?.commentCount ?? null}
              effectiveStatus={effectiveStatus}
              resolvedDate={resolvedDate}
              scorecard={transcriptScorecard}
              thumbnailUrl={thumbnailUrl}
              title={title}
              viewCount={videoStats?.viewCount ?? null}
              youtubeUrl={youtubeUrl}
            />
          </aside>
        </div>
      )}
    </>
  );
}

async function buildUpcomingStream(): Promise<StreamListItem | null> {
  const today = todayLocalDate();
  const [topicDates, archiveItems] = await Promise.all([
    listAvailableLivestreamDates(),
    listLivestreamArchive(),
  ]);
  const archiveByDate = new Map(archiveItems.map((item) => [item.date, item]));
  const upcomingDates = Array.from(
    new Set([...topicDates, ...archiveItems.map((item) => item.date)]),
  )
    .filter((date) => date >= today)
    .sort((a, b) => a.localeCompare(b));

  if (upcomingDates.length === 0) return null;

  const date = upcomingDates[0];
  const archive = archiveByDate.get(date);
  const topics = await getTopicsForDate(date);
  const activeTopics = topics.filter((t) => t.status === 'in_progress');
  const title =
    archive?.title ??
    (activeTopics.length === 1
      ? activeTopics[0].title
      : `${formatLivestreamDate(date)} Livestream`);
  const thumbnailUrl = archive?.videoId
    ? await buildYouTubeThumbnailUrl(archive.videoId)
    : '/icon.svg';

  return {
    date,
    hasTranscript: false,
    routeSlug: archive?.videoId ?? date,
    thumbnailUrl,
    title,
    topicCount: activeTopics.length || archive?.topicCount || 0,
    transcriptGrade: null,
    transcriptMinutes: null,
    transcriptScore: null,
    transcriptWords: null,
  };
}

async function buildDoneStreams(): Promise<StreamListItem[]> {
  const [topicDates, archiveItems] = await Promise.all([
    listAvailableLivestreamDates(),
    listLivestreamArchive(),
  ]);
  const archiveByDate = new Map(archiveItems.map((item) => [item.date, item]));
  const dates = Array.from(
    new Set([...topicDates, ...archiveItems.map((item) => item.date)]),
  )
    .filter((date) => isPastDate(date))
    .sort((a, b) => b.localeCompare(a));

  return Promise.all(
    dates.map(async (date) => {
      const archive = archiveByDate.get(date);
      const topics = await getTopicsForDate(date);
      const publicTopics = topics.filter((topic) => topic.status !== 'backlog');
      const title =
        archive?.title ??
        (publicTopics.length === 1
          ? publicTopics[0].title
          : `${formatLivestreamDate(date)} Livestream`);
      const thumbnailUrl = archive?.videoId
        ? await buildYouTubeThumbnailUrl(archive.videoId)
        : '/icon.svg';

      const transcript = archive?.transcriptPath
        ? fs.readFileSync(archive.transcriptPath, 'utf-8')
        : null;
      const scorecard = analyzeTranscriptScorecard(transcript);

      return {
        date,
        hasTranscript: Boolean(archive?.hasTranscript),
        routeSlug: archive?.videoId ?? date,
        thumbnailUrl,
        title,
        topicCount: publicTopics.length || archive?.topicCount || 0,
        transcriptGrade: scorecard?.grade ?? null,
        transcriptMinutes: scorecard?.stats.estimatedMinutes ?? null,
        transcriptScore: scorecard?.overall ?? null,
        transcriptWords: scorecard?.stats.wordCount ?? null,
      };
    }),
  );
}

export default async function LivestreamPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; tab?: string }>;
}) {
  const { date, tab } = await searchParams;
  if (date) {
    const tabSegment = tab === 'transcript' ? 'transcript' : 'talking-points';
    redirect(`/livestreams/${encodeURIComponent(date)}/${tabSegment}`);
  }

  const [upcoming, streams] = await Promise.all([
    buildUpcomingStream(),
    buildDoneStreams(),
  ]);

  return (
      <main className="mx-auto max-w-7xl space-y-10 px-6 py-8">
        {upcoming ? (
          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-text-muted">
                  Upcoming
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-text-primary">
                  {upcoming.title}
                </h1>
                <p className="mt-1 text-sm text-text-muted">
                  {formatLivestreamDate(upcoming.date)} · {upcoming.topicCount}{' '}
                  talking point
                  {upcoming.topicCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <Link
              href={`/livestreams/${encodeURIComponent(upcoming.routeSlug)}/talking-points`}
              className="group block overflow-hidden rounded-2xl border border-accent-red/30 bg-surface-card transition-colors hover:border-accent-red/60"
            >
              <div className="aspect-[21/9] overflow-hidden bg-surface-elevated">
                <img
                  src={upcoming.thumbnailUrl}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                />
              </div>
            </Link>
          </section>
        ) : null}

        <section className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-text-muted">
                Past
              </p>
              <h2 className="mt-2 text-xl font-semibold text-text-primary">
                Previous Livestreams
              </h2>
            </div>
            <span className="text-xs text-text-muted">
              {streams.length} stream{streams.length === 1 ? '' : 's'}
            </span>
          </div>

          {streams.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {streams.map((stream) => (
                <Link
                  key={stream.date}
                  href={`/livestreams/${encodeURIComponent(stream.routeSlug)}/talking-points`}
                  className="group overflow-hidden rounded-2xl border border-surface-border bg-surface-card transition-colors hover:border-accent-red/40"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-surface-elevated">
                    <img
                      src={stream.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
                          {formatLivestreamDate(stream.date)}
                        </p>
                        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-text-primary transition-colors group-hover:text-accent-red">
                          {stream.title}
                        </h3>
                      </div>
                      {stream.transcriptScore !== null ? (
                        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                          stream.transcriptScore >= 8
                            ? 'border-green-500/20 bg-green-500/10 text-green-400'
                            : stream.transcriptScore >= 6
                              ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400'
                              : 'border-red-500/20 bg-red-500/10 text-red-400'
                        }`}>
                          {stream.transcriptScore}/10
                        </span>
                      ) : null}
                    </div>
                    {stream.hasTranscript ? (
                      <div className="flex items-center gap-3 text-[10px] text-text-muted">
                        {stream.transcriptGrade ? (
                          <span>Grade {stream.transcriptGrade}</span>
                        ) : null}
                        {stream.transcriptWords ? (
                          <span>{formatNumber(stream.transcriptWords)} words</span>
                        ) : null}
                        {stream.transcriptMinutes ? (
                          <span>~{stream.transcriptMinutes} min</span>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-[10px] text-text-muted/50">No transcript</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card/40 p-8 text-center">
              <p className="text-sm font-medium text-text-primary">
                No completed livestreams yet.
              </p>
            </div>
          )}
        </section>
      </main>
  );
}
