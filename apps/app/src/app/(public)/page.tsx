import { ArrowUpRight, Play } from 'lucide-react';
import type { Metadata } from 'next';
import { Anton, Space_Grotesk } from 'next/font/google';
import { getPublicEpisodes, type PublicEpisode } from '@/lib/public-episodes';
import { showXAccounts } from '@/lib/show-accounts';
import styles from './home.module.scss';
import { LibraryTabs } from './LibraryTabs';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-home',
  weight: ['400', '500', '700'],
});
const anton = Anton({
  subsets: ['latin'],
  variable: '--font-display',
  weight: '400',
});

export const metadata: Metadata = {
  description:
    'Vincent and Mitchell, two founders, talk about AI and how they actually use it to run their businesses. Weekly on YouTube, video and live.',
  title: 'Ship Sh!t Show — Two founders on how they actually use AI',
};
export const revalidate = 3600;

const LIBRARY_SIZE = 6;

function formatPublished(iso: string): string {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(iso));
}

function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
    .format(new Date(iso))
    .toUpperCase();
}

function EpisodeList({
  emptyHref,
  emptyLabel,
  episodes,
}: {
  emptyHref: string;
  emptyLabel: string;
  episodes: PublicEpisode[];
}) {
  if (!episodes.length) {
    return (
      <p className={styles.empty}>
        Browse {emptyLabel} on <a href={emptyHref}>YouTube</a>.
      </p>
    );
  }
  return (
    <ol className={styles.rows}>
      {episodes.slice(0, LIBRARY_SIZE).map((episode) => (
        <li key={episode.id}>
          <a className={styles.row} href={episode.url}>
            <span aria-hidden="true" className={styles.shortDate}>
              {formatShortDate(episode.publishedAt)}
            </span>
            <span className={styles.rowText}>
              <span className={styles.rowTitle}>{episode.title}</span>
              <time dateTime={episode.publishedAt}>
                {formatPublished(episode.publishedAt)}
              </time>
            </span>
            <span aria-hidden="true" className={styles.rowPlay}>
              <Play fill="currentColor" size={16} />
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}

const resources = [
  {
    description: 'How we prep and package the show',
    href: 'https://github.com/shipshitshow/skills',
    name: 'Skills',
  },
  {
    description: 'Transcripts and sources',
    href: 'https://github.com/shipshitshow/vault',
    name: 'Show notes',
  },
  {
    description: 'What we built on the show',
    href: 'https://github.com/shipshitshow/examples',
    name: 'Examples',
  },
  {
    description: 'Colors, type, creative',
    href: 'https://github.com/shipshitshow/vault/tree/master/brand',
    name: 'Brand kit',
  },
];

export default async function HomePage() {
  const { livestreams, videos } = await getPublicEpisodes();
  return (
    <main
      className={`${styles.home} ${spaceGrotesk.variable} ${anton.variable}`}
    >
      <a className={styles.skipLink} href="#library">
        Skip to episodes
      </a>
      <div className={styles.page}>
        <section aria-labelledby="show-title" className={styles.hero}>
          <div
            aria-label="Ship Sh!t Show cover art: Vincent × Mitchell"
            className={styles.cover}
            role="img"
          >
            <span className={styles.coverTitle}>
              Ship
              <br />
              sh!t
              <br />
              <span>show</span>
            </span>
            <span className={styles.coverHosts}>Vincent × Mitchell</span>
          </div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span aria-hidden="true">● </span>A weekly show · video + live
            </p>
            <h1 id="show-title">
              How two founders actually use AI to run their businesses.
            </h1>
            <a
              className={styles.subscribe}
              href="https://www.youtube.com/@shipshitshow?sub_confirmation=1"
            >
              <Play aria-hidden="true" fill="currentColor" size={16} />
              Subscribe on YouTube
            </a>
          </div>
        </section>

        <section
          aria-labelledby="library-title"
          className={styles.library}
          id="library"
        >
          <h2 className={styles.visuallyHidden} id="library-title">
            Watch the show
          </h2>
          <LibraryTabs
            tabs={[
              {
                allHref: 'https://www.youtube.com/@shipshitshow/streams',
                allLabel: 'All episodes on YouTube',
                content: (
                  <EpisodeList
                    emptyHref="https://www.youtube.com/@shipshitshow/streams"
                    emptyLabel="full episodes"
                    episodes={livestreams}
                  />
                ),
                id: 'episodes',
                label: 'Episodes',
              },
              {
                allHref: 'https://www.youtube.com/@shipshitshow/videos',
                allLabel: 'All videos on YouTube',
                content: (
                  <EpisodeList
                    emptyHref="https://www.youtube.com/@shipshitshow/videos"
                    emptyLabel="videos"
                    episodes={videos}
                  />
                ),
                id: 'videos',
                label: 'Videos',
              },
            ]}
          />
        </section>

        <section aria-labelledby="setup-title" className={styles.setup}>
          <h2 id="setup-title">Steal our setup</h2>
          <ul className={styles.setupGrid}>
            {resources.map((resource) => (
              <li key={resource.href}>
                <a className={styles.setupCard} href={resource.href}>
                  <h3>{resource.name}</h3>
                  <p>{resource.description}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <footer className={styles.footer}>
          <a href="https://www.youtube.com/@ShipShitShowClips/shorts">
            Shorts <ArrowUpRight aria-hidden="true" size={14} />
          </a>
          {showXAccounts.map((account) => (
            <a href={account.href} key={account.handle}>
              @{account.handle}
            </a>
          ))}
        </footer>
      </div>
    </main>
  );
}
