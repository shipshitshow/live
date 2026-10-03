import { NextResponse } from 'next/server';
import { getProducerStorageBackend } from '@/lib/producer-storage';
import {
  readOnlyStorageMessage,
  STORAGE_UNAVAILABLE_CODE,
  STORAGE_WRITE_FAILED_CODE,
  type StorageUnavailableResponse,
  type StorageWriteFailedResponse,
} from '@/lib/storage-capability';

const STORAGE_HINT =
  'Writable storage needs the Upstash Redis integration (KV_REST_API_URL and KV_REST_API_TOKEN) on this deployment.';

/** One answer for every producer form and write route on this deployment. */
export function isStorageWritable(): boolean {
  return getProducerStorageBackend() !== 'read-only';
}

/**
 * Write routes return this before doing any work when storage is read-only.
 * The stores keep their own guards, so a write can never slip through.
 */
export function storageUnavailableResponse(
  subject: string,
): NextResponse<StorageUnavailableResponse> {
  return NextResponse.json(
    {
      code: STORAGE_UNAVAILABLE_CODE,
      error: readOnlyStorageMessage(subject),
      hint: STORAGE_HINT,
    },
    { status: 503 },
  );
}

/**
 * Write routes return this when storage is configured but the read or write did
 * not complete (Redis outage, exhausted free-tier quota). Nothing was saved and
 * no stored data was overwritten.
 */
export function storageWriteFailedResponse(
  subject: string,
): NextResponse<StorageWriteFailedResponse> {
  return NextResponse.json(
    {
      code: STORAGE_WRITE_FAILED_CODE,
      error: `Could not save ${subject}: the storage backend did not accept the change, so nothing was saved.`,
      hint: STORAGE_HINT,
    },
    { status: 503 },
  );
}
