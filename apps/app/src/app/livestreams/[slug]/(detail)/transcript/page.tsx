import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { TranscriptPanel } from '@/components/livestreams/TranscriptPanel';

export const metadata: Metadata = {
  description: 'Livestream transcript for Ship Shit Show.',
  title: 'Transcript - Ship Shit Show',
};

import {
  isDateSlug,
  isYouTubeVideoId,
  resolveStreamPathForDate,
  resolveUpcomingLivestreamDate,
  UPCOMING_STREAM_SLUG,
} from '@/lib/livestreams-routing';
import {
  getLivestreamArchiveByDate,
  getLivestreamArchiveByVideoId,
  getTopicsForDate,
  listAvailableLivestreamDates,
  listLivestreamArchive,
  resolveLivestreamDate,
} from '@/lib/livestreams-store';
import {
  getLivestreamTitle,
  getVisibleTopics,
  sortTopics,
} from '@/lib/livestreams-ui';

async function resolveDate(slug: string): Promise<string> {
  if (isDateSlug(slug)) return slug;

  if (slug === UPCOMING_STREAM_SLUG) {
    return resolveUpcomingLivestreamDate();
  }

  if (isYouTubeVideoId(slug)) {
    const archive = await getLivestreamArchiveByVideoId(slug);
    if (!archive) redirect('/livestreams');
    return archive.date;
  }

  redirect('/livestreams');
}

export default async function TranscriptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (isDateSlug(slug)) {
    const canonicalPath = await resolveStreamPathForDate(slug);
    if (canonicalPath !== `/livestreams/${encodeURIComponent(slug)}`) {
      redirect(`${canonicalPath}/transcript`);
    }
  }

  const requestedDate = await resolveDate(slug);
  const [topicDates, livestreams] = await Promise.all([
    listAvailableLivestreamDates(),
    listLivestreamArchive(),
  ]);
  const availableDates = Array.from(
    new Set([...topicDates, ...livestreams.map((item) => item.date)]),
  ).sort((a, b) => b.localeCompare(a));
  const resolvedDate = availableDates.includes(requestedDate)
    ? requestedDate
    : await resolveLivestreamDate(requestedDate);

  const topics = await getTopicsForDate(resolvedDate);
  const visibleTopics = sortTopics(getVisibleTopics(topics, resolvedDate));
  const archive = await getLivestreamArchiveByDate(resolvedDate);
  const title = getLivestreamTitle(resolvedDate, visibleTopics, archive?.title);

  return (
    <TranscriptPanel
      title={archive?.transcriptTitle ?? title}
      transcript={archive?.transcript ?? null}
    />
  );
}
