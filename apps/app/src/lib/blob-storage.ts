import { get, list, put } from '@vercel/blob';

export function isBlobPersistenceEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function isReadOnlyVercelRuntime(): boolean {
  return Boolean(process.env.VERCEL) && !isBlobPersistenceEnabled();
}

export function createWritableStorageError(label: string): Error {
  return new Error(
    `Writable ${label} storage requires BLOB_READ_WRITE_TOKEN on Vercel`,
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
