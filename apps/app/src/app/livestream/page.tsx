import type { Topic } from '@shipshitshow/types';
import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { todayLocalDate } from '@/lib/date';
import {
  getTopicsForDate,
  listLivestreamHistory,
  listAvailableLivestreamDates,
  type LivestreamHistoryItem,
  resolveLivestreamDate,
} from '@/lib/livestream-store';
import {
  buildYouTubeThumbnailUrl,
  extractVideoId,
  extractYouTubeUrl,
} from '@/lib/livestream-youtube';

const DATE_FORMATTER = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});

const STATUS_META = {
  archived: {
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    copy: 'Finished show-prep topics stay here after they are wrapped.',
    empty: 'No archived topics yet.',
    label: 'Archived',
    title: 'Archived Topics',
  },
  selected: {
    badgeClass: 'bg-green-500/10 text-green-400 border-green-500/20',
    copy: 'Only selected topics stay here. Backlog remains in the desktop Kanban.',
    empty: 'No topic is selected for the current livestream yet.',
    label: 'Selected',
    title: 'Selected Livestream',
  },
} as const;

interface LivestreamCard {
  thumbnailUrl: string;
  topic: Topic;
}

interface LivestreamHistoryCard {
  item: LivestreamHistoryItem;
  thumbnailUrl: string;
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

async function getTopicThumbnailUrl(topic: Topic): Promise<string> {
  const youtubeUrl = extractYouTubeUrl(topic.content);
  const videoId = youtubeUrl ? extractVideoId(youtubeUrl) : null;

  if (videoId) {
    return buildYouTubeThumbnailUrl(videoId);
  }

  return `/api/og/livestream/${encodeURIComponent(topic.slug)}?date=${encodeURIComponent(topic.date)}`;
}

async function buildCards(topics: Topic[]): Promise<LivestreamCard[]> {
  return Promise.all(
    topics.map(async (topic) => ({
      thumbnailUrl: await getTopicThumbnailUrl(topic),
      topic,
    })),
  );
}

async function buildHistoryCards(
  history: LivestreamHistoryItem[],
): Promise<LivestreamHistoryCard[]> {
  return Promise.all(
    history.map(async (item) => ({
      item,
      thumbnailUrl: item.videoId
        ? await buildYouTubeThumbnailUrl(item.videoId)
        : '/icon.svg',
    })),
  );
}

function LivestreamCardGrid({
  cards,
  kind,
}: {
  cards: LivestreamCard[];
  kind: keyof typeof STATUS_META;
}) {
  const meta = STATUS_META[kind];

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card/40 p-8 text-center">
        <p className="text-sm font-medium text-text-primary">{meta.empty}</p>
        <p className="mt-2 text-xs text-text-muted">{meta.copy}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {cards.map(({ thumbnailUrl, topic }) => (
        <Link
          key={`${topic.date}-${topic.slug}`}
          href={`/livestream/${topic.slug}?date=${topic.date}`}
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
              <span>Open topic</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function LivestreamHistoryGrid({
  cards,
}: {
  cards: LivestreamHistoryCard[];
}) {
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card/40 p-8 text-center">
        <p className="text-sm font-medium text-text-primary">
          No previous livestreams imported yet.
        </p>
        <p className="mt-2 text-xs text-text-muted">
          The transcript archive will show up here once it is available in the
          app data.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ item, thumbnailUrl }) => {
        const card = (
          <>
            <div className="aspect-[16/8.5] overflow-hidden bg-surface-elevated">
              <img
                src={thumbnailUrl}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
            <div className="space-y-2.5 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
                    {formatLivestreamDate(item.date)}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-xs font-semibold text-text-primary transition-colors group-hover:text-accent-red sm:text-sm">
                    {item.title}
                  </h3>
                </div>
                <span className="shrink-0 rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-300">
                  Replay
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[10px] text-text-muted sm:text-[11px]">
                <span className="truncate">Transcript archive</span>
                <span>{item.youtubeUrl ? 'Open replay' : 'Transcript only'}</span>
              </div>
            </div>
          </>
        );

        const className =
          'group overflow-hidden rounded-2xl border border-surface-border bg-surface-card transition-colors hover:border-accent-red/40';

        if (!item.youtubeUrl) {
          return (
            <div key={`${item.date}-${item.title}`} className={className}>
              {card}
            </div>
          );
        }

        return (
          <a
            key={`${item.date}-${item.title}`}
            href={item.youtubeUrl}
            target="_blank"
            rel="noreferrer"
            className={className}
          >
            {card}
          </a>
        );
      })}
    </div>
  );
}

export default async function LivestreamPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const requestedDate = date || todayLocalDate();
  const resolvedDate = await resolveLivestreamDate(requestedDate);
  const availableDates = await listAvailableLivestreamDates();
  const livestreamHistory = await listLivestreamHistory();
  const topicsByDate = await Promise.all(
    availableDates.map(async (currentDate) => ({
      date: currentDate,
      topics: await getTopicsForDate(currentDate),
    })),
  );

  const selectedTopics = sortTopics(
    (
      topicsByDate.find((entry) => entry.date === resolvedDate)?.topics ?? []
    ).filter((topic) => topic.status === 'in_progress'),
  );
  const archivedTopics = sortTopics(
    topicsByDate.flatMap((entry) =>
      entry.topics.filter((topic) => topic.status === 'done'),
    ),
  );

  const [selectedCards, archivedCards, historyCards] = await Promise.all([
    buildCards(selectedTopics),
    buildCards(archivedTopics),
    buildHistoryCards(livestreamHistory),
  ]);

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <AppHeader
        subtitle="Show Rundown"
        activeHref="/livestream"
        links={[
          { href: '/analytics', label: 'Analytics' },
          { href: '/livestream', label: 'Livestream' },
        ]}
      />
      <main className="mx-auto max-w-6xl space-y-10 px-6 py-8">
        <section className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-text-muted">
                Current date
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-text-primary">
                {formatLivestreamDate(resolvedDate)}
              </h2>
              <p className="mt-2 text-sm text-text-muted">
                Only selected livestream topics are shown here.
              </p>
            </div>
            <span className="text-xs text-text-muted">
              {selectedCards.length} selected topic
              {selectedCards.length === 1 ? '' : 's'}
            </span>
          </div>

          <LivestreamCardGrid cards={selectedCards} kind="selected" />
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-text-muted">
                Archive
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-text-primary">
                Previous Livestreams
              </h2>
              <p className="mt-2 text-sm text-text-muted">
                Full livestream history from the transcript archive lives here.
              </p>
            </div>
            <span className="text-xs text-text-muted">
              {historyCards.length} livestream
              {historyCards.length === 1 ? '' : 's'}
            </span>
          </div>

          <LivestreamHistoryGrid cards={historyCards} />
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-text-muted">
                Archive
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-text-primary">
                {STATUS_META.archived.title}
              </h2>
              <p className="mt-2 text-sm text-text-muted">
                Finished livestream topics drop out of the active list and stay
                here.
              </p>
            </div>
            <span className="text-xs text-text-muted">
              {archivedCards.length} archived topic
              {archivedCards.length === 1 ? '' : 's'}
            </span>
          </div>

          <LivestreamCardGrid cards={archivedCards} kind="archived" />
        </section>
      </main>
    </div>
  );
}
