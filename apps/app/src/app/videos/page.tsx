import type { Metadata } from 'next';
import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { formatNumber } from '@/lib/format';
import {
  listPublishedVideos,
  type PublishedVideoItem,
} from '@/lib/livestreams-store';
import { buildYouTubeThumbnailUrl } from '@/lib/livestreams-youtube';
import { buildDefaultMetadata, toAbsoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  ...buildDefaultMetadata(),
  alternates: {
    canonical: toAbsoluteUrl('/videos'),
  },
  description:
    'Published Ship Shit Show videos and livestream replays with transcripts.',
  title: 'Ship Shit Show - Videos',
};

const DATE_FORMATTER = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});

interface VideoCard extends PublishedVideoItem {
  thumbnailUrl: string;
}

function formatVideoDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return DATE_FORMATTER.format(new Date(Date.UTC(year, month - 1, day)));
}

function formatVideoType(type: PublishedVideoItem['type']): string {
  return type === 'livestream' ? 'Livestream' : 'Video';
}

async function buildVideoCards(): Promise<VideoCard[]> {
  const videos = await listPublishedVideos();

  return Promise.all(
    videos.map(async (video) => ({
      ...video,
      thumbnailUrl: video.videoId
        ? await buildYouTubeThumbnailUrl(video.videoId)
        : '/icon.svg',
    })),
  );
}

export default async function VideosPage() {
  const videos = await buildVideoCards();
  const livestreamCount = videos.filter(
    (video) => video.type === 'livestream',
  ).length;
  const regularVideoCount = videos.length - livestreamCount;

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <AppHeader subtitle="Videos" activeHref="/videos" />

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <section className="flex flex-col gap-4 border-b border-surface-border pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-text-muted">
              Archive
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-text-primary">
              Published Videos
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
              Every imported Ship Shit Show video transcript, including full
              videos and livestream replays.
            </p>
          </div>
          <div className="flex gap-2 text-xs text-text-muted">
            <span className="rounded-full border border-surface-border px-3 py-1">
              {formatNumber(regularVideoCount)} videos
            </span>
            <span className="rounded-full border border-surface-border px-3 py-1">
              {formatNumber(livestreamCount)} livestreams
            </span>
          </div>
        </section>

        {videos.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => (
              <article
                key={video.routeSlug}
                className="group overflow-hidden rounded-2xl border border-surface-border bg-surface-card transition-colors hover:border-accent-red/40"
              >
                <Link href={`/videos/${encodeURIComponent(video.routeSlug)}`}>
                  <div className="aspect-[16/9] overflow-hidden bg-surface-elevated">
                    <img
                      src={video.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                </Link>
                <div className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
                        {formatVideoDate(video.date)}
                      </p>
                      <Link
                        href={`/videos/${encodeURIComponent(video.routeSlug)}`}
                        className="mt-1 block line-clamp-2 text-sm font-semibold text-text-primary transition-colors group-hover:text-accent-red"
                      >
                        {video.title}
                      </Link>
                    </div>
                    <span className="shrink-0 rounded-full border border-accent-red/20 bg-accent-red/10 px-2.5 py-1 text-[10px] font-medium text-accent-red">
                      {formatVideoType(video.type)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[11px] text-text-muted">
                    <span>{formatNumber(video.wordCount)} words</span>
                    <Link
                      href={`/videos/${encodeURIComponent(video.routeSlug)}`}
                      className="font-medium text-text-secondary transition-colors hover:text-accent-red"
                    >
                      Transcript
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card/40 p-8 text-center">
            <p className="text-sm font-medium text-text-primary">
              No imported video transcripts yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
