import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test';
import { NextRequest } from 'next/server';
import { producerSession } from '@/lib/producer-session';
import {
  createOAuthState,
  SOCIAL_OAUTH_STATE_COOKIE,
} from '@/lib/youtube/oauth-state';
import { POST as seedTokens } from '../admin/seed-tokens/route';
import { GET as socialCallback } from '../auth/social/[platform]/callback/route';
import { GET as socialStart } from '../auth/social/[platform]/start/route';
import { GET as youtubeStart } from '../auth/youtube/start/route';
import { POST as reply } from '../comments/reply/route';
import { POST as lead } from '../leads/route';
import { POST as log } from '../logs/events/route';
import { GET as report } from '../report/route';
import { POST as topic } from '../topics/route';

const ENV_KEYS = [
  'PRODUCER_CLERK_USER_IDS',
  'OAUTH_STATE_SECRET',
  'YOUTUBE_CLIENT_ID',
  'INSTAGRAM_CLIENT_ID',
  'INSTAGRAM_CLIENT_SECRET',
  'VERCEL',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
] as const;
let previous: Array<readonly [string, string | undefined]>;
let session: ReturnType<typeof spyOn<typeof producerSession, 'getUserId'>>;
const realFetch = globalThis.fetch;

function request(path: string, method = 'GET', body?: unknown) {
  return new NextRequest(`https://show.test/api/${path}`, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
const platform = { params: Promise.resolve({ platform: 'instagram' }) };
const routes = [
  ['seed-tokens', () => seedTokens(request('admin/seed-tokens', 'POST', {}))],
  ['youtube/start', () => youtubeStart(request('auth/youtube/start'))],
  [
    'social/start',
    () => socialStart(request('auth/social/instagram/start'), platform),
  ],
  [
    'social/callback',
    () =>
      socialCallback(
        request('auth/social/instagram/callback?code=test&state=invalid'),
        platform,
      ),
  ],
  ['comments/reply', () => reply(request('comments/reply', 'POST', {}))],
  ['leads POST', () => lead(request('leads', 'POST', {}))],
  ['logs/events', () => log(request('logs/events', 'POST', {}))],
  ['topics POST', () => topic(request('topics', 'POST', {}))],
  ['report', () => report(request('report'))],
] as const;

beforeEach(() => {
  previous = ENV_KEYS.map((key) => [key, process.env[key]] as const);
  process.env.PRODUCER_CLERK_USER_IDS = 'user_producer';
  process.env.OAUTH_STATE_SECRET = 'test-only-signing-secret';
  process.env.INSTAGRAM_CLIENT_ID = 'test-client';
  process.env.INSTAGRAM_CLIENT_SECRET = 'test-secret';
  delete process.env.YOUTUBE_CLIENT_ID;
  session = spyOn(producerSession, 'getUserId').mockResolvedValue(
    'user_producer',
  );
});
afterEach(() => {
  session.mockRestore();
  globalThis.fetch = realFetch;
  for (const [key, value] of previous) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('producer handler guards', () => {
  for (const [name, call] of routes) {
    for (const [userId, status, code] of [
      [null, 401, 'sign_in_required'],
      ['user_member', 403, 'producer_required'],
    ] as const) {
      test(`${name}: ${userId ?? 'signed out'} is denied before side effects`, async () => {
        session.mockResolvedValue(userId);
        const fetchSpy = spyOn(globalThis, 'fetch');
        try {
          const response = await call();
          expect(response.status).toBe(status);
          expect(response.headers.get('Cache-Control')).toBe('no-store');
          expect((await response.json()).code).toBe(code);
          expect(fetchSpy).not.toHaveBeenCalled();
        } finally {
          fetchSpy.mockRestore();
        }
      });
    }
  }

  test('producer passes seed, reply, lead, log and YouTube configuration guards', async () => {
    process.env.VERCEL = '1';
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    expect(
      (await seedTokens(request('admin/seed-tokens', 'POST', {}))).status,
    ).toBe(400);
    expect((await reply(request('comments/reply', 'POST', {}))).status).toBe(
      400,
    );
    expect((await lead(request('leads', 'POST', {}))).status).toBe(503);
    expect((await log(request('logs/events', 'POST', {}))).status).toBe(400);
    expect((await youtubeStart(request('auth/youtube/start'))).status).toBe(
      404,
    );
  });

  test('social start signs state, sanitizes next and binds it to a cookie', async () => {
    const response = await socialStart(
      request('auth/social/instagram/start?next=//evil.test'),
      platform,
    );
    expect(response.status).toBe(307);
    expect(response.cookies.get(SOCIAL_OAUTH_STATE_COOKIE)?.value).toBeTruthy();
    expect(response.headers.get('Set-Cookie')).toContain(
      'Path=/api/auth/social',
    );
    const url = new URL(response.headers.get('Location') ?? '');
    const payload = JSON.parse(
      Buffer.from(
        url.searchParams.get('state')?.split('.')[0] ?? '',
        'base64url',
      ).toString(),
    );
    expect(payload.next).toBe('/analytics');
    expect(payload.channel).toBe('instagram');
  });

  test('social callback rejects missing, tampered and cross-platform state without fetching', async () => {
    const { state, nonce } = createOAuthState({
      channel: 'tiktok',
      next: '/studio',
    });
    const fetchSpy = spyOn(globalThis, 'fetch');
    try {
      for (const raw of ['', 'invalid', state]) {
        const req = request(
          `auth/social/instagram/callback?code=test&state=${encodeURIComponent(raw)}`,
        );
        req.cookies.set(SOCIAL_OAUTH_STATE_COOKIE, nonce);
        const response = await socialCallback(req, platform);
        expect(response.status).toBe(307);
        expect(response.headers.get('Location')).toContain('invalid_callback');
        expect(response.headers.get('Set-Cookie')).toContain('Max-Age=0');
      }
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
