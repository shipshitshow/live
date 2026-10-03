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

const ENV_KEYS = ['OPENROUTER_API_KEY', 'OPENROUTER_MODEL'] as const;
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
      missing: ['OPENROUTER_API_KEY'],
      model: 'google/gemini-3.5-flash-lite',
    });
  });

  test('reflects the configured OpenRouter model', () => {
    process.env.OPENROUTER_API_KEY = 'sk-or-test';
    process.env.OPENROUTER_MODEL = 'anthropic/claude-haiku-4.5';
    expect(getCommentDraftCapability()).toEqual({
      available: true,
      missing: [],
      model: 'anthropic/claude-haiku-4.5',
    });
  });
});

describe('generateCommentReplyDrafts errors', () => {
  test('missing key is a non-retryable configuration error', async () => {
    const error = await captureError();
    expect(error.code).toBe('draft_not_configured');
    expect(error.status).toBe(503);
    expect(error.retryable).toBe(false);
    expect(error.hint).toContain('OPENROUTER_API_KEY');
  });

  test('provider auth failure never echoes the key or raw body', async () => {
    process.env.OPENROUTER_API_KEY = FIXTURE_CREDENTIAL;
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
    process.env.OPENROUTER_API_KEY = 'sk-test';
    mockProvider(429, { error: { message: 'Rate limit reached' } });
    const error = await captureError();
    expect(error.code).toBe('draft_provider_rate_limited');
    expect(error.status).toBe(429);
    expect(error.retryable).toBe(true);
  });

  test('a rejected model points at OPENROUTER_MODEL with a sanitized message', async () => {
    process.env.OPENROUTER_API_KEY = 'sk-test';
    process.env.OPENROUTER_MODEL = 'retired-model';
    mockProvider(404, {
      error: { message: 'The model `retired-model` does not exist' },
    });
    const error = await captureError();
    expect(error.code).toBe('draft_provider_rejected');
    expect(error.hint).toContain('OPENROUTER_MODEL');
    expect(error.hint).toContain('does not exist');
  });

  test('provider outages are retryable', async () => {
    process.env.OPENROUTER_API_KEY = 'sk-test';
    mockProvider(503, '<html>upstream down</html>');
    const error = await captureError();
    expect(error.code).toBe('draft_provider_unavailable');
    expect(error.retryable).toBe(true);
    expect(error.message).not.toContain('<html>');
  });

  test('network failures are retryable', async () => {
    process.env.OPENROUTER_API_KEY = 'sk-test';
    globalThis.fetch = (async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch;
    const error = await captureError();
    expect(error.code).toBe('draft_provider_unavailable');
    expect(error.retryable).toBe(true);
  });

  test('returns drafts from a valid provider response', async () => {
    process.env.OPENROUTER_API_KEY = 'sk-test';
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

  test('sends the request to OpenRouter with the configured model', async () => {
    process.env.OPENROUTER_API_KEY = 'sk-test';
    process.env.OPENROUTER_MODEL = 'anthropic/claude-haiku-4.5';
    let requestUrl = '';
    let requestModel: unknown;
    globalThis.fetch = (async (url: string, init: RequestInit) => {
      requestUrl = url;
      requestModel = JSON.parse(String(init.body)).model;
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: '{"drafts":["One"]}' } }],
        }),
      );
    }) as unknown as typeof fetch;
    await generateCommentReplyDrafts(INPUT);
    expect(requestUrl).toBe('https://openrouter.ai/api/v1/chat/completions');
    expect(requestModel).toBe('anthropic/claude-haiku-4.5');
  });
});
