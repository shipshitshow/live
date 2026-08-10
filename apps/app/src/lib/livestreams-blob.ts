import { get, list, put } from '@vercel/blob';

/**
 * Shared Vercel Blob helpers for livestream-scoped storage. Locally the stores
 * fall back to the filesystem; on Vercel they need BLOB_READ_WRITE_TOKEN
 * because the runtime filesystem is read-only.
 */

export function isBlobPersistenceEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isReadOnlyVercelRuntime(): boolean {
  return Boolean(process.env.VERCEL) && !isBlobPersistenceEnabled();
}

export function createWritableStorageError(): Error {
  return new Error(
    'Writable livestream storage requires BLOB_READ_WRITE_TOKEN on Vercel',
  );
}

export async function readBlobJson<T>(
  pathname: string,
): Promise<{ data: T; updatedAt: string } | null> {
  if (!isBlobPersistenceEnabled()) return null;

  try {
    const result = await get(pathname, { access: 'private', useCache: false });
    if (!result || result.statusCode !== 200) return null;

    const text = await new Response(result.stream).text();
    return {
      data: JSON.parse(text) as T,
      updatedAt: result.blob.uploadedAt.toISOString(),
    };
  } catch {
    return null;
  }
}

export async function putBlobJson(
  pathname: string,
  data: unknown,
): Promise<void> {
  await put(pathname, JSON.stringify(data), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

export async function listAllBlobs(
  prefix: string,
): Promise<Array<{ pathname: string }>> {
  if (!isBlobPersistenceEnabled()) return [];

  try {
    const blobs: Array<{ pathname: string }> = [];
    let cursor: string | undefined;

    do {
      const result = await list({ cursor, prefix });
      blobs.push(...result.blobs.map((blob) => ({ pathname: blob.pathname })));
      cursor = result.hasMore ? result.cursor : undefined;
    } while (cursor);

    return blobs;
  } catch {
    return [];
  }
}

export async function listBlobDates(prefix: string): Promise<string[]> {
  if (!isBlobPersistenceEnabled()) return [];

  try {
    const folders = new Set<string>();
    let cursor: string | undefined;

    do {
      const result = await list({
        cursor,
        mode: 'folded',
        prefix: `${prefix}/`,
      });
      for (const folder of result.folders) {
        const parts = folder.split('/').filter(Boolean);
        const date = parts.at(-1);
        if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
          folders.add(date);
        }
      }
      cursor = result.hasMore ? result.cursor : undefined;
    } while (cursor);

    return Array.from(folders);
  } catch {
    return [];
  }
}
