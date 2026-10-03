import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import {
  readEpisodeDistribution,
  readEpisodeDistributions,
  saveEpisodeDistributionAsset,
} from '@/lib/distribution-store';
import { createLead, listLeads, updateLead } from '@/lib/leads-store';
import {
  readLinkedInPosts,
  saveLinkedInPosts,
} from '@/lib/linkedin-metrics-store';
import {
  clearTopicOverlayCache,
  createTopic,
  getTopicsForDate,
  listAvailableLivestreamDates,
  readTopicDrawing,
  saveTopicDrawing,
  saveTopicUpdate,
} from '@/lib/livestreams-store';
import {
  getEpisodeXMetrics,
  saveEpisodeXPosts,
} from '@/lib/livestreams-x-posts';
import { StorageWriteError } from '@/lib/producer-storage';
import { type FakeRedisHarness, installFakeRedis } from './fake-redis';

// Dates far from the real episodes keep fixtures apart from tracked data.
const DATE = '2001-02-03';
const DATE_B = '2001-02-04';
const DATE_C = '2001-02-05';
const SEED_DATE = '2026-09-29';
const SEED_SLUG = 'opus-5-5-sonnet-5-5-masterclass';
const POST_URL = 'https://www.linkedin.com/feed/update/urn:li:activity:1/';

const DATA_DIR =
  process.env.DATA_DIR || path.join(process.cwd(), 'data', 'livestream');
const LEADS_DIR =
  process.env.LEADS_DIR || path.join(process.cwd(), 'data', 'leads');

let harness: FakeRedisHarness;
let previousBearer: string | undefined;
const createdPaths: string[] = [];

function writeRepoFile(filePath: string, data: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8');
  createdPaths.push(filePath);
}

beforeEach(() => {
  harness = installFakeRedis();
  previousBearer = process.env.X_BEARER_TOKEN;
  delete process.env.X_BEARER_TOKEN;
});

afterEach(() => {
  harness.restore();
  if (previousBearer === undefined) delete process.env.X_BEARER_TOKEN;
  else process.env.X_BEARER_TOKEN = previousBearer;

  for (const filePath of createdPaths.splice(0)) {
    fs.rmSync(filePath, { force: true });
    const dir = path.dirname(filePath);
    if (dir.startsWith(DATA_DIR) && dir !== DATA_DIR) {
      fs.rmSync(dir, { force: true, recursive: true });
    }
  }
});

describe('distribution checklist', () => {
  test('round-trips through Redis under the namespaced key', async () => {
    const saved = await saveEpisodeDistributionAsset(DATE, 'livestream-1', {
      status: 'published',
      url: 'https://youtu.be/abc',
    });

    expect(saved?.assets.find((a) => a.id === 'livestream-1')?.status).toBe(
      'published',
    );
    expect(harness.redis.strings.has(`sss:test:v1:distribution:${DATE}`)).toBe(
      true,
    );

    const read = await readEpisodeDistribution(DATE);
    const asset = read?.assets.find((a) => a.id === 'livestream-1');
    expect(asset?.url).toBe('https://youtu.be/abc');
    expect(asset?.publishedAt).not.toBeNull();
    expect(await readEpisodeDistribution(DATE_B)).toBeNull();
  });

  test('a Redis record beats the repo file, which is the fallback', async () => {
    const filePath = path.join(DATA_DIR, DATE_B, 'distribution.json');
    writeRepoFile(filePath, {
      assets: [
        {
          id: 'playbook-1',
          publishedAt: '2001-02-04T00:00:00.000Z',
          status: 'published',
          type: 'playbook',
          url: null,
        },
      ],
      updatedAt: '2001-02-04T00:00:00.000Z',
    });

    const fromFile = await readEpisodeDistribution(DATE_B);
    expect(fromFile?.assets.find((a) => a.id === 'playbook-1')?.status).toBe(
      'published',
    );

    harness.redis.strings.set(`sss:test:v1:distribution:${DATE_B}`, {
      assets: [
        {
          id: 'playbook-1',
          publishedAt: null,
          status: 'pending',
          type: 'playbook',
          url: null,
        },
      ],
      updatedAt: '2001-02-05T00:00:00.000Z',
    });

    const fromRedis = await readEpisodeDistribution(DATE_B);
    expect(fromRedis?.assets.find((a) => a.id === 'playbook-1')?.status).toBe(
      'pending',
    );
  });

  test('a failed strict read causes no SET and keeps the stored data', async () => {
    await saveEpisodeDistributionAsset(DATE, 'livestream-1', {
      status: 'published',
    });
    const key = `sss:test:v1:distribution:${DATE}`;
    const before = JSON.stringify(harness.redis.strings.get(key));
    harness.redis.resetCommands();

    harness.redis.failNext('get');
    await expect(
      saveEpisodeDistributionAsset(DATE, 'playbook-1', { status: 'skipped' }),
    ).rejects.toBeInstanceOf(StorageWriteError);

    expect(harness.redis.count('set')).toBe(0);
    expect(JSON.stringify(harness.redis.strings.get(key))).toBe(before);
  });

  test('a failed write surfaces as a StorageWriteError', async () => {
    harness.redis.failNext('set');
    await expect(
      saveEpisodeDistributionAsset(DATE, 'livestream-1', {
        status: 'published',
      }),
    ).rejects.toBeInstanceOf(StorageWriteError);
  });

  test('readEpisodeDistributions batches every date into one MGET', async () => {
    await saveEpisodeDistributionAsset(DATE, 'livestream-1', {
      status: 'published',
    });
    harness.redis.resetCommands();

    const distributions = await readEpisodeDistributions([
      DATE,
      DATE_B,
      DATE_C,
    ]);

    expect(harness.redis.count('mget')).toBe(1);
    expect(harness.redis.commandCount).toBe(1);
    expect([...distributions.keys()]).toEqual([DATE]);
  });
});

describe('LinkedIn metrics', () => {
  function input(overrides: Record<string, unknown> = {}) {
    return {
      author: 'vincent',
      id: 'post-1',
      metrics: { comments: null, impressions: 5, reactions: 2 },
      postUrl: POST_URL,
      publishedOn: '2001-02-03',
      ...overrides,
    };
  }

  test('round-trips and keeps metricsRecordedAt when numbers are unchanged', async () => {
    const [first] = await saveLinkedInPosts(DATE, [input()]);
    expect(first.metricsRecordedAt).not.toBeNull();
    expect(
      harness.redis.strings.has(`sss:test:v1:linkedin-posts:${DATE}`),
    ).toBe(true);

    const [reread] = await readLinkedInPosts(DATE);
    expect(reread.metricsRecordedAt).toBe(first.metricsRecordedAt);

    const [resaved] = await saveLinkedInPosts(DATE, [
      input({ publishedOn: '2001-02-04' }),
    ]);
    expect(resaved.metricsRecordedAt).toBe(first.metricsRecordedAt);
    expect(resaved.publishedOn).toBe('2001-02-04');
  });

  test('a failed strict read causes no SET', async () => {
    await saveLinkedInPosts(DATE, [input()]);
    harness.redis.resetCommands();

    harness.redis.failNext('get');
    await expect(saveLinkedInPosts(DATE, [])).rejects.toBeInstanceOf(
      StorageWriteError,
    );
    expect(harness.redis.count('set')).toBe(0);
    expect(await readLinkedInPosts(DATE)).toHaveLength(1);
  });

  test('a failed non-strict read returns empty instead of throwing', async () => {
    harness.redis.failNext('get');
    expect(await readLinkedInPosts(DATE)).toEqual([]);
  });
});

describe('X posts', () => {
  const X_URL = 'https://x.com/shipshitdev/status/1234567890';

  test('round-trips URLs and manual metrics through Redis', async () => {
    const saved = await saveEpisodeXPosts(DATE, {
      posts: [
        {
          id: 'post-1',
          manual_metrics: { impressions: 120, likes: 7 },
          url: X_URL,
        },
      ],
    });

    expect(saved.posts[0].url).toBe(X_URL);
    expect(saved.posts[0].metrics?.impressions).toBe(120);
    expect(harness.redis.strings.has(`sss:test:v1:x-posts:${DATE}`)).toBe(true);

    const reread = await getEpisodeXMetrics(DATE);
    expect(reread.posts[0].manual_metrics?.likes).toBe(7);
  });

  test('a failed strict read causes no SET', async () => {
    await saveEpisodeXPosts(DATE, {
      posts: [{ id: 'post-1', url: X_URL }],
    });
    harness.redis.resetCommands();

    harness.redis.failNext('get');
    await expect(
      saveEpisodeXPosts(DATE, { posts: [{ id: 'post-1', url: null }] }),
    ).rejects.toBeInstanceOf(StorageWriteError);

    expect(harness.redis.count('set')).toBe(0);
    expect((await getEpisodeXMetrics(DATE)).posts[0].url).toBe(X_URL);
  });

  describe('with an X API token', () => {
    let fetchSpy: { mockClear: () => void; mockRestore: () => void };

    beforeEach(() => {
      process.env.X_BEARER_TOKEN = 'test-only';
      fetchSpy = spyOn(globalThis, 'fetch').mockImplementation((async () =>
        Response.json({
          data: [
            {
              id: '1234567890',
              public_metrics: {
                bookmark_count: 0,
                impression_count: 50,
                like_count: 4,
                quote_count: 0,
                reply_count: 0,
                retweet_count: 1,
              },
            },
          ],
        })) as unknown as typeof fetch);
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    test('the API metric cache is persisted next to the manual entry', async () => {
      await saveEpisodeXPosts(DATE, {
        posts: [{ id: 'post-1', manual_metrics: { likes: 3 }, url: X_URL }],
      });

      const stored = harness.redis.strings.get(
        `sss:test:v1:x-posts:${DATE}`,
      ) as { posts: Array<Record<string, unknown>> };
      expect(stored.posts[0].api_metrics).toMatchObject({ impressions: 50 });
      expect(stored.posts[0].manual_metrics).toMatchObject({ likes: 3 });
    });

    test('a failed MGET renders from the repo file and never writes it back over Redis', async () => {
      await saveEpisodeXPosts(DATE_B, {
        posts: [{ id: 'post-1', manual_metrics: { likes: 3 }, url: X_URL }],
      });
      writeRepoFile(path.join(DATA_DIR, DATE_B, 'x-posts.json'), {
        posts: [{ id: 'post-1', url: X_URL }],
        updated_at: null,
      });
      const key = `sss:test:v1:x-posts:${DATE_B}`;
      const before = JSON.stringify(harness.redis.strings.get(key));
      harness.redis.resetCommands();
      fetchSpy.mockClear();

      harness.redis.failNext('mget');
      const rendered = await getEpisodeXMetrics(DATE_B);

      expect(fetchSpy).toHaveBeenCalled();
      expect(rendered.posts[0].api_metrics?.impressions).toBe(50);
      expect(harness.redis.count('set')).toBe(0);
      expect(JSON.stringify(harness.redis.strings.get(key))).toBe(before);
    });
  });
});

describe('leads', () => {
  test('create, list and update through the Redis hash', async () => {
    const lead = await createLead({ date: DATE, source: 'linkedin' });
    expect(harness.redis.hashes.get('sss:test:v1:leads')?.has(lead.id)).toBe(
      true,
    );

    const updated = await updateLead(lead.id, { status: 'won' });
    expect(updated?.status).toBe('won');
    expect(updated?.createdAt).toBe(lead.createdAt);

    const listed = (await listLeads()).filter((entry) => entry.id === lead.id);
    expect(listed).toHaveLength(1);
    expect(listed[0].status).toBe('won');
    expect(await updateLead('missing-lead', { status: 'won' })).toBeNull();
  });

  test('unions repo-file leads with Redis leads, Redis winning by id', async () => {
    const filePath = path.join(LEADS_DIR, 'file-lead.json');
    writeRepoFile(filePath, {
      createdAt: '2001-02-03T00:00:00.000Z',
      date: DATE,
      id: 'file-lead',
      source: 'x',
      status: 'new',
      updatedAt: '2001-02-03T00:00:00.000Z',
    });

    expect((await listLeads()).find((l) => l.id === 'file-lead')?.status).toBe(
      'new',
    );

    await updateLead('file-lead', { status: 'replied' });
    expect(
      harness.redis.hashes.get('sss:test:v1:leads')?.has('file-lead'),
    ).toBe(true);
    expect((await listLeads()).find((l) => l.id === 'file-lead')?.status).toBe(
      'replied',
    );
  });

  test('a failed HGET causes no HSET', async () => {
    const lead = await createLead({ date: DATE, source: 'email' });
    harness.redis.resetCommands();

    harness.redis.failNext('hget');
    await expect(
      updateLead(lead.id, { status: 'dead' }),
    ).rejects.toBeInstanceOf(StorageWriteError);

    expect(harness.redis.count('hset')).toBe(0);
    expect((await listLeads()).find((l) => l.id === lead.id)?.status).toBe(
      'new',
    );
  });
});

describe('topic overlay', () => {
  const NEW_TOPIC = {
    content: 'Body',
    date: DATE,
    slug: 'redis-topic',
    source: 'https://example.com',
    title: 'Redis topic',
  };
  const FIELDS_KEY = (date: string) =>
    `sss:test:v1:topic-overlay-fields:${date}`;
  const LEGACY_KEY = (date: string) => `sss:test:v1:topic-overlay:${date}`;

  function legacyTopic(slug: string, title: string) {
    return {
      announcement_tweet: null,
      content: 'Legacy body',
      date: DATE,
      fileName: `topic-01-${slug}.md`,
      generated: {},
      slug,
      source: 'https://example.com',
      status: 'backlog',
      thumbnail_prompt: null,
      title,
    };
  }

  test('createTopic writes one hash field and registers the date atomically', async () => {
    const result = await createTopic(NEW_TOPIC);

    expect(result).toEqual({
      fileName: 'topic-01-redis-topic.md',
      slug: 'redis-topic',
      status: 'backlog',
    });
    expect(
      harness.redis.hashes.get(FIELDS_KEY(DATE))?.has('topic:redis-topic'),
    ).toBe(true);
    expect(harness.redis.strings.has(LEGACY_KEY(DATE))).toBe(false);
    expect(
      harness.redis.sets.get('sss:test:v1:topic-overlay-dates')?.has(DATE),
    ).toBe(true);
    expect(harness.redis.commands).toEqual(['hgetall', 'get', 'exec']);

    const topics = await getTopicsForDate(DATE);
    expect(topics.map((topic) => topic.slug)).toEqual(['redis-topic']);
    expect(await listAvailableLivestreamDates()).toContain(DATE);
  });

  test('merges repo seed, overlay topic, then override', async () => {
    await createTopic({
      ...NEW_TOPIC,
      date: SEED_DATE,
      slug: SEED_SLUG,
      title: 'Overlay title',
    });
    await saveTopicUpdate(SEED_DATE, SEED_SLUG, { status: 'done' });

    const topic = (await getTopicsForDate(SEED_DATE)).find(
      (candidate) => candidate.slug === SEED_SLUG,
    );
    expect(topic?.title).toBe('Overlay title');
    expect(topic?.status).toBe('done');

    expect(await saveTopicUpdate(SEED_DATE, 'no-such-slug', {})).toBe(false);
  });

  test('overrides apply to a repo seed topic without copying it', async () => {
    await saveTopicUpdate(SEED_DATE, SEED_SLUG, { status: 'done' });

    const fields = harness.redis.hashes.get(FIELDS_KEY(SEED_DATE));
    expect([...(fields?.keys() ?? [])]).toEqual([`override:${SEED_SLUG}`]);
    expect(fields?.get(`override:${SEED_SLUG}`)).toMatchObject({
      status: 'done',
    });

    const topic = (await getTopicsForDate(SEED_DATE)).find(
      (candidate) => candidate.slug === SEED_SLUG,
    );
    expect(topic?.status).toBe('done');
    expect(topic?.content.length).toBeGreaterThan(0);
  });

  test('interleaved updates to different slugs on one date both persist', async () => {
    await createTopic(NEW_TOPIC);
    await createTopic({ ...NEW_TOPIC, slug: 'second-topic' });

    const results = await Promise.all([
      saveTopicUpdate(DATE, 'redis-topic', { status: 'done' }),
      saveTopicUpdate(DATE, 'second-topic', { status: 'draft' }),
    ]);
    expect(results).toEqual([true, true]);

    const statuses = Object.fromEntries(
      (await getTopicsForDate(DATE, true)).map((topic) => [
        topic.slug,
        topic.status,
      ]),
    );
    expect(statuses).toEqual({
      'redis-topic': 'done',
      'second-topic': 'draft',
    });
  });

  test('createTopic and saveTopicUpdate on different slugs both persist', async () => {
    await createTopic(NEW_TOPIC);

    await Promise.all([
      createTopic({ ...NEW_TOPIC, slug: 'second-topic' }),
      saveTopicUpdate(DATE, 'redis-topic', { status: 'done' }),
    ]);

    const topics = await getTopicsForDate(DATE, true);
    expect(topics.map((topic) => topic.slug).sort()).toEqual([
      'redis-topic',
      'second-topic',
    ]);
    expect(topics.find((topic) => topic.slug === 'redis-topic')?.status).toBe(
      'done',
    );
  });

  test('two creates for the same date keep both topics', async () => {
    await Promise.all([
      createTopic(NEW_TOPIC),
      createTopic({ ...NEW_TOPIC, slug: 'second-topic' }),
    ]);

    expect(
      (await getTopicsForDate(DATE, true)).map((topic) => topic.slug).sort(),
    ).toEqual(['redis-topic', 'second-topic']);
  });

  test('a failed transaction writes neither the field nor the date index', async () => {
    harness.redis.failNext('exec');
    await expect(createTopic(NEW_TOPIC)).rejects.toBeInstanceOf(
      StorageWriteError,
    );
    expect(harness.redis.hashes.size).toBe(0);
    expect(harness.redis.sets.size).toBe(0);

    await createTopic(NEW_TOPIC);
    const before = JSON.stringify([
      ...(harness.redis.hashes.get(FIELDS_KEY(DATE)) ?? []),
    ]);
    harness.redis.failNext('exec');
    await expect(
      saveTopicUpdate(DATE, 'redis-topic', { status: 'done' }),
    ).rejects.toBeInstanceOf(StorageWriteError);
    expect(
      JSON.stringify([...(harness.redis.hashes.get(FIELDS_KEY(DATE)) ?? [])]),
    ).toBe(before);
    expect(
      (await getTopicsForDate(DATE, true)).find(
        (topic) => topic.slug === 'redis-topic',
      )?.status,
    ).toBe('backlog');
  });

  test('a legacy whole-date string is still read and hash fields win over it', async () => {
    harness.redis.strings.set(LEGACY_KEY(DATE), {
      overrides: {
        'legacy-topic': { status: 'done', thumbnail_prompt: 'legacy prompt' },
        'shared-topic': { status: 'draft' },
      },
      topics: {
        'legacy-topic': legacyTopic('legacy-topic', 'Legacy title'),
        'shared-topic': legacyTopic('shared-topic', 'Legacy shared'),
      },
    });
    harness.redis.sets.set('sss:test:v1:topic-overlay-dates', new Set([DATE]));

    const legacyOnly = await getTopicsForDate(DATE, true);
    expect(legacyOnly.map((topic) => topic.slug).sort()).toEqual([
      'legacy-topic',
      'shared-topic',
    ]);
    expect(
      legacyOnly.find((topic) => topic.slug === 'legacy-topic')?.status,
    ).toBe('done');

    harness.redis.hashes.set(
      FIELDS_KEY(DATE),
      new Map<string, unknown>([
        [
          'topic:shared-topic',
          { ...legacyTopic('shared-topic', 'Hash shared'), content: 'Hash' },
        ],
        ['override:shared-topic', { status: 'in_progress' }],
      ]),
    );

    for (const strict of [true, false]) {
      clearTopicOverlayCache();
      const topics = await getTopicsForDate(DATE, strict);
      const shared = topics.find((topic) => topic.slug === 'shared-topic');
      expect(shared?.title).toBe('Hash shared');
      expect(shared?.status).toBe('in_progress');
      const legacy = topics.find((topic) => topic.slug === 'legacy-topic');
      expect(legacy?.title).toBe('Legacy title');
      expect(legacy?.thumbnail_prompt).toBe('legacy prompt');
    }

    await saveTopicUpdate(DATE, 'legacy-topic', { status: 'draft' });
    expect(harness.redis.strings.get(LEGACY_KEY(DATE))).toMatchObject({
      overrides: { 'legacy-topic': { status: 'done' } },
    });
    const updated = (await getTopicsForDate(DATE, true)).find(
      (topic) => topic.slug === 'legacy-topic',
    );
    expect(updated?.status).toBe('draft');
    expect(updated?.thumbnail_prompt).toBe('legacy prompt');
  });

  test('a snapshot costs two requests and is memoized for reads', async () => {
    await createTopic(NEW_TOPIC);
    await createTopic({ ...NEW_TOPIC, date: DATE_B });
    harness.redis.resetCommands();

    await getTopicsForDate(DATE);
    expect(harness.redis.commands).toEqual(['smembers', 'exec']);

    await getTopicsForDate(DATE_B);
    await listAvailableLivestreamDates();
    expect(harness.redis.commandCount).toBe(2);
  });

  test('a write clears the memoized snapshot', async () => {
    await getTopicsForDate(DATE);
    await createTopic(NEW_TOPIC);

    expect((await getTopicsForDate(DATE)).map((topic) => topic.slug)).toEqual([
      'redis-topic',
    ]);
  });

  test('a failed strict read causes no write for createTopic or saveTopicUpdate', async () => {
    await createTopic(NEW_TOPIC);
    harness.redis.resetCommands();

    harness.redis.failNext('get');
    await expect(
      createTopic({ ...NEW_TOPIC, slug: 'another' }),
    ).rejects.toBeInstanceOf(StorageWriteError);

    harness.redis.failNext('get');
    await expect(
      saveTopicUpdate(DATE, 'redis-topic', { status: 'done' }),
    ).rejects.toBeInstanceOf(StorageWriteError);

    harness.redis.failNext('hget');
    await expect(
      saveTopicUpdate(DATE, 'redis-topic', { status: 'done' }),
    ).rejects.toBeInstanceOf(StorageWriteError);

    expect(harness.redis.count('exec')).toBe(0);
    expect((await getTopicsForDate(DATE)).map((topic) => topic.slug)).toEqual([
      'redis-topic',
    ]);
  });

  test('a failed snapshot read is not cached and reads as no overlay', async () => {
    await createTopic(NEW_TOPIC);

    harness.redis.failNext('smembers');
    expect(await getTopicsForDate(DATE)).toEqual([]);
    expect((await getTopicsForDate(DATE)).map((topic) => topic.slug)).toEqual([
      'redis-topic',
    ]);

    clearTopicOverlayCache();
    harness.redis.failNext('exec');
    expect(await getTopicsForDate(DATE)).toEqual([]);
    expect((await getTopicsForDate(DATE)).map((topic) => topic.slug)).toEqual([
      'redis-topic',
    ]);
  });

  test('strict reads bypass the memoized snapshot', async () => {
    await createTopic(NEW_TOPIC);
    await getTopicsForDate(DATE);
    harness.redis.resetCommands();

    harness.redis.failNext('get');
    await expect(getTopicsForDate(DATE, true)).rejects.toBeInstanceOf(
      StorageWriteError,
    );
  });
});

describe('drawings', () => {
  test('save and read through Redis, falling back to empty', async () => {
    expect(await readTopicDrawing(SEED_DATE, SEED_SLUG)).toEqual({
      scene: null,
      updatedAt: null,
    });

    const updatedAt = await saveTopicDrawing(
      SEED_DATE,
      SEED_SLUG,
      JSON.stringify({ elements: [1, 2] }),
    );

    expect(
      harness.redis.strings.has(
        `sss:test:v1:drawing:${SEED_DATE}:${SEED_SLUG}`,
      ),
    ).toBe(true);
    expect(await readTopicDrawing(SEED_DATE, SEED_SLUG)).toEqual({
      scene: { elements: [1, 2] },
      updatedAt,
    });
  });
});
