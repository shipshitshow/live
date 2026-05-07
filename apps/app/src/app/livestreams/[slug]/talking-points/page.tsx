import { redirect } from 'next/navigation';
import {
  isDateSlug,
  isYouTubeVideoId,
  resolveStreamPathForDate,
  resolveUpcomingLivestreamDate,
  UPCOMING_STREAM_SLUG,
} from '@/lib/livestreams-routing';
import { getLivestreamArchiveByVideoId } from '@/lib/livestreams-store';
import { LivestreamDateView } from '../../page';

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

    return (
      <LivestreamDateView
        dateHrefMode="path"
        requestedDate={slug}
        showDateSelector={false}
        streamSlug={slug}
        tab="talking-points"
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
        tab="talking-points"
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
        tab="talking-points"
      />
    );
  }

  redirect('/livestreams');
}
