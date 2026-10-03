import { clearTopicOverlayCache } from '@/lib/livestreams-store';
import {
  type RedisChainLike,
  type RedisLike,
  setRedisClientForTests,
} from '@/lib/redis-storage';

type Method =
  | 'exec'
  | 'get'
  | 'hget'
  | 'hgetall'
  | 'hset'
  | 'mget'
  | 'sadd'
  | 'set'
  | 'smembers';

/** What Upstash does on the wire: values round-trip through JSON. */
function roundTrip<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * In-memory stand-in for the Upstash client. Counts every command so tests can
 * assert how much a read costs, and `failNext(method)` makes the next call of
 * that method throw once.
 */
export class FakeRedis implements RedisLike {
  readonly strings = new Map<string, unknown>();
  readonly hashes = new Map<string, Map<string, unknown>>();
  readonly sets = new Map<string, Set<string>>();
  readonly commands: Method[] = [];
  private readonly failures = new Set<Method>();

  get commandCount(): number {
    return this.commands.length;
  }

  count(method: Method): number {
    return this.commands.filter((command) => command === method).length;
  }

  resetCommands(): void {
    this.commands.length = 0;
  }

  failNext(method: Method): void {
    this.failures.add(method);
  }

  private run<T>(method: Method, action: () => T): Promise<T> {
    this.commands.push(method);
    if (this.failures.delete(method)) {
      return Promise.reject(new Error(`fake redis ${method} failure`));
    }
    return Promise.resolve(action());
  }

  get<T>(key: string): Promise<T | null> {
    return this.run('get', () =>
      this.strings.has(key) ? roundTrip(this.strings.get(key) as T) : null,
    );
  }

  set(key: string, value: unknown): Promise<unknown> {
    return this.run('set', () => {
      this.strings.set(key, roundTrip(value));
      return 'OK';
    });
  }

  mget<T extends unknown[]>(...keys: string[]): Promise<T> {
    return this.run('mget', () => this.applyMget(keys) as T);
  }

  hget<T>(key: string, field: string): Promise<T | null> {
    return this.run('hget', () => {
      const hash = this.hashes.get(key);
      return hash?.has(field) ? roundTrip(hash.get(field) as T) : null;
    });
  }

  hgetall<T>(key: string): Promise<Record<string, T> | null> {
    return this.run('hgetall', () => this.applyHgetall<T>(key));
  }

  hset(key: string, fields: Record<string, unknown>): Promise<unknown> {
    return this.run('hset', () => this.applyHset(key, fields));
  }

  sadd(key: string, ...members: string[]): Promise<unknown> {
    return this.run('sadd', () => this.applySadd(key, members));
  }

  /** Commands queue locally; all apply on `exec()`, or none if it fails. */
  multi(): RedisChainLike {
    return this.chain();
  }

  pipeline(): RedisChainLike {
    return this.chain();
  }

  private chain(): RedisChainLike {
    const queued: Array<() => unknown> = [];
    const chain: RedisChainLike = {
      exec: () => this.run('exec', () => queued.map((apply) => apply())),
      hgetall: (key) => {
        queued.push(() => this.applyHgetall(key));
        return chain;
      },
      hset: (key, fields) => {
        queued.push(() => this.applyHset(key, fields));
        return chain;
      },
      mget: (...keys) => {
        queued.push(() => this.applyMget(keys));
        return chain;
      },
      sadd: (key, ...members) => {
        queued.push(() => this.applySadd(key, members));
        return chain;
      },
    };
    return chain;
  }

  private applyMget(keys: string[]): unknown[] {
    return keys.map((key) =>
      this.strings.has(key) ? roundTrip(this.strings.get(key)) : null,
    );
  }

  private applyHgetall<T>(key: string): Record<string, T> | null {
    const hash = this.hashes.get(key);
    if (!hash || hash.size === 0) return null;
    return roundTrip(Object.fromEntries(hash)) as Record<string, T>;
  }

  private applyHset(key: string, fields: Record<string, unknown>): number {
    const hash = this.hashes.get(key) ?? new Map<string, unknown>();
    for (const [field, value] of Object.entries(fields)) {
      hash.set(field, roundTrip(value));
    }
    this.hashes.set(key, hash);
    return Object.keys(fields).length;
  }

  private applySadd(key: string, members: string[]): number {
    const set = this.sets.get(key) ?? new Set<string>();
    for (const member of members) set.add(member);
    this.sets.set(key, set);
    return members.length;
  }

  smembers(key: string): Promise<string[]> {
    return this.run('smembers', () => Array.from(this.sets.get(key) ?? []));
  }
}

const ENV_KEYS = [
  'KV_REST_API_TOKEN',
  'KV_REST_API_URL',
  'PRODUCER_STORAGE',
  'VERCEL',
  'VERCEL_ENV',
] as const;

export interface FakeRedisHarness {
  redis: FakeRedis;
  restore: () => void;
}

/**
 * Point the app at a fresh fake as if running on Vercel with the Upstash
 * integration attached. Call `restore()` in afterEach.
 */
export function installFakeRedis(vercelEnv = 'test'): FakeRedisHarness {
  const previous = ENV_KEYS.map((key) => [key, process.env[key]] as const);
  process.env.VERCEL = '1';
  process.env.VERCEL_ENV = vercelEnv;
  process.env.KV_REST_API_URL = 'https://fake.upstash.test';
  process.env.KV_REST_API_TOKEN = 'test-only';
  delete process.env.PRODUCER_STORAGE;

  const redis = new FakeRedis();
  setRedisClientForTests(redis);
  clearTopicOverlayCache();

  return {
    redis,
    restore: () => {
      setRedisClientForTests(null);
      clearTopicOverlayCache();
      for (const [key, value] of previous) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    },
  };
}
