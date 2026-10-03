import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import * as blob from '@vercel/blob';
import { getTopicsForDate } from '../livestreams-store';
import { parseShowPrep, type ShowPrep } from '../show-prep';
import {
  previewShowPrep,
  readShowPrep,
  saveShowPrep,
} from '../show-prep-store';
import { installFakeRedis } from './fake-redis';

const draft: ShowPrep = {
  description: 'Compare completed work and the checks behind it.',
  destinations: [],
  id: 'next-model-workflow',
  restream: null,
  rundown: '## Sources — Proof first\nOpen the actual result.',
  scheduledFor: null,
  sourceEpisodeDate: '2026-09-29',
  timezone: 'Europe/Malta',
  title: 'Which model actually shipped the work?',
};
let dir: string;
let previousDir: string | undefined;
let previousToken: string | undefined;

beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), 'show-prep-'));
  previousDir = process.env.SHOW_PREP_DIR;
  previousToken = process.env.BLOB_READ_WRITE_TOKEN;
  process.env.SHOW_PREP_DIR = dir;
  delete process.env.BLOB_READ_WRITE_TOKEN;
});
afterEach(async () => {
  if (previousDir === undefined) delete process.env.SHOW_PREP_DIR;
  else process.env.SHOW_PREP_DIR = previousDir;
  if (previousToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
  else process.env.BLOB_READ_WRITE_TOKEN = previousToken;
  await rm(dir, { force: true, recursive: true });
});

describe('local draft persistence', () => {
  test('preview is read-only, save round-trips the draft, and retry is idempotent', async () => {
    expect((await previewShowPrep('local', draft)).revision).toBe('new');
    expect(await readShowPrep('local', draft.id)).toBeNull();
    const first = await saveShowPrep('local', draft, 'new');
    expect((await readShowPrep('local', draft.id))?.draft).toEqual(draft);
    expect(await saveShowPrep('local', draft, 'new')).toEqual({
      ...first,
      changed: false,
    });
  });
  test('stale revisions cannot overwrite a newer draft', async () => {
    const first = await saveShowPrep('local', draft, 'new');
    const newer = { ...draft, title: 'A checked result' };
    await saveShowPrep('local', newer, first.revision);
    await expect(
      saveShowPrep(
        'local',
        { ...draft, title: 'Stale result' },
        first.revision,
      ),
    ).rejects.toThrow('changed since preview');
    expect((await readShowPrep('local', draft.id))?.draft.title).toBe(
      newer.title,
    );
  });
  test('an active lock stops a competing save without removing the lock', async () => {
    const lockPath = path.join(dir, `${draft.id}.json.lock`);
    await writeFile(lockPath, 'other writer', { flag: 'wx' });
    await expect(saveShowPrep('local', draft, 'new')).rejects.toThrow('locked');
    expect(await readFile(lockPath, 'utf8')).toBe('other writer');
  });
  test('malformed stored content fails instead of being treated as a new draft', async () => {
    await writeFile(path.join(dir, `${draft.id}.json`), '{broken');
    await expect(saveShowPrep('local', draft, 'new')).rejects.toThrow();
  });
  test('Restream identity and links survive later preparation edits', async () => {
    const scheduled = {
      ...draft,
      restream: {
        eventId: 'existing-event',
        links: ['https://youtube.com/watch?v=test'],
      },
    };
    const first = await saveShowPrep('local', scheduled, 'new');
    await saveShowPrep(
      'local',
      { ...scheduled, description: 'Updated description' },
      first.revision,
    );
    expect((await readShowPrep('local', draft.id))?.draft.restream).toEqual(
      scheduled.restream,
    );
    await expect(saveShowPrep('local', draft, first.revision)).rejects.toThrow(
      'Preserve the existing Restream',
    );
  });
});

test('draft validation rejects unsafe paths, unknown fields and ambiguous schedules', () => {
  for (const update of [
    { id: '../escape' },
    { sourceEpisodeDate: '2026-02-30' },
    { timezone: 'Wrong/Zone' },
    { scheduledFor: '2026-10-07T14:00:00' },
    { destinations: ['a', 'a'] },
    { restream: { eventId: 'test', links: ['http://example.com'] } },
    { unexpected: true },
  ])
    expect(() => parseShowPrep({ ...draft, ...update })).toThrow();
});

test('Blob storage never falls back to a local draft when credentials are missing', async () => {
  await saveShowPrep('local', draft, 'new');
  await expect(readShowPrep('blob', draft.id)).rejects.toThrow(
    'No local fallback',
  );
});

test('strict topic context reports backend failures instead of returning a misleading empty episode', async () => {
  const harness = installFakeRedis();
  try {
    harness.redis.failNext('get');
    await expect(getTopicsForDate('2099-01-01', true)).rejects.toThrow(
      'Redis read failed',
    );

    harness.redis.failNext('smembers');
    expect(await getTopicsForDate('2099-01-01')).toEqual([]);
  } finally {
    harness.restore();
  }
});

test('new Blob drafts forbid overwrite and backend errors cannot become a local save', async () => {
  process.env.BLOB_READ_WRITE_TOKEN = 'test-only';
  const getSpy = spyOn(blob, 'get').mockResolvedValue(null);
  const putSpy = spyOn(blob, 'put').mockResolvedValue({
    contentDisposition: '',
    contentType: 'application/json',
    downloadUrl: '',
    etag: 'created-etag',
    pathname: '',
    url: '',
  });
  try {
    await saveShowPrep('blob', draft, 'new');
    expect(putSpy.mock.calls[0]?.[2]).toMatchObject({
      addRandomSuffix: false,
      allowOverwrite: false,
    });
    getSpy.mockRejectedValue(new Error('backend unavailable'));
    await expect(saveShowPrep('blob', draft, 'new')).rejects.toThrow(
      'backend unavailable',
    );
    expect(await readShowPrep('local', draft.id)).toBeNull();
  } finally {
    getSpy.mockRestore();
    putSpy.mockRestore();
  }
});

test('Blob overwrite uses the previewed ETag as an atomic precondition', async () => {
  process.env.BLOB_READ_WRITE_TOKEN = 'test-only';
  const getSpy = spyOn(blob, 'get').mockImplementation(async () => ({
    blob: {
      cacheControl: '',
      contentDisposition: '',
      contentType: 'application/json',
      downloadUrl: '',
      etag: 'old-etag',
      pathname: '',
      size: 1,
      uploadedAt: new Date(),
      url: '',
    },
    headers: new Headers(),
    statusCode: 200,
    stream: new Response(JSON.stringify(draft)).body!,
  }));
  const putSpy = spyOn(blob, 'put').mockResolvedValue({
    contentDisposition: '',
    contentType: 'application/json',
    downloadUrl: '',
    etag: 'new-etag',
    pathname: '',
    url: '',
  });
  try {
    const result = await saveShowPrep(
      'blob',
      { ...draft, title: 'Updated title' },
      'old-etag',
    );
    expect(result.revision).toBe('new-etag');
    expect(putSpy.mock.calls[0]?.[2]).toMatchObject({
      access: 'private',
      allowOverwrite: true,
      ifMatch: 'old-etag',
    });
    await expect(
      saveShowPrep('blob', { ...draft, title: 'Stale title' }, 'stale-etag'),
    ).rejects.toThrow('changed since preview');
    expect(putSpy).toHaveBeenCalledTimes(1);
  } finally {
    getSpy.mockRestore();
    putSpy.mockRestore();
  }
});

test('CLI requires an explicit store and resolves repository paths from any cwd', async () => {
  const cli = path.resolve(import.meta.dir, '../../cli/show-prep.ts');
  const input = path.join(dir, 'draft.json');
  await writeFile(input, JSON.stringify(draft));
  async function run(args: string[]) {
    const child = Bun.spawn([process.execPath, cli, ...args], {
      cwd: dir,
      env: {
        ...process.env,
        BLOB_READ_WRITE_TOKEN: 'must-not-be-used-for-local',
      },
      stderr: 'pipe',
      stdout: 'pipe',
    });
    return {
      code: await child.exited,
      stderr: await new Response(child.stderr).text(),
      stdout: await new Response(child.stdout).text(),
    };
  }
  expect((await run(['preview', '--file', input])).code).toBe(1);
  const result = await run([
    'save',
    '--store',
    'local',
    '--file',
    input,
    '--if-revision',
    'new',
  ]);
  expect(result.code).toBe(0);
  expect(JSON.parse(result.stdout).draft).toEqual(draft);
  const context = await run([
    'context',
    '--store',
    'local',
    '--date',
    '2099-01-01',
  ]);
  expect(JSON.parse(context.stdout).topics).toEqual([]);
});
