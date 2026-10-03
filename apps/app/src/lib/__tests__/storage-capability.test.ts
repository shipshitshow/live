import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test';
import { NextRequest } from 'next/server';
import { PUT as putLinkedIn } from '@/app/api/distribution/[date]/linkedin/route';
import { PATCH as patchDistribution } from '@/app/api/distribution/[date]/route';
import { PATCH as patchLead } from '@/app/api/leads/[id]/route';
import { POST as postLead } from '@/app/api/leads/route';
import { PATCH as patchDrawing } from '@/app/api/livestreams/[slug]/drawing/route';
import { PUT as putXPosts } from '@/app/api/livestreams/[slug]/x-posts/route';
import { PATCH as patchTopic } from '@/app/api/topics/[date]/[slug]/route';
import { POST as postTopic } from '@/app/api/topics/route';
import { producerSession } from '@/lib/producer-session';
import {
  isStorageUnavailableResponse,
  STORAGE_UNAVAILABLE_CODE,
  STORAGE_WRITE_FAILED_CODE,
} from '@/lib/storage-capability';
import { isStorageWritable } from '@/lib/storage-capability-server';
import { type FakeRedisHarness, installFakeRedis } from './fake-redis';

const DATE = '2026-09-29';
const SEED_SLUG = 'opus-5-5-sonnet-5-5-masterclass';
const ENV_KEYS = [
  'KV_REST_API_TOKEN',
  'KV_REST_API_URL',
  'PRODUCER_STORAGE',
  'VERCEL',
] as const;

let previous: Array<readonly [string, string | undefined]> = [];

function request(method: string, body: unknown, url = 'http://localhost/api') {
  return new NextRequest(url, {
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
    method,
  });
}

function useReadOnlyVercelRuntime() {
  process.env.VERCEL = '1';
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.PRODUCER_STORAGE;
}

let savedProducerIds: string | undefined;
let producerSpy: ReturnType<typeof producerAs>;
function producerAs() {
  return spyOn(producerSession, 'getUserId').mockResolvedValue('user_producer');
}

beforeEach(() => {
  savedProducerIds = process.env.PRODUCER_CLERK_USER_IDS;
  process.env.PRODUCER_CLERK_USER_IDS = 'user_producer';
  producerSpy = producerAs();
  previous = ENV_KEYS.map((key) => [key, process.env[key]] as const);
});

afterEach(() => {
  producerSpy.mockRestore();
  if (savedProducerIds === undefined)
    delete process.env.PRODUCER_CLERK_USER_IDS;
  else process.env.PRODUCER_CLERK_USER_IDS = savedProducerIds;
  for (const [key, value] of previous) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('isStorageWritable', () => {
  test('is false on Vercel without the Upstash variables', () => {
    useReadOnlyVercelRuntime();
    expect(isStorageWritable()).toBe(false);

    process.env.KV_REST_API_URL = 'https://x.test';
    expect(isStorageWritable()).toBe(false);
  });

  test('is true on Vercel with the Upstash variables and off Vercel', () => {
    process.env.VERCEL = '1';
    process.env.KV_REST_API_URL = 'https://x.test';
    process.env.KV_REST_API_TOKEN = 'test-only';
    expect(isStorageWritable()).toBe(true);

    delete process.env.VERCEL;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    expect(isStorageWritable()).toBe(true);
  });
});

describe('isStorageUnavailableResponse', () => {
  test('matches only the storage-unavailable code', () => {
    expect(
      isStorageUnavailableResponse({
        code: STORAGE_UNAVAILABLE_CODE,
        error: 'read-only',
      }),
    ).toBe(true);
    expect(isStorageUnavailableResponse({ error: 'boom' })).toBe(false);
    expect(isStorageUnavailableResponse(null)).toBe(false);
  });
});

describe('write routes on a read-only deployment', () => {
  test('LinkedIn metrics save returns a structured 503, not a 500', async () => {
    useReadOnlyVercelRuntime();

    const response = await putLinkedIn(request('PUT', { posts: [] }), {
      params: Promise.resolve({ date: DATE }),
    });
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(isStorageUnavailableResponse(body)).toBe(true);
    expect(body.error).toContain('LinkedIn');
    expect(body.hint).toContain('KV_REST_API_URL');
  });

  test('X posts save returns a structured 503', async () => {
    useReadOnlyVercelRuntime();

    const response = await putXPosts(request('PUT', { posts: [] }), {
      params: Promise.resolve({ slug: DATE }),
    });
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(isStorageUnavailableResponse(body)).toBe(true);
    expect(body.error).toContain('X post');
  });

  test('distribution checklist save returns a structured 503', async () => {
    useReadOnlyVercelRuntime();

    const response = await patchDistribution(
      request('PATCH', { assetId: 'livestream-1', status: 'published' }),
      { params: Promise.resolve({ date: DATE }) },
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(isStorageUnavailableResponse(body)).toBe(true);
    expect(body.error).toContain('checklist');
  });

  test('topic create, topic status, drawing and lead writes are guarded', async () => {
    useReadOnlyVercelRuntime();

    const responses = await Promise.all([
      postTopic(
        request('POST', {
          content: 'c',
          date: '2001-04-01',
          slug: 's',
          source: 'x',
          title: 't',
        }),
      ),
      patchTopic(request('PATCH', { status: 'done' }), {
        params: Promise.resolve({ date: DATE, slug: SEED_SLUG }),
      }),
      patchDrawing(request('PATCH', { content: '{}' }), {
        params: Promise.resolve({ slug: SEED_SLUG }),
      }),
      postLead(request('POST', { date: DATE, source: 'x' })),
      patchLead(request('PATCH', { status: 'won' }), {
        params: Promise.resolve({ id: 'lead-1' }),
      }),
    ]);

    for (const response of responses) {
      const body = await response.json();
      expect(response.status).toBe(503);
      expect(isStorageUnavailableResponse(body)).toBe(true);
    }
  });
});

describe('write routes when Redis fails', () => {
  let harness: FakeRedisHarness;
  let previousBearer: string | undefined;

  beforeEach(() => {
    harness = installFakeRedis();
    previousBearer = process.env.X_BEARER_TOKEN;
    delete process.env.X_BEARER_TOKEN;
  });

  afterEach(() => {
    harness.restore();
    if (previousBearer === undefined) delete process.env.X_BEARER_TOKEN;
    else process.env.X_BEARER_TOKEN = previousBearer;
  });

  async function expectWriteFailed(response: Response) {
    const body = await response.json();
    expect(response.status).toBe(503);
    expect(body.code).toBe(STORAGE_WRITE_FAILED_CODE);
    expect(typeof body.error).toBe('string');
    expect(body.hint).toContain('Upstash');
    expect(body.hint).toContain('KV_REST_API_TOKEN');
  }

  test('POST /api/topics', async () => {
    harness.redis.failNext('get');
    await expectWriteFailed(
      await postTopic(
        request('POST', {
          content: 'c',
          date: '2001-04-01',
          slug: 's',
          source: 'x',
          title: 't',
        }),
      ),
    );
    expect(harness.redis.count('set')).toBe(0);
  });

  test('PATCH /api/topics/[date]/[slug]', async () => {
    harness.redis.failNext('get');
    await expectWriteFailed(
      await patchTopic(request('PATCH', { status: 'done' }), {
        params: Promise.resolve({ date: DATE, slug: SEED_SLUG }),
      }),
    );
    expect(harness.redis.count('set')).toBe(0);
  });

  test('PATCH /api/topics/[date]/[slug] when the transaction fails', async () => {
    harness.redis.failNext('exec');
    await expectWriteFailed(
      await patchTopic(request('PATCH', { status: 'done' }), {
        params: Promise.resolve({ date: DATE, slug: SEED_SLUG }),
      }),
    );
    expect(harness.redis.hashes.size).toBe(0);
    expect(harness.redis.sets.size).toBe(0);
  });

  test('PATCH /api/livestreams/[slug]/drawing', async () => {
    harness.redis.failNext('set');
    await expectWriteFailed(
      await patchDrawing(
        request(
          'PATCH',
          { content: JSON.stringify({ elements: [] }) },
          `http://localhost/api?date=${DATE}`,
        ),
        { params: Promise.resolve({ slug: SEED_SLUG }) },
      ),
    );
  });

  test('POST /api/leads', async () => {
    harness.redis.failNext('hset');
    await expectWriteFailed(
      await postLead(request('POST', { date: DATE, source: 'linkedin' })),
    );
  });

  test('PATCH /api/leads/[id]', async () => {
    harness.redis.failNext('hget');
    await expectWriteFailed(
      await patchLead(request('PATCH', { status: 'won' }), {
        params: Promise.resolve({ id: 'lead-1' }),
      }),
    );
    expect(harness.redis.count('hset')).toBe(0);
  });

  test('PUT /api/distribution/[date]/linkedin', async () => {
    harness.redis.failNext('get');
    await expectWriteFailed(
      await putLinkedIn(request('PUT', { posts: [] }), {
        params: Promise.resolve({ date: DATE }),
      }),
    );
    expect(harness.redis.count('set')).toBe(0);
  });

  test('PATCH /api/distribution/[date]', async () => {
    harness.redis.failNext('get');
    await expectWriteFailed(
      await patchDistribution(
        request('PATCH', { assetId: 'livestream-1', status: 'published' }),
        { params: Promise.resolve({ date: DATE }) },
      ),
    );
    expect(harness.redis.count('set')).toBe(0);
  });

  test('PUT /api/livestreams/[slug]/x-posts', async () => {
    harness.redis.failNext('get');
    await expectWriteFailed(
      await putXPosts(
        request('PUT', { posts: [{ id: 'post-1', url: null }] }),
        { params: Promise.resolve({ slug: DATE }) },
      ),
    );
    expect(harness.redis.count('set')).toBe(0);
  });
});

describe('write routes when Redis is healthy', () => {
  let harness: FakeRedisHarness;

  beforeEach(() => {
    harness = installFakeRedis();
  });

  afterEach(() => {
    harness.restore();
  });

  test('a drawing over 1,000,000 bytes is refused with 413 and not stored', async () => {
    const content = JSON.stringify({ pad: 'x'.repeat(1_000_001) });

    const response = await patchDrawing(
      request('PATCH', { content }, `http://localhost/api?date=${DATE}`),
      { params: Promise.resolve({ slug: SEED_SLUG }) },
    );

    expect(response.status).toBe(413);
    expect(harness.redis.count('set')).toBe(0);
  });

  test('a drawing within the limit is stored', async () => {
    const response = await patchDrawing(
      request(
        'PATCH',
        { content: JSON.stringify({ elements: [] }) },
        `http://localhost/api?date=${DATE}`,
      ),
      { params: Promise.resolve({ slug: SEED_SLUG }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(
      harness.redis.strings.has(`sss:test:v1:drawing:${DATE}:${SEED_SLUG}`),
    ).toBe(true);
  });

  test('topic status PATCH persists an override', async () => {
    const response = await patchTopic(request('PATCH', { status: 'done' }), {
      params: Promise.resolve({ date: DATE, slug: SEED_SLUG }),
    });

    expect(response.status).toBe(200);
    expect(
      harness.redis.hashes
        .get(`sss:test:v1:topic-overlay-fields:${DATE}`)
        ?.has(`override:${SEED_SLUG}`),
    ).toBe(true);
    expect(harness.redis.strings.has(`sss:test:v1:topic-overlay:${DATE}`)).toBe(
      false,
    );
  });
});
