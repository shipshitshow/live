import { ArrowDown, ArrowUpRight, Play, Radio } from 'lucide-react';
import type { Metadata } from 'next';
import { getPublicEpisodes, type PublicEpisode } from '@/lib/public-episodes';
import { showXAccounts } from '@/lib/show-accounts';
import styles from './home.module.scss';

export const metadata: Metadata = {
  description:
    'Vincent and Mitchell make sense of AI models, tools and workflows. Watch edited videos, full livestreams and grab the resources to build your own show.',
  title: 'Ship Sh!t Show — AI models. Real workflows.',
};
export const revalidate = 3600;

function formatPublished(iso: string): string {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(iso));
}

function EpisodeCard({ episode }: { episode: PublicEpisode }) {
  return (
    <a className={styles.episode} href={episode.url}>
      <div className={styles.episodeImage}>
        <img
          alt=""
          height={360}
          loading="lazy"
          src={episode.thumbnailUrl}
          width={640}
        />
        <span aria-hidden="true" className={styles.play}>
          <Play fill="currentColor" size={18} />
        </span>
      </div>
      <div className={styles.episodeMeta}>
        <span>
          {episode.format === 'livestream' ? 'Full livestream' : 'Edited video'}
        </span>
        <time dateTime={episode.publishedAt}>
          {formatPublished(episode.publishedAt)}
        </time>
      </div>
      <h3>{episode.title}</h3>
      <span className={styles.watch}>
        Watch on YouTube <ArrowUpRight aria-hidden="true" size={15} />
      </span>
    </a>
  );
}

const resources = [
  {
    description: 'Prep the show. Package the videos. Make the next one better.',
    href: 'https://github.com/shipshitshow/skills',
    name: 'Production skills',
    number: '01',
  },
  {
    description:
      'Transcripts, episode notes and the sources behind the conversation.',
    href: 'https://github.com/shipshitshow/vault',
    name: 'The episode vault',
    number: '02',
  },
  {
    description:
      'Find the demos and experiments by the livestream they came from.',
    href: 'https://github.com/shipshitshow/examples',
    name: 'Show examples',
    number: '03',
  },
  {
    description: 'Colors, creative direction and the identity behind the show.',
    href: 'https://github.com/shipshitshow/vault/tree/master/brand',
    name: 'Brand kit',
    number: '04',
  },
];

export default async function HomePage() {
  const { livestreams, videos } = await getPublicEpisodes();
  const featured = videos[0] ?? livestreams[0];
  return (
    <main className={styles.home} id="top">
      <a className={styles.skipLink} href="#videos">
        Skip to videos
      </a>
      <header className={styles.header}>
        <a
          aria-label="Ship Sh!t Show home"
          className={styles.wordmark}
          href="#top"
        >
          SHIP SH<span>!</span>T SHOW
          <span className={styles.wordmarkDot}>.</span>
        </a>
        <nav aria-label="Main navigation" className={styles.nav}>
          <a href="#videos">Videos</a>
          <a href="#livestreams">Livestreams</a>
          <a href="#resources">Resources</a>
        </nav>
      </header>
      <section aria-labelledby="show-title" className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            Vincent + Mitchell / The AI show for builders
          </p>
          <h1 id="show-title">
            LESS HYPE.
            <br />
            <span>MORE SH!T</span>
            <br />
            SHIPPED.
          </h1>
          <p className={styles.heroDescription}>
            AI models. Real workflows. Strong opinions. Two builders making
            sense of the tools they actually use.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryLink} href="#videos">
              Find your next watch <ArrowDown aria-hidden="true" size={18} />
            </a>
            <a
              className={styles.textLink}
              href="https://www.youtube.com/@shipshitshow"
            >
              Subscribe on YouTube <ArrowUpRight aria-hidden="true" size={17} />
            </a>
          </div>
        </div>
        {featured ? (
          <div className={styles.featured}>
            <div className={styles.featuredLabel}>
              <span>Start here</span>
              <span>
                {featured.format === 'video'
                  ? 'Latest edited video'
                  : 'Latest livestream'}
              </span>
            </div>
            <a className={styles.featuredLink} href={featured.url}>
              <div className={styles.featuredImage}>
                <img
                  alt=""
                  height={720}
                  loading="eager"
                  src={featured.thumbnailUrl}
                  width={1280}
                />
                <span aria-hidden="true" className={styles.featuredPlay}>
                  <Play fill="currentColor" size={26} />
                </span>
              </div>
              <div className={styles.featuredCaption}>
                <time dateTime={featured.publishedAt}>
                  {formatPublished(featured.publishedAt)}
                </time>
                <h2>{featured.title}</h2>
                <span>
                  Watch on YouTube <ArrowUpRight aria-hidden="true" size={18} />
                </span>
              </div>
            </a>
          </div>
        ) : (
          <div className={styles.featuredEmpty}>
            <Radio aria-hidden="true" size={42} />
            <p>The conversation continues on YouTube.</p>
            <a
              className={styles.textLink}
              href="https://www.youtube.com/@shipshitshow"
            >
              Visit the channel <ArrowUpRight aria-hidden="true" size={18} />
            </a>
          </div>
        )}
      </section>
      <div aria-hidden="true" className={styles.strip}>
        <span>Models change.</span>
        <span>Workflows matter.</span>
        <span>Ship something.</span>
      </div>
      <section
        aria-labelledby="videos-title"
        className={styles.videos}
        id="videos"
      >
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>01 / Get to the point</p>
            <h2 id="videos-title">
              Edited videos<span>.</span>
            </h2>
          </div>
          <div className={styles.sectionIntro}>
            <p>
              The useful bits, cut from the conversation. Comparisons, workflows
              and what we learned.
            </p>
            <a
              className={styles.textLink}
              href="https://www.youtube.com/@shipshitshow/videos"
            >
              All videos <ArrowUpRight aria-hidden="true" size={17} />
            </a>
          </div>
        </div>
        {videos.length ? (
          <ul className={styles.episodeGrid}>
            {videos.slice(0, 6).map((episode) => (
              <li key={episode.id}>
                <EpisodeCard episode={episode} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>
            Browse edited videos on{' '}
            <a href="https://www.youtube.com/@shipshitshow/videos">YouTube</a>.
          </p>
        )}
      </section>
      <section
        aria-labelledby="livestreams-title"
        className={styles.livestreams}
        id="livestreams"
      >
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>
              02 / Stay for the whole conversation
            </p>
            <h2 id="livestreams-title">
              Full livestreams<span>.</span>
            </h2>
          </div>
          <div className={styles.sectionIntro}>
            <p>
              The full discussions: model choices, real usage, different takes
              and the occasional tangent.
            </p>
            <a
              className={styles.textLink}
              href="https://www.youtube.com/@shipshitshow/streams"
            >
              All livestreams <ArrowUpRight aria-hidden="true" size={17} />
            </a>
          </div>
        </div>
        {livestreams.length ? (
          <ul className={styles.episodeGrid}>
            {livestreams.slice(0, 6).map((episode) => (
              <li key={episode.id}>
                <EpisodeCard episode={episode} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>
            Browse full livestreams on{' '}
            <a href="https://www.youtube.com/@shipshitshow/streams">YouTube</a>.
          </p>
        )}
        <a
          className={styles.clipsLink}
          href="https://www.youtube.com/@ShipShitShowClips/shorts"
        >
          <span>Only got a minute?</span> Watch the Shorts{' '}
          <ArrowUpRight aria-hidden="true" size={20} />
        </a>
      </section>
      <section
        aria-labelledby="resources-title"
        className={styles.resources}
        id="resources"
      >
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>03 / Open the toolbox</p>
            <h2 id="resources-title">
              Steal the workflow<span>.</span>
            </h2>
          </div>
          <p className={styles.sectionIntro}>
            Make your own show, dig into the sources, or pick up an experiment.
          </p>
        </div>
        <ul className={styles.resourceGrid}>
          {resources.map((resource) => (
            <li key={resource.href}>
              <a className={styles.resource} href={resource.href}>
                <div className={styles.resourceTop}>
                  <span>{resource.number}</span>
                  <ArrowUpRight aria-hidden="true" size={22} />
                </div>
                <h3>{resource.name}</h3>
                <p>{resource.description}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>
      <footer className={styles.footer}>
        <p>
          SHIP SH!T SHOW<span>.</span>
          <small>Built, questioned, shipped. Repeat.</small>
        </p>
        <div>
          {showXAccounts.map((account) => (
            <a href={account.href} key={account.handle}>
              {account.name} on X <ArrowUpRight aria-hidden="true" size={14} />
            </a>
          ))}
        </div>
      </footer>
    </main>
  );
}
