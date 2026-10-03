import { NextResponse } from 'next/server';
import { isReadOnlyVercelRuntime } from '@/lib/blob-storage';
import {
  readOnlyStorageMessage,
  STORAGE_UNAVAILABLE_CODE,
  type StorageUnavailableResponse,
} from '@/lib/storage-capability';

/** One answer for every producer form and write route on this deployment. */
export function isStorageWritable(): boolean {
  return !isReadOnlyVercelRuntime();
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
      hint: 'Writable storage needs BLOB_READ_WRITE_TOKEN on this deployment.',
    },
    { status: 503 },
  );
}
