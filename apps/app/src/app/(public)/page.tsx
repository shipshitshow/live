import { Button } from '@shipshitshow/ui';
import type { Metadata } from 'next';
import { showXAccounts, showYoutubeChannels } from '@/lib/show-accounts';
import { getLatestVideos, type PublicVideo } from '@/lib/youtube-feed';

export const metadata: Metadata = {
  description:
    'Live coding, hot takes, and shipping in public. Every week on YouTube.',
  title: 'Ship Shit Show',
};

export const revalidate = 3600;

function formatPublished(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function VideoLink({ video }: { video: PublicVideo }) {
  return (
    <a className="group block" href={video.url}>
      <img
        alt=""
        className="aspect-video w-full bg-surface-elevated object-cover"
        src={video.thumbnailUrl}
      />
      <span className="mt-3 block text-lg font-medium text-text-primary group-hover:text-accent-red">
        {video.title}
      </span>
      <span className="mt-1 block text-sm text-text-muted">
        {formatPublished(video.publishedAt)}
      </span>
    </a>
  );
}

export default async function HomePage() {
  const videos = await getLatestVideos();
  const latest = videos[0];
  const recent = videos.slice(1, 6);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-16 px-6 py-8">
      <header className="flex items-center justify-between gap-4 border-b border-surface-border pb-5">
        <p className="text-sm tracking-[0.18em] text-text-secondary uppercase">
          Ship Shit Show
        </p>
        <Button asChild>
          <a href="/login">Log in</a>
        </Button>
      </header>

      <section className="flex flex-col gap-6">
        <div className="flex max-w-2xl flex-col gap-3">
          <h1 className="text-5xl font-semibold tracking-tight text-text-primary">
            Ship it on camera.
          </h1>
          <p className="text-lg text-text-secondary">
            Live coding, hot takes, and shipping in public. Every week.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {showYoutubeChannels.map((channel) => (
            <Button
              asChild
              key={channel.href}
              size="lg"
              variant={channel.label === 'Main' ? 'accent' : 'default'}
            >
              <a href={channel.href} rel="noopener noreferrer" target="_blank">
                {channel.label === 'Main' ? 'Watch on YouTube' : 'Clips'}
              </a>
            </Button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-sm tracking-[0.18em] text-accent-red uppercase">
          Latest video
        </h2>
        {latest ? (
          <VideoLink video={latest} />
        ) : (
          <p className="text-text-secondary">
            The latest upload is on{' '}
            <a
              className="text-text-primary underline"
              href="https://www.youtube.com/@shipshitshow"
            >
              YouTube
            </a>
            . The feed did not load.
          </p>
        )}
      </section>

      {recent.length > 0 ? (
        <section className="flex flex-col gap-5">
          <h2 className="text-sm tracking-[0.18em] text-text-secondary uppercase">
            Recent
          </h2>
          <ul className="grid gap-8 sm:grid-cols-2">
            {recent.map((video) => (
              <li key={video.id}>
                <VideoLink video={video} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-4 border-t border-surface-border pt-8">
        <h2 className="text-sm tracking-[0.18em] text-text-secondary uppercase">
          On X
        </h2>
        <ul className="flex flex-col gap-3">
          {showXAccounts.map((account) => (
            <li key={account.handle}>
              <a
                className="flex items-baseline justify-between gap-4 border border-surface-border bg-surface-card px-4 py-3 hover:border-accent-red"
                href={account.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="text-text-primary">
                  {account.name}
                  <span className="ml-3 text-text-muted">
                    @{account.handle}
                  </span>
                </span>
                <span className="text-xs tracking-wide text-text-secondary uppercase">
                  {account.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
