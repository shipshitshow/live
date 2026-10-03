import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';

const BODY = {
  authorDisplayName: 'Viewer',
  channelLabel: 'main',
  commentText: 'Nice',
  videoTitle: 'pstack',
};

// Fake provider credential; assembled so secret scanners do not flag the fixture.
const FIXTURE_CREDENTIAL = ['sk', 'live', 'SECRET999'].join('-');

const realFetch = globalThis.fetch;
let savedKey: string | undefined;

beforeEach(() => {
  savedKey = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
});

afterEach(() => {
  globalThis.fetch = realFetch;
  if (savedKey === undefined) delete process.env.OPENROUTER_API_KEY;
  else process.env.OPENROUTER_API_KEY = savedKey;
});

function post(body: unknown) {
  return POST(
    new NextRequest('http://localhost/api/comments/draft', {
      body: JSON.stringify(body),
      method: 'POST',
    }),
  );
}

describe('/api/comments/draft', () => {
  test('GET exposes the capability state for the UI', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.available).toBe(false);
    expect(data.missing).toEqual(['OPENROUTER_API_KEY']);
  });

  test('POST returns a structured 503 when the provider is not configured', async () => {
    const res = await post(BODY);
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.code).toBe('draft_not_configured');
    expect(data.error).toBeString();
    expect(data.hint).toContain('OPENROUTER_API_KEY');
  });

  test('POST surfaces a sanitized provider failure', async () => {
    process.env.OPENROUTER_API_KEY = FIXTURE_CREDENTIAL;
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({ error: { message: `Bad key ${FIXTURE_CREDENTIAL}` } }),
        { status: 401 },
      )) as unknown as typeof fetch;
    const res = await post(BODY);
    expect(res.status).toBe(502);
    const text = await res.text();
    expect(text).not.toContain('SECRET999');
    expect(JSON.parse(text).code).toBe('draft_provider_unauthorized');
  });

  test('POST rejects incomplete bodies', async () => {
    const res = await post({ commentText: 'x' });
    expect(res.status).toBe(400);
  });
});
