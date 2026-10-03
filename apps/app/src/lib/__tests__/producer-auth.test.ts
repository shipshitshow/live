import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test';
import { GET as getAccess } from '@/app/api/producer/access/route';
import { getProducerAccess, requireProducer } from '../producer-auth';
import { producerSession } from '../producer-session';

let savedIds: string | undefined;

beforeEach(() => {
  savedIds = process.env.PRODUCER_CLERK_USER_IDS;
  process.env.PRODUCER_CLERK_USER_IDS = 'user_producer, user_other';
});

afterEach(() => {
  if (savedIds === undefined) delete process.env.PRODUCER_CLERK_USER_IDS;
  else process.env.PRODUCER_CLERK_USER_IDS = savedIds;
});

function sessionAs(userId: string | null) {
  return spyOn(producerSession, 'getUserId').mockResolvedValue(userId);
}

describe('requireProducer', () => {
  test('signed out gets a no-store 401', async () => {
    const spy = sessionAs(null);
    const result = await requireProducer();
    spy.mockRestore();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(401);
    expect(result.response.headers.get('Cache-Control')).toBe('no-store');
    expect((await result.response.json()).code).toBe('sign_in_required');
  });

  test('a signed-in non-producer gets a no-store 403', async () => {
    const spy = sessionAs('user_member');
    const result = await requireProducer();
    spy.mockRestore();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(403);
    expect(result.response.headers.get('Cache-Control')).toBe('no-store');
    expect((await result.response.json()).code).toBe('producer_required');
  });

  test('a listed producer passes with their user id', async () => {
    const spy = sessionAs('user_producer');
    const result = await requireProducer();
    spy.mockRestore();
    expect(result).toEqual({ ok: true, userId: 'user_producer' });
  });

  test('an unset allowlist denies everyone', async () => {
    delete process.env.PRODUCER_CLERK_USER_IDS;
    const spy = sessionAs('user_producer');
    const result = await requireProducer();
    spy.mockRestore();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(403);
  });

  test('a session lookup that throws counts as signed out', async () => {
    const spy = spyOn(producerSession, 'getUserId').mockRejectedValue(
      new Error('clerk unavailable'),
    );
    const access = await getProducerAccess();
    const result = await requireProducer();
    spy.mockRestore();
    expect(access).toEqual({ ok: false, reason: 'signed_out' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(401);
  });
});

describe('/api/producer/access', () => {
  test('reports the signed-in producer state with a private no-store header', async () => {
    const spy = sessionAs('user_producer');
    const res = await getAccess();
    spy.mockRestore();
    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
    expect(await res.json()).toEqual({
      allowlistConfigured: true,
      isProducer: true,
      signedIn: true,
      userId: 'user_producer',
    });
  });

  test('reports a signed-in member and an unconfigured allowlist', async () => {
    delete process.env.PRODUCER_CLERK_USER_IDS;
    const spy = sessionAs('user_member');
    const res = await getAccess();
    spy.mockRestore();
    expect(await res.json()).toEqual({
      allowlistConfigured: false,
      isProducer: false,
      signedIn: true,
      userId: 'user_member',
    });
  });

  test('signed out has no user id and does not error', async () => {
    const spy = sessionAs(null);
    const res = await getAccess();
    spy.mockRestore();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      isProducer: false,
      signedIn: false,
      userId: null,
    });
  });
});
