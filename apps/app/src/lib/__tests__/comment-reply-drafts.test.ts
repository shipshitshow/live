import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
  CommentDraftError,
  generateCommentReplyDrafts,
  getCommentDraftCapability,
} from '@/lib/comment-reply-drafts';

const INPUT = {
  authorDisplayName: 'Viewer',
  channelLabel: 'main',
  commentText: 'How do you ship this fast?',
  videoTitle: 'pstack',
};

// Fake provider credential; assembled so secret scanners do not flag the fixture.
const FIXTURE_CREDENTIAL = ['sk', 'live', 'SECRET1234567890'].join('-');

const ENV_KEYS = ['OPENAI_API_KEY', 'OPENAI_BASE_URL', 'OPENAI_MODEL'] as const;
const realFetch = globalThis.fetch;
const savedEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  globalThis.fetch = realFetch;
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
});

function mockProvider(status: number, body: unknown) {
  globalThis.fetch = (async () =>
    new Response(typeof body === 'string' ? body : JSON.stringify(body), {
      status,
    })) as unknown as typeof fetch;
}

async function captureError(): Promise<CommentDraftError> {
  try {
    await generateCommentReplyDrafts(INPUT);
  } catch (error) {
    if (error instanceof CommentDraftError) return error;
    throw error;
  }
  throw new Error('Expected generation to fail');
}

describe('getCommentDraftCapability', () => {
  test('reports the missing key instead of an apparently working action', () => {
    expect(getCommentDraftCapability()).toEqual({
      available: false,
      missing: ['OPENAI_API_KEY'],
      model: 'gpt-4o-mini',
      provider: 'openai',
    });
  });

  test('reflects the configured OpenRouter provider and model', () => {
    process.env.OPENAI_API_KEY = 'sk-or-test';
    process.env.OPENAI_BASE_URL = 'https://openrouter.ai/api/v1/';
    process.env.OPENAI_MODEL = 'google/gemini-test';
    expect(getCommentDraftCapability()).toEqual({
      available: true,
      missing: [],
      model: 'google/gemini-test',
      provider: 'openrouter',
    });
  });
});

describe('generateCommentReplyDrafts errors', () => {
  test('missing key is a non-retryable configuration error', async () => {
    const error = await captureError();
    expect(error.code).toBe('draft_not_configured');
    expect(error.status).toBe(503);
    expect(error.retryable).toBe(false);
    expect(error.hint).toContain('OPENAI_API_KEY');
  });

  test('provider auth failure never echoes the key or raw body', async () => {
    process.env.OPENAI_API_KEY = FIXTURE_CREDENTIAL;
    mockProvider(401, {
      error: {
        message: `Incorrect API key provided: ${FIXTURE_CREDENTIAL}. Bearer ${FIXTURE_CREDENTIAL}`,
      },
    });
    const error = await captureError();
    expect(error.code).toBe('draft_provider_unauthorized');
    expect(error.status).toBe(502);
    const exposed = `${error.message} ${error.hint ?? ''}`;
    expect(exposed).not.toContain('SECRET1234567890');
    expect(exposed).toContain('401');
  });

  test('rate limits are retryable and keep the provider status', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockProvider(429, { error: { message: 'Rate limit reached' } });
    const error = await captureError();
    expect(error.code).toBe('draft_provider_rate_limited');
    expect(error.status).toBe(429);
    expect(error.retryable).toBe(true);
  });

  test('a rejected model points at OPENAI_MODEL with a sanitized message', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    process.env.OPENAI_MODEL = 'retired-model';
    mockProvider(404, {
      error: { message: 'The model `retired-model` does not exist' },
    });
    const error = await captureError();
    expect(error.code).toBe('draft_provider_rejected');
    expect(error.hint).toContain('OPENAI_MODEL');
    expect(error.hint).toContain('does not exist');
  });

  test('provider outages are retryable', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockProvider(503, '<html>upstream down</html>');
    const error = await captureError();
    expect(error.code).toBe('draft_provider_unavailable');
    expect(error.retryable).toBe(true);
    expect(error.message).not.toContain('<html>');
  });

  test('network failures are retryable', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    globalThis.fetch = (async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch;
    const error = await captureError();
    expect(error.code).toBe('draft_provider_unavailable');
    expect(error.retryable).toBe(true);
  });

  test('returns drafts from a valid provider response', async () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    mockProvider(200, {
      choices: [
        { message: { content: '{"drafts":["One","Two","Three","Four"]}' } },
      ],
    });
    expect(await generateCommentReplyDrafts(INPUT)).toEqual([
      'One',
      'Two',
      'Three',
    ]);
  });
});
