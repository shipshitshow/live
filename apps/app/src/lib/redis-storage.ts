import { kv } from '@vercel/kv';
import { logError } from '@/lib/logger';
import { StorageWriteError } from '@/lib/producer-storage';

/**
 * Thin JSON helpers over the Upstash Redis attached to the project. Tokens and
 * `yt-cache:*` keep using `kv` directly; everything here lives under the
 * versioned `sss:{env}:v1:` prefix so an export can enumerate it.
 *
 * Non-strict reads log and return null/empty, so a public page never fails on a
 * Redis outage. Strict reads and every write throw `StorageWriteError`, so a
 * read-modify-write can never overwrite stored data with defaults.
 */

export interface RedisLike {
  get<T>(key: string): Promise<T | null>;
  hget<T>(key: string, field: string): Promise<T | null>;
  hgetall<T>(key: string): Promise<Record<string, T> | null>;
  hset(key: string, fields: Record<string, unknown>): Promise<unknown>;
  mget<T extends unknown[]>(...keys: string[]): Promise<T>;
  sadd(key: string, ...members: string[]): Promise<unknown>;
  set(key: string, value: unknown): Promise<unknown>;
  smembers(key: string): Promise<string[]>;
}

export interface ReadOptions {
  strict?: boolean;
}

const KEY_PART_PATTERN = /^[\w.-]+$/;

let clientOverride: RedisLike | null = null;

/** Tests inject an in-memory client; pass null to restore `kv`. */
export function setRedisClientForTests(client: RedisLike | null): void {
  clientOverride = client;
}

function getClient(): RedisLike {
  return clientOverride ?? (kv as unknown as RedisLike);
}

export function redisKeyPrefix(
  namespace: string = process.env.VERCEL_ENV ?? 'local',
): string {
  if (!KEY_PART_PATTERN.test(namespace)) {
    throw new Error(`Invalid Redis namespace: ${namespace}`);
  }
  return `sss:${namespace}:v1:`;
}

export function redisKey(...parts: string[]): string {
  for (const part of parts) {
    if (!KEY_PART_PATTERN.test(part)) {
      throw new Error(`Invalid Redis key part: ${part}`);
    }
  }
  return `${redisKeyPrefix()}${parts.join(':')}`;
}

function failRead(key: string, error: unknown, strict: boolean): void {
  if (strict) {
    throw new StorageWriteError(`Redis read failed for ${key}`, {
      cause: error,
    });
  }
  logError('storage.redis_read_failed', error, { key });
}

async function write(key: string, run: () => Promise<unknown>): Promise<void> {
  try {
    await run();
  } catch (error) {
    throw new StorageWriteError(`Redis write failed for ${key}`, {
      cause: error,
    });
  }
}

export async function readRedisJson<T>(
  key: string,
  { strict = false }: ReadOptions = {},
): Promise<T | null> {
  try {
    return (await getClient().get<T>(key)) ?? null;
  } catch (error) {
    failRead(key, error, strict);
    return null;
  }
}

/** One MGET for many keys; the result lines up with `keys`. */
export async function readRedisJsonMany<T>(
  keys: string[],
  { strict = false }: ReadOptions = {},
): Promise<Array<T | null>> {
  if (keys.length === 0) return [];

  try {
    const values = await getClient().mget<Array<T | null>>(...keys);
    return keys.map((_key, index) => values[index] ?? null);
  } catch (error) {
    failRead(keys.join(','), error, strict);
    return keys.map(() => null);
  }
}

export async function writeRedisJson(
  key: string,
  value: unknown,
): Promise<void> {
  await write(key, () => getClient().set(key, value));
}

export async function readRedisHash<T>(
  key: string,
  { strict = false }: ReadOptions = {},
): Promise<Record<string, T>> {
  try {
    return (await getClient().hgetall<T>(key)) ?? {};
  } catch (error) {
    failRead(key, error, strict);
    return {};
  }
}

export async function readRedisHashField<T>(
  key: string,
  field: string,
  { strict = false }: ReadOptions = {},
): Promise<T | null> {
  try {
    return (await getClient().hget<T>(key, field)) ?? null;
  } catch (error) {
    failRead(key, error, strict);
    return null;
  }
}

export async function writeRedisHashField(
  key: string,
  field: string,
  value: unknown,
): Promise<void> {
  await write(key, () => getClient().hset(key, { [field]: value }));
}

export async function addRedisSetMember(
  key: string,
  member: string,
): Promise<void> {
  await write(key, () => getClient().sadd(key, member));
}

export async function readRedisSetMembers(
  key: string,
  { strict = false }: ReadOptions = {},
): Promise<string[]> {
  try {
    return ((await getClient().smembers(key)) ?? []).map(String);
  } catch (error) {
    failRead(key, error, strict);
    return [];
  }
}
