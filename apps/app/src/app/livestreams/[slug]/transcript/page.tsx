import { redirect } from 'next/navigation';
import {
  UPCOMING_STREAM_SLUG,
  isDateSlug,
  isYouTubeVideoId,
  resolveStreamPathForDate,
  resolveUpcomingLivestreamDate,
} from '@/lib/livestreams-routing';
import { getLivestreamArchiveByVideoId } from '@/lib/livestreams-store';
import { LivestreamDateView } from '../../page';

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

    return (
      <LivestreamDateView
        dateHrefMode="path"
        requestedDate={slug}
        showDateSelector={false}
        streamSlug={slug}
        tab="transcript"
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
        tab="transcript"
      />
    );
  }

  if (isYouTubeVideoId(slug)) {
    const archive = await getLivestreamArchiveByVideoId(slug);
    if (!archive) redirect('/livestreams');

    return (
      <LivestreamDateView
        dateHrefMode="path"
        requestedDate={archive.date}
        showDateSelector={false}
        streamSlug={slug}
        tab="transcript"
      />
    );
  }

  redirect('/livestreams');
}
