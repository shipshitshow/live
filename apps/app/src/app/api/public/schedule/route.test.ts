import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import type { Topic, TopicStatus, TopicUpdate } from '@shipshitshow/types';
import {
  type FakeRedisHarness,
  installFakeRedis,
} from '@/lib/__tests__/fake-redis';
import { redisKey } from '@/lib/redis-storage';
import { GET } from './route';

// Far past/future dates keep the fixtures apart from real data/livestream dates.
const PAST = '2001-01-02';
const PAST_DRAFT_ONLY = '2001-01-01';
const UPCOMING = '2999-01-02';
const UPCOMING_UNPUBLISHED = '2999-01-01';
const STATUSES: TopicStatus[] = ['draft', 'backlog', 'in_progress', 'done'];

function topic(date: string, status: TopicStatus, index: number): Topic {
  const slug = `${date}-${status}`;
  return {
    announcement_tweet: null,
    content: `Private producer notes for ${slug}`,
    date,
    fileName: `topic-0${index + 1}-${slug}.md`,
    generated: {
      linkedin_post: null,
      livestream_tweet: null,
      recap_tweet: null,
      thumbnail_v1: null,
      thumbnail_v2: null,
      thumbnail_v3: null,
      youtube_description: null,
      youtube_title: null,
    },
    slug,
    source: 'https://example.com/source',
    status,
    thumbnail_prompt: null,
    title: `Title ${slug}`,
  };
}

const topicsByDate: Record<string, Topic[]> = {
  [PAST]: STATUSES.map((status, i) => topic(PAST, status, i)),
  [PAST_DRAFT_ONLY]: (['draft', 'backlog'] as const).map((status, i) =>
    topic(PAST_DRAFT_ONLY, status, i),
  ),
  [UPCOMING]: [
    ...STATUSES.map((status, i) => topic(UPCOMING, status, i)),
    { ...topic(UPCOMING, 'in_progress', 4), slug: 'demoted', title: 'Demoted' },
  ],
  [UPCOMING_UNPUBLISHED]: (['draft', 'backlog', 'done'] as const).map(
    (status, i) => topic(UPCOMING_UNPUBLISHED, status, i),
  ),
};
// A producer moved an in-progress topic back to draft through a Redis override.
const overrides: Record<string, Record<string, TopicUpdate>> = {
  [UPCOMING]: { demoted: { status: 'draft' } },
};

let harness: FakeRedisHarness;

beforeEach(() => {
  harness = installFakeRedis();

  const dates = new Set([
    ...Object.keys(topicsByDate),
    ...Object.keys(overrides),
  ]);
  for (const date of dates) {
    harness.redis.strings.set(redisKey('topic-overlay', date), {
      overrides: overrides[date] ?? {},
      topics: Object.fromEntries(
        (topicsByDate[date] ?? []).map((t) => [t.slug, t]),
      ),
    });
  }
  harness.redis.sets.set(redisKey('topic-overlay-dates'), dates);
  harness.redis.resetCommands();
});

afterEach(() => {
  harness.restore();
});

async function getSchedule(date?: string) {
  const url = new URL('https://show.shipshit.dev/api/public/schedule');
  if (date) url.searchParams.set('date', date);
  // No cookie or authorization header: the route must be safe for anonymous reads.
  const response = await GET(new Request(url));
  const raw = await response.text();
  return {
    body: JSON.parse(raw) as {
      availableDates: string[];
      resolvedDate: string | null;
      topics: Array<Record<string, string>>;
    },
    cacheControl: response.headers.get('Cache-Control'),
    raw,
    status: response.status,
  };
}

describe('GET /api/public/schedule', () => {
  test('upcoming dates expose only topics selected for the show', async () => {
    const { body, raw, status } = await getSchedule(UPCOMING);
    expect(status).toBe(200);
    expect(body.resolvedDate).toBe(UPCOMING);
    expect(body.topics).toEqual([
      {
        date: UPCOMING,
        slug: `${UPCOMING}-in_progress`,
        status: 'in_progress',
        title: `Title ${UPCOMING}-in_progress`,
      },
    ]);
    for (const hidden of ['draft', 'backlog', 'done'])
      expect(raw).not.toContain(`${UPCOMING}-${hidden}`);
    expect(raw).not.toContain('Demoted');
    expect(raw).not.toContain('Private producer notes');
  });

  test('past dates expose published topics as done and never drafts or backlog', async () => {
    const { body, raw, status } = await getSchedule(PAST);
    expect(status).toBe(200);
    expect(body.resolvedDate).toBe(PAST);
    expect(body.topics.map(({ slug, status }) => ({ slug, status }))).toEqual([
      { slug: `${PAST}-in_progress`, status: 'done' },
      { slug: `${PAST}-done`, status: 'done' },
    ]);
    expect(raw).not.toContain(`${PAST}-draft`);
    expect(raw).not.toContain(`${PAST}-backlog`);
  });

  test('the public date catalog omits dates with no publicly visible topic', async () => {
    const { body } = await getSchedule();
    expect(body.availableDates).toContain(UPCOMING);
    expect(body.availableDates).toContain(PAST);
    expect(body.availableDates).not.toContain(PAST_DRAFT_ONLY);
    expect(body.availableDates).not.toContain(UPCOMING_UNPUBLISHED);
    expect(body.resolvedDate).toBe(UPCOMING);
  });

  test('responses are edge-cacheable and one request costs two Redis requests', async () => {
    harness.redis.resetCommands();

    const { cacheControl, status } = await getSchedule(UPCOMING);

    expect(status).toBe(200);
    expect(cacheControl).toBe('s-maxage=60, stale-while-revalidate=300');
    expect(harness.redis.commands).toEqual(['smembers', 'exec']);
  });

  test('requesting an unpublished date falls back to the public catalog', async () => {
    for (const date of [PAST_DRAFT_ONLY, UPCOMING_UNPUBLISHED]) {
      const { body, raw, status } = await getSchedule(date);
      expect(status).toBe(200);
      expect(body.resolvedDate).toBe(UPCOMING);
      expect(raw).not.toContain(date);
    }
  });
});
