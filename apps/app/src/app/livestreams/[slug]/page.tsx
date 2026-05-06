import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { TopicDetailClient } from '@/components/livestreams/TopicDetailClient';
import { todayLocalDate } from '@/lib/date';
import {
  getLivestreamArchiveByDate,
  getLivestreamArchiveByVideoId,
  getTopicBySlug,
  listAvailableLivestreamDates,
  resolveLivestreamDate,
} from '@/lib/livestreams-store';
import {
  buildYouTubeThumbnailUrl,
  extractVideoId,
  extractYouTubeUrl,
} from '@/lib/livestreams-youtube';
import { buildDefaultMetadata, toAbsoluteUrl } from '@/lib/site';
import { clampText, stripMarkdown } from '@/lib/text';
import { LivestreamDateView } from '../page';

const UPCOMING_STREAM_SLUG = 'live-stream-upcoming';

function isDateSlug(slug: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(slug);
}

function isYouTubeVideoId(slug: string): boolean {
  return /^[\w-]{11}$/.test(slug);
}

async function resolveUpcomingLivestreamDate(): Promise<string> {
  const today = todayLocalDate();
  const dates = await listAvailableLivestreamDates();
  const upcoming = dates
    .filter((date) => date >= today)
    .sort((a, b) => a.localeCompare(b))[0];

  return upcoming ?? resolveLivestreamDate(today);
}

function appendTab(pathname: string, tab?: string): string {
  return tab ? `${pathname}?tab=${encodeURIComponent(tab)}` : pathname;
}

async function resolveStreamPathForDate(date: string): Promise<string> {
  if (date >= todayLocalDate()) {
    return `/livestreams/${UPCOMING_STREAM_SLUG}`;
  }

  const archive = await getLivestreamArchiveByDate(date);
  return archive?.videoId
    ? `/livestreams/${encodeURIComponent(archive.videoId)}`
    : `/livestreams/${encodeURIComponent(date)}`;
}

function extractSummary(content: string): string | null {
  const match = content.match(/## Summary\n([\s\S]*?)(?:\n## |\n?$)/);
  if (!match) return null;

  const summary = stripMarkdown(match[1]).trim();
  return summary.length > 0 ? summary : null;
}

async function buildTopicImageUrl(
  slug: string,
  date: string,
  content: string,
): Promise<string> {
  const youtubeUrl = extractYouTubeUrl(content);
  const videoId = youtubeUrl ? extractVideoId(youtubeUrl) : null;

  if (videoId) {
    return await buildYouTubeThumbnailUrl(videoId);
  }

  return toAbsoluteUrl(
    `/api/og/livestreams/${encodeURIComponent(slug)}?date=${encodeURIComponent(date)}`,
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (
    isDateSlug(slug) ||
    isYouTubeVideoId(slug) ||
    slug === UPCOMING_STREAM_SLUG
  ) {
    const defaults = buildDefaultMetadata();
    const pageUrl = toAbsoluteUrl(`/livestreams/${encodeURIComponent(slug)}`);

    return {
      ...defaults,
      alternates: {
        canonical: pageUrl,
      },
      description:
        'Livestream replay, talking points, and transcript for Ship Shit Show.',
      openGraph: {
        ...defaults.openGraph,
        description:
          'Livestream replay, talking points, and transcript for Ship Shit Show.',
        title: 'Ship Shit Show — Livestream',
        url: pageUrl,
      },
      title: 'Ship Shit Show — Livestream',
      twitter: {
        ...defaults.twitter,
        description:
          'Livestream replay, talking points, and transcript for Ship Shit Show.',
        title: 'Ship Shit Show — Livestream',
      },
    };
  }

  const { date } = await searchParams;
  const requestedDate = date || todayLocalDate();
  const resolvedDate = await resolveLivestreamDate(requestedDate);
  const topic = await getTopicBySlug(resolvedDate, slug);
  const defaults = buildDefaultMetadata();

  if (!topic) {
    return {
      ...defaults,
      description: 'Livestream topic and show prep for Ship Shit Show.',
      title: 'Ship Shit Show — Livestream Topic',
    };
  }

  const summary =
    extractSummary(topic.content) ||
    'Livestream topic and show prep for Ship Shit Show.';
  const description = clampText(summary, 220);
  const imageUrl = await buildTopicImageUrl(
    topic.slug,
    resolvedDate,
    topic.content,
  );
  const pageUrl = toAbsoluteUrl(
    `/livestreams/${encodeURIComponent(topic.slug)}?date=${encodeURIComponent(resolvedDate)}`,
  );
  const pageTitle = `${topic.title} — Ship Shit Show`;

  return {
    ...defaults,
    alternates: {
      canonical: pageUrl,
    },
    description,
    openGraph: {
      ...defaults.openGraph,
      description,
      images: [
        {
          alt: topic.title,
          height: 630,
          url: imageUrl,
          width: 1200,
        },
      ],
      title: pageTitle,
      type: 'article',
      url: pageUrl,
    },
    title: pageTitle,
    twitter: {
      ...defaults.twitter,
      description,
      images: [imageUrl],
      title: pageTitle,
    },
  };
}

export default async function TopicDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string; tab?: string }>;
}) {
  const { slug } = await params;
  const { date, tab } = await searchParams;

  if (isDateSlug(slug)) {
    const canonicalPath = await resolveStreamPathForDate(slug);
    if (canonicalPath !== `/livestreams/${encodeURIComponent(slug)}`) {
      redirect(appendTab(canonicalPath, tab));
    }

    return (
      <LivestreamDateView
        dateHrefMode="path"
        requestedDate={slug}
        showDateSelector={false}
        streamSlug={slug}
        tab={tab}
      />
    );
  }

  if (slug === UPCOMING_STREAM_SLUG) {
    return (
      <LivestreamDateView
        dateHrefMode="path"
        requestedDate={await resolveUpcomingLivestreamDate()}
        showDateSelector={false}
        streamSlug={UPCOMING_STREAM_SLUG}
        tab={tab}
      />
    );
  }

  if (isYouTubeVideoId(slug)) {
    const archive = await getLivestreamArchiveByVideoId(slug);

    if (archive) {
      return (
        <LivestreamDateView
          dateHrefMode="path"
          requestedDate={archive.date}
          showDateSelector={false}
          streamSlug={slug}
          tab={tab}
        />
      );
    }

    redirect('/livestreams');
  }

  const requestedDate = date || todayLocalDate();
  const resolvedDate = await resolveLivestreamDate(requestedDate);
  const topic = await getTopicBySlug(resolvedDate, slug);
  if (topic) {
    redirect(
      `${appendTab(await resolveStreamPathForDate(resolvedDate), 'talking-points')}#${encodeURIComponent(topic.slug)}`,
    );
  }

  return <TopicDetailClient />;
}
