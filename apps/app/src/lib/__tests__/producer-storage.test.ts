import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
  createWritableStorageError,
  getProducerStorageBackend,
  StorageWriteError,
} from '@/lib/producer-storage';
import { redisKey, redisKeyPrefix } from '@/lib/redis-storage';

const ENV_KEYS = [
  'KV_REST_API_TOKEN',
  'KV_REST_API_URL',
  'PRODUCER_STORAGE',
  'VERCEL',
  'VERCEL_ENV',
] as const;

let previous: Array<readonly [string, string | undefined]> = [];

function setEnv(values: Partial<Record<(typeof ENV_KEYS)[number], string>>) {
  for (const key of ENV_KEYS) delete process.env[key];
  for (const [key, value] of Object.entries(values)) {
    process.env[key] = value;
  }
}

beforeEach(() => {
  previous = ENV_KEYS.map((key) => [key, process.env[key]] as const);
});

afterEach(() => {
  for (const [key, value] of previous) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

const KV = {
  KV_REST_API_TOKEN: 'test-only',
  KV_REST_API_URL: 'https://x.test',
};

describe('getProducerStorageBackend', () => {
  test('on Vercel it is redis only when both KV variables are set', () => {
    setEnv({ VERCEL: '1', ...KV });
    expect(getProducerStorageBackend()).toBe('redis');

    setEnv({ VERCEL: '1' });
    expect(getProducerStorageBackend()).toBe('read-only');

    setEnv({ KV_REST_API_URL: 'https://x.test', VERCEL: '1' });
    expect(getProducerStorageBackend()).toBe('read-only');

    setEnv({ KV_REST_API_TOKEN: 'test-only', VERCEL: '1' });
    expect(getProducerStorageBackend()).toBe('read-only');
  });

  test('on Vercel PRODUCER_STORAGE never overrides the integration', () => {
    setEnv({ PRODUCER_STORAGE: 'filesystem', VERCEL: '1', ...KV });
    expect(getProducerStorageBackend()).toBe('redis');
  });

  test('off Vercel it is the filesystem unless PRODUCER_STORAGE=redis', () => {
    setEnv({});
    expect(getProducerStorageBackend()).toBe('filesystem');

    setEnv({ ...KV });
    expect(getProducerStorageBackend()).toBe('filesystem');

    setEnv({ PRODUCER_STORAGE: 'redis', ...KV });
    expect(getProducerStorageBackend()).toBe('redis');

    setEnv({ PRODUCER_STORAGE: 'redis' });
    expect(getProducerStorageBackend()).toBe('read-only');
  });
});

describe('redis key namespace', () => {
  test('prefixes keys with the Vercel environment, local by default', () => {
    setEnv({ VERCEL_ENV: 'production' });
    expect(redisKey('distribution', '2026-09-29')).toBe(
      'sss:production:v1:distribution:2026-09-29',
    );

    setEnv({});
    expect(redisKey('leads')).toBe('sss:local:v1:leads');
    expect(redisKeyPrefix('preview')).toBe('sss:preview:v1:');
  });

  test('rejects key parts and namespaces that could escape the prefix', () => {
    expect(() => redisKey('drawing', '2026-09-29', 'a:b')).toThrow();
    expect(() => redisKey('drawing', '../x')).toThrow();
    expect(() => redisKey('')).toThrow();
    expect(() => redisKeyPrefix('prod*')).toThrow();
  });
});

describe('createWritableStorageError', () => {
  test('is a StorageWriteError that names the Upstash variables', () => {
    const error = createWritableStorageError('lead');
    expect(error).toBeInstanceOf(StorageWriteError);
    expect(error.message).toContain('KV_REST_API_URL');
    expect(error.message).toContain('lead');
  });
});
