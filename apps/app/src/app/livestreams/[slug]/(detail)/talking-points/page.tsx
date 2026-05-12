import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { StreamRundownPanel } from '@/components/livestreams/StreamRundownPanel';

export const metadata: Metadata = {
  description:
    'Livestream talking points and topic rundown for Ship Shit Show.',
  title: 'Talking Points - Ship Shit Show',
};

import {
  isDateSlug,
  isYouTubeVideoId,
  resolveStreamPathForDate,
  resolveUpcomingLivestreamDate,
  UPCOMING_STREAM_SLUG,
} from '@/lib/livestreams-routing';
import {
  getLivestreamArchiveByVideoId,
  getTopicsForDate,
  listAvailableLivestreamDates,
  listLivestreamArchive,
  resolveLivestreamDate,
} from '@/lib/livestreams-store';
import {
  buildCards,
  getEffectiveStatus,
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

export default async function TalkingPointsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (isDateSlug(slug)) {
    const canonicalPath = await resolveStreamPathForDate(slug);
    if (canonicalPath !== `/livestreams/${encodeURIComponent(slug)}`) {
      redirect(`${canonicalPath}/talking-points`);
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
  const effectiveStatus = getEffectiveStatus(resolvedDate);
  const cards = await buildCards(visibleTopics, effectiveStatus);

  return <StreamRundownPanel cards={cards} />;
}
