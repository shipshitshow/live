import { kv } from '@vercel/kv';
import { redisKeyPrefix } from '../lib/redis-storage';

const USAGE = `Read-only export of producer data stored in Upstash Redis (issue #73).

Usage:
  bun run storage:export --namespace production|preview|local

Prints one JSON document to stdout. Requires KV_REST_API_URL and
KV_REST_API_TOKEN in the environment. Nothing is written or deleted.`;

const SCAN_COUNT = 200;

function parseNamespace(args: string[]): string {
  const index = args.indexOf('--namespace');
  const namespace = index === -1 ? undefined : args[index + 1];
  if (!namespace || namespace.startsWith('--')) {
    throw new Error(`Missing --namespace.\n\n${USAGE}`);
  }
  return namespace;
}

async function scanKeys(match: string): Promise<string[]> {
  const keys: string[] = [];
  let cursor = '0';

  do {
    const [next, batch] = await kv.scan(cursor, {
      count: SCAN_COUNT,
      match,
    });
    keys.push(...batch);
    cursor = String(next);
  } while (cursor !== '0');

  return Array.from(new Set(keys)).sort();
}

async function readValue(key: string): Promise<unknown> {
  const type = await kv.type(key);
  if (type === 'hash') return kv.hgetall(key);
  if (type === 'set') return kv.smembers(key);
  return kv.get(key);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log(USAGE);
    return;
  }

  const namespace = parseNamespace(args);
  const prefix = redisKeyPrefix(namespace);
  const keys = await scanKeys(`${prefix}*`);

  const entries: Record<string, unknown> = {};
  for (const key of keys) {
    entries[key] = await readValue(key);
  }

  console.log(
    JSON.stringify(
      {
        entries,
        exportedAt: new Date().toISOString(),
        keyCount: keys.length,
        namespace,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Export failed.');
  process.exitCode = 1;
});
