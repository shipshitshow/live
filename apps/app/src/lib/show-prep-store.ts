import { createHash, randomUUID } from 'node:crypto';
import {
  mkdir,
  open,
  readFile,
  rename,
  unlink,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { get, put } from '@vercel/blob';
import { parseShowPrep, type ShowPrep, validatePrepId } from './show-prep';

export type PrepStore = 'local' | 'blob';
export interface PrepSnapshot {
  draft: ShowPrep;
  revision: string;
}

function localPath(id: string): string {
  return path.join(
    process.env.SHOW_PREP_DIR || path.join(process.cwd(), 'data/show-prep'),
    `${validatePrepId(id)}.json`,
  );
}
function blobPath(id: string): string {
  return `livestream/show-prep/${validatePrepId(id)}.json`;
}
function revision(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}
function requireBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token)
    throw new Error(
      'Blob access needs BLOB_READ_WRITE_TOKEN for the intended store. No local fallback was used.',
    );
  return token;
}
function isMissing(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

export async function readShowPrep(
  store: PrepStore,
  id: string,
): Promise<PrepSnapshot | null> {
  if (store === 'blob') {
    const result = await get(blobPath(id), {
      access: 'private',
      token: requireBlobToken(),
      useCache: false,
    });
    if (!result) return null;
    if (result.statusCode !== 200)
      throw new Error(
        'Draft read did not return current content. Retry before saving.',
      );
    const draft = parseShowPrep(
      JSON.parse(await new Response(result.stream).text()),
    );
    if (draft.id !== id)
      throw new Error('Stored draft id does not match its path.');
    return { draft, revision: result.blob.etag };
  }
  try {
    const raw = await readFile(localPath(id), 'utf8');
    const draft = parseShowPrep(JSON.parse(raw));
    if (draft.id !== id)
      throw new Error('Stored draft id does not match its path.');
    return { draft, revision: revision(raw) };
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}

export async function previewShowPrep(store: PrepStore, draft: ShowPrep) {
  const current = await readShowPrep(store, draft.id);
  return {
    changedFields: (Object.keys(draft) as Array<keyof ShowPrep>).filter(
      (key) =>
        JSON.stringify(current?.draft[key]) !== JSON.stringify(draft[key]),
    ),
    draft,
    id: draft.id,
    revision: current?.revision ?? 'new',
    store,
  };
}

export async function saveShowPrep(
  store: PrepStore,
  value: unknown,
  expectedRevision: string,
) {
  const draft = parseShowPrep(value);
  const file = localPath(draft.id);
  let lock: Awaited<ReturnType<typeof open>> | undefined;
  if (store === 'local') {
    await mkdir(path.dirname(file), { recursive: true });
    try {
      lock = await open(`${file}.lock`, 'wx');
    } catch {
      throw new Error(
        'Draft is locked by another local save. Retry after it finishes; do not remove an active lock.',
      );
    }
  }
  try {
    const current = await readShowPrep(store, draft.id);
    if (
      current?.draft.restream &&
      draft.restream?.eventId !== current.draft.restream.eventId
    ) {
      throw new Error(
        'Preserve the existing Restream event reference. Load the saved draft before editing it.',
      );
    }
    if (current && JSON.stringify(current.draft) === JSON.stringify(draft)) {
      return { ...current, changed: false, store };
    }
    if (expectedRevision !== (current?.revision ?? 'new')) {
      throw new Error(
        'Draft changed since preview. Read and preview again, then pass its current revision.',
      );
    }
    const raw = `${JSON.stringify(draft, null, 2)}\n`;
    if (store === 'blob') {
      const result = await put(blobPath(draft.id), raw, {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: Boolean(current),
        contentType: 'application/json',
        ifMatch: current?.revision,
        token: requireBlobToken(),
      });
      return { changed: true, draft, revision: result.etag, store };
    }
    const temp = `${file}.${randomUUID()}.tmp`;
    try {
      await writeFile(temp, raw, { flag: 'wx' });
      await rename(temp, file);
    } finally {
      await unlink(temp).catch((error) => {
        if (!isMissing(error)) throw error;
      });
    }
    return { changed: true, draft, revision: revision(raw), store };
  } finally {
    if (lock) {
      await lock.close();
      await unlink(`${file}.lock`);
    }
  }
}
