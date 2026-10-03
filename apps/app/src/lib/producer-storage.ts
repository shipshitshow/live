/**
 * Where producer-owned data (topic overlays, drawings, distribution, LinkedIn,
 * X posts, leads) is written (issue #73).
 *
 * - `redis`: the Upstash Redis attached to the Vercel project. Seeds and
 *   transcripts stay in the repo; Redis holds everything a producer edits.
 * - `filesystem`: local development writes next to the repo data.
 * - `read-only`: a deployment without Redis. Reads still serve the repo seeds,
 *   writes are refused up front.
 */

export type ProducerStorageBackend = 'redis' | 'filesystem' | 'read-only';

function isRedisConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export function getProducerStorageBackend(): ProducerStorageBackend {
  if (process.env.VERCEL) {
    return isRedisConfigured() ? 'redis' : 'read-only';
  }

  if (process.env.PRODUCER_STORAGE === 'redis') {
    return isRedisConfigured() ? 'redis' : 'read-only';
  }

  return 'filesystem';
}

/** A write (or a read a write depends on) the storage backend did not complete. */
export class StorageWriteError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'StorageWriteError';
  }
}

export function createWritableStorageError(label = 'livestream'): Error {
  return new StorageWriteError(
    `Writable ${label} storage requires the Upstash Redis integration (KV_REST_API_URL and KV_REST_API_TOKEN) on Vercel`,
  );
}
