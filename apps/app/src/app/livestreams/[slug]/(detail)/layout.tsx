import { redirect } from 'next/navigation';
import { LivestreamTabsClient } from '@/components/livestreams/LivestreamTabsClient';
import { StreamInfoSidebar } from '@/components/livestreams/StreamInfoSidebar';
import {
  isDateSlug,
  isYouTubeVideoId,
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
  buildCards,
  getEffectiveStatus,
  getLivestreamTitle,
  getVisibleTopics,
  getYoutubeUrl,
  isPastDate,
  sortTopics,
} from '@/lib/livestreams-ui';
import { fetchVideoStats } from '@/lib/livestreams-youtube';
import { analyzeTranscriptScorecard } from '@/lib/transcript-scorecard';

async function resolveSlug(slug: string): Promise<{
  requestedDate: string;
  streamSlug: string;
}> {
  if (isDateSlug(slug)) {
    return { requestedDate: slug, streamSlug: slug };
  }

  if (slug === UPCOMING_STREAM_SLUG) {
    const date = await resolveUpcomingLivestreamDate();
    return { requestedDate: date, streamSlug: UPCOMING_STREAM_SLUG };
  }

  if (isYouTubeVideoId(slug)) {
    const archive = await getLivestreamArchiveByVideoId(slug);
    if (!archive) redirect('/livestreams');
    return { requestedDate: archive.date, streamSlug: slug };
  }

  redirect('/livestreams');
}

export default async function LivestreamDetailLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = await params;
  const { requestedDate, streamSlug } = await resolveSlug(slug);

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
  const thumbnailUrl = cards[0]?.thumbnailUrl ?? null;
  const transcriptScorecard = analyzeTranscriptScorecard(archive?.transcript);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 p-6 lg:flex-row lg:items-start">
      <main className="min-w-0 flex-1 space-y-6">
        <section className="overflow-hidden rounded-xl border border-surface-border bg-surface/30">
          <LivestreamTabsClient date={resolvedDate} streamSlug={streamSlug} />
          <div className="p-5">{children}</div>
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
  );
}
