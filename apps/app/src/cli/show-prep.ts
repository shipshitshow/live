import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  parseShowPrep,
  validateEpisodeDate,
  validatePrepId,
} from '../lib/show-prep';

const HELP = `Local show preparation (no scheduling or publishing)
  bun run show:prep context --store local|blob --date YYYY-MM-DD
  bun run show:prep get --store local|blob --id draft-id
  bun run show:prep preview --store local|blob --file path/to/draft.json
  bun run show:prep save --store local|blob --file path/to/draft.json --if-revision new|REVISION

Paths are relative to the repository root when invoked with bun run show:prep.
Draft JSON may use rundownFile (relative to that JSON) instead of rundown text.
Local storage ignores Blob credentials. Blob requires the intended store token.
Save stores an episode draft; existing topic cards and platform broadcasts are unchanged.`;

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  if (!args.length || args.includes('--help')) {
    console.log(HELP);
    return;
  }
  const command = args.shift();
  if (!['context', 'get', 'preview', 'save'].includes(command ?? ''))
    throw new Error(HELP);
  const allowed =
    command === 'context'
      ? ['store', 'date']
      : command === 'get'
        ? ['store', 'id']
        : command === 'save'
          ? ['store', 'file', 'if-revision']
          : ['store', 'file'];
  const flags = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const name = args[i]?.slice(2);
    const value = args[i + 1];
    if (
      !args[i]?.startsWith('--') ||
      !name ||
      !allowed.includes(name) ||
      flags.has(name) ||
      !value ||
      value.startsWith('--')
    ) {
      throw new Error(
        'Use the documented flags, each once with a value. Run --help.',
      );
    }
    flags.set(name, value);
  }
  function required(name: string) {
    const value = flags.get(name);
    if (!value) throw new Error(`Missing --${name}. Run --help.`);
    return value;
  }
  const store = required('store');
  if (store !== 'local' && store !== 'blob')
    throw new Error('--store must be local or blob.');
  if (store === 'local') {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.BLOB_STORE_ID;
    delete process.env.VERCEL_OIDC_TOKEN;
  } else if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      'Blob requires BLOB_READ_WRITE_TOKEN for the intended store. No local fallback was used.',
    );
  }
  const repoRoot = path.resolve(import.meta.dir, '../../../..');
  process.chdir(path.join(repoRoot, 'apps/app'));
  const { previewShowPrep, readShowPrep, saveShowPrep } = await import(
    '../lib/show-prep-store'
  );
  let result: unknown;
  if (command === 'context') {
    const date = validateEpisodeDate(required('date'));
    const { getTopicsForDate } = await import('../lib/livestreams-store');
    result = { date, store, topics: await getTopicsForDate(date, true) };
  } else if (command === 'get') {
    const id = validatePrepId(required('id'));
    const snapshot = await readShowPrep(store, id);
    if (!snapshot) throw new Error(`Draft ${id} does not exist in ${store}.`);
    result = { store, ...snapshot };
  } else {
    const inputPath = path.resolve(repoRoot, required('file'));
    const input: unknown = JSON.parse(await readFile(inputPath, 'utf8'));
    if (!input || typeof input !== 'object' || Array.isArray(input))
      throw new Error('Expected a draft JSON object.');
    const payload = input as Record<string, unknown>;
    if ('rundownFile' in payload) {
      if ('rundown' in payload || typeof payload.rundownFile !== 'string')
        throw new Error('Use either rundownFile or rundown text.');
      payload.rundown = await readFile(
        path.resolve(path.dirname(inputPath), payload.rundownFile),
        'utf8',
      );
      delete payload.rundownFile;
    }
    const draft = parseShowPrep(payload);
    result =
      command === 'preview'
        ? await previewShowPrep(store, draft)
        : await saveShowPrep(store, draft, required('if-revision'));
  }
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error && error.message.startsWith('Blob')
      ? 'Blob operation failed. Check store access, retry, and preview again before saving.'
      : error instanceof Error
        ? error.message
        : 'Show preparation failed.',
  );
  process.exitCode = 1;
});
