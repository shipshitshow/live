import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { TranscriptScorecard } from '@/components/TranscriptScorecard';
import { formatNumber } from '@/lib/format';
import { getPublishedVideoBySlug } from '@/lib/livestreams-store';
import { buildYouTubeThumbnailUrl } from '@/lib/livestreams-youtube';
import { buildDefaultMetadata, toAbsoluteUrl } from '@/lib/site';
import { clampText, stripMarkdown } from '@/lib/text';
import { analyzeTranscriptScorecard } from '@/lib/transcript-scorecard';

const DATE_FORMATTER = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});

function formatVideoDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return DATE_FORMATTER.format(new Date(Date.UTC(year, month - 1, day)));
}

function formatVideoType(type: 'livestream' | 'video'): string {
  return type === 'livestream' ? 'Livestream' : 'Video';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const video = await getPublishedVideoBySlug(slug);
  const defaults = buildDefaultMetadata();

  if (!video) {
    return {
      ...defaults,
      description: 'Published Ship Shit Show video transcript.',
      title: 'Ship Shit Show - Video Transcript',
    };
  }

  const pageUrl = toAbsoluteUrl(
    `/videos/${encodeURIComponent(video.routeSlug)}`,
  );
  const description = clampText(stripMarkdown(video.transcript), 180);

  return {
    ...defaults,
    alternates: {
      canonical: pageUrl,
    },
    description,
    openGraph: {
      ...defaults.openGraph,
      description,
      title: `${video.title} - Ship Shit Show`,
      type: 'article',
      url: pageUrl,
    },
    title: `${video.title} - Ship Shit Show`,
    twitter: {
      ...defaults.twitter,
      description,
      title: `${video.title} - Ship Shit Show`,
    },
  };
}

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const video = await getPublishedVideoBySlug(slug);

  if (!video) notFound();

  const thumbnailUrl = video.videoId
    ? await buildYouTubeThumbnailUrl(video.videoId)
    : '/icon.svg';
  const transcriptScorecard = analyzeTranscriptScorecard(video.transcript);

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <AppHeader subtitle="Video Transcript" activeHref="/videos" />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/videos"
          className="text-xs font-medium text-text-muted transition-colors hover:text-accent-red"
        >
          Back to videos
        </Link>

        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0 space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-text-muted">
                {formatVideoType(video.type)}
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-text-primary">
                {video.title}
              </h1>
              <p className="mt-2 text-sm text-text-muted">
                {formatVideoDate(video.date)} · {formatNumber(video.wordCount)}{' '}
                transcript words
              </p>
            </div>

            <section className="overflow-hidden rounded-xl border border-surface-border bg-surface/30">
              <div className="border-b border-surface-border px-5 py-4">
                <h2 className="text-sm font-semibold text-text-primary">
                  Transcript
                </h2>
              </div>
              <pre className="max-h-[760px] overflow-auto whitespace-pre-wrap p-5 text-sm leading-relaxed text-text-secondary">
                {video.transcript}
              </pre>
            </section>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
              <div className="aspect-video overflow-hidden bg-surface-elevated">
                <img
                  src={thumbnailUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-accent-red/20 bg-accent-red/10 px-2.5 py-1 text-[10px] font-medium text-accent-red">
                    {formatVideoType(video.type)}
                  </span>
                  <span className="text-xs text-text-muted">
                    {formatVideoDate(video.date)}
                  </span>
                </div>
                {video.youtubeUrl ? (
                  <a
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:border-accent-red/30 hover:text-accent-red"
                  >
                    Open on YouTube
                  </a>
                ) : null}
              </div>
            </div>
            <TranscriptScorecard scorecard={transcriptScorecard} />
          </aside>
        </div>
      </main>
    </div>
  );
}
