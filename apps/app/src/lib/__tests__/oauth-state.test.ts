import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
  createOAuthState,
  sanitizeNextPath,
  verifyOAuthState,
} from '../youtube/oauth-state';

let savedSecret: string | undefined;
beforeEach(() => {
  savedSecret = process.env.OAUTH_STATE_SECRET;
  process.env.OAUTH_STATE_SECRET = 'test-only-signing-secret';
});
afterEach(() => {
  if (savedSecret === undefined) delete process.env.OAUTH_STATE_SECRET;
  else process.env.OAUTH_STATE_SECRET = savedSecret;
});

describe('OAuth return paths', () => {
  test('preserves relative paths and query strings', () => {
    expect(sanitizeNextPath('/studio?tab=show', '/analytics')).toBe(
      '/studio?tab=show',
    );
    expect(sanitizeNextPath('/', '/analytics')).toBe('/');
  });
  test('rejects cross-origin paths and URL-parser normalization attacks', () => {
    for (const raw of [
      undefined,
      null,
      '',
      'https://evil.test',
      '//evil.test',
      '/\\evil.test',
      '/\n/evil.test',
      '/\t/evil.test',
      'studio',
    ]) {
      expect(sanitizeNextPath(raw, '/analytics')).toBe('/analytics');
    }
  });
});

describe('signed OAuth state', () => {
  test('requires the signature and initiating browser nonce', () => {
    const { state, nonce } = createOAuthState({
      channel: 'instagram',
      next: '/studio',
    });
    expect(verifyOAuthState(state, nonce)).toEqual({
      channel: 'instagram',
      next: '/studio',
    });
    expect(verifyOAuthState(state, 'another-browser')).toBeNull();
    expect(verifyOAuthState(state, undefined)).toBeNull();
    expect(verifyOAuthState(`${state}.extra`, nonce)).toBeNull();
    const [payload, signature] = state.split('.');
    const changed = JSON.parse(
      Buffer.from(payload ?? '', 'base64url').toString(),
    );
    changed.channel = 'tiktok';
    const tampered = Buffer.from(JSON.stringify(changed)).toString('base64url');
    expect(verifyOAuthState(`${tampered}.${signature}`, nonce)).toBeNull();
  });
});
