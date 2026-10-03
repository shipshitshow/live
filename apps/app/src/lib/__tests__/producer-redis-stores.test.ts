import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
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

  test('rendering after a failed MGET never writes defaults back', async () => {
    await saveEpisodeXPosts(DATE, {
      posts: [{ id: 'post-1', manual_metrics: { likes: 3 }, url: X_URL }],
    });
    harness.redis.resetCommands();

    harness.redis.failNext('mget');
    const rendered = await getEpisodeXMetrics(DATE);

    expect(rendered.posts[0].url).toBeNull();
    expect(harness.redis.count('set')).toBe(0);
    expect(
      (await getEpisodeXMetrics(DATE)).posts[0].manual_metrics?.likes,
    ).toBe(3);
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

  test('createTopic writes the overlay and registers the date', async () => {
    const result = await createTopic(NEW_TOPIC);

    expect(result).toEqual({
      fileName: 'topic-01-redis-topic.md',
      slug: 'redis-topic',
      status: 'backlog',
    });
    expect(harness.redis.strings.has(`sss:test:v1:topic-overlay:${DATE}`)).toBe(
      true,
    );
    expect(
      harness.redis.sets.get('sss:test:v1:topic-overlay-dates')?.has(DATE),
    ).toBe(true);
    expect(harness.redis.commands).toEqual(['get', 'set', 'sadd']);

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

    const overlay = harness.redis.strings.get(
      `sss:test:v1:topic-overlay:${SEED_DATE}`,
    ) as {
      overrides: Record<string, unknown>;
      topics: Record<string, unknown>;
    };
    expect(Object.keys(overlay.topics)).toEqual([]);
    expect(overlay.overrides[SEED_SLUG]).toMatchObject({ status: 'done' });

    const topic = (await getTopicsForDate(SEED_DATE)).find(
      (candidate) => candidate.slug === SEED_SLUG,
    );
    expect(topic?.status).toBe('done');
    expect(topic?.content.length).toBeGreaterThan(0);
  });

  test('a snapshot costs two commands and is memoized for reads', async () => {
    await createTopic(NEW_TOPIC);
    harness.redis.resetCommands();

    await getTopicsForDate(DATE);
    expect(harness.redis.commands).toEqual(['smembers', 'mget']);

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

  test('a failed strict read causes no SET for createTopic or saveTopicUpdate', async () => {
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

    expect(harness.redis.count('set')).toBe(0);
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
