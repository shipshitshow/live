import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { PUT as putLinkedIn } from '@/app/api/distribution/[date]/linkedin/route';
import { PATCH as patchDistribution } from '@/app/api/distribution/[date]/route';
import { PUT as putXPosts } from '@/app/api/livestreams/[slug]/x-posts/route';
import {
  isStorageUnavailableResponse,
  STORAGE_UNAVAILABLE_CODE,
} from '@/lib/storage-capability';
import { isStorageWritable } from '@/lib/storage-capability-server';

const DATE = '2026-09-29';

let previousVercel: string | undefined;
let previousToken: string | undefined;

function jsonRequest(method: string, body: unknown): Request {
  return new Request('http://localhost/api', {
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
    method,
  });
}

function useReadOnlyVercelRuntime() {
  process.env.VERCEL = '1';
  delete process.env.BLOB_READ_WRITE_TOKEN;
}

beforeEach(() => {
  previousVercel = process.env.VERCEL;
  previousToken = process.env.BLOB_READ_WRITE_TOKEN;
});

afterEach(() => {
  if (previousVercel === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = previousVercel;
  if (previousToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
  else process.env.BLOB_READ_WRITE_TOKEN = previousToken;
});

describe('isStorageWritable', () => {
  test('is false on Vercel without a blob token', () => {
    useReadOnlyVercelRuntime();
    expect(isStorageWritable()).toBe(false);
  });

  test('is true on Vercel with a blob token and off Vercel', () => {
    process.env.VERCEL = '1';
    process.env.BLOB_READ_WRITE_TOKEN = 'test-only';
    expect(isStorageWritable()).toBe(true);

    delete process.env.VERCEL;
    delete process.env.BLOB_READ_WRITE_TOKEN;
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

    const response = await putLinkedIn(jsonRequest('PUT', { posts: [] }), {
      params: Promise.resolve({ date: DATE }),
    });
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(isStorageUnavailableResponse(body)).toBe(true);
    expect(body.error).toContain('LinkedIn');
  });

  test('X posts save returns a structured 503', async () => {
    useReadOnlyVercelRuntime();

    const response = await putXPosts(jsonRequest('PUT', { posts: [] }), {
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
      jsonRequest('PATCH', { assetId: 'youtube-video', status: 'published' }),
      { params: Promise.resolve({ date: DATE }) },
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(isStorageUnavailableResponse(body)).toBe(true);
    expect(body.error).toContain('checklist');
  });
});
