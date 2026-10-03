import type { ErrorResponse } from '@shipshitshow/types';

/**
 * Client-safe half of the storage write capability (issue #78). Producer forms
 * and write routes share one signal: a deployment without writable storage
 * disables every save up front, and a write that still reaches the server is
 * refused with this code instead of a generic failure.
 */

export const STORAGE_UNAVAILABLE_CODE = 'storage_unavailable';
export const STORAGE_WRITE_FAILED_CODE = 'storage_write_failed';

export interface StorageUnavailableResponse extends ErrorResponse {
  code: typeof STORAGE_UNAVAILABLE_CODE;
}

export interface StorageWriteFailedResponse extends ErrorResponse {
  code: typeof STORAGE_WRITE_FAILED_CODE;
}

export function readOnlyStorageMessage(subject: string): string {
  return `This deployment has no writable storage, so ${subject} cannot be saved.`;
}

export function isStorageUnavailableResponse(
  value: unknown,
): value is StorageUnavailableResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ErrorResponse).error === 'string' &&
    (value as ErrorResponse).code === STORAGE_UNAVAILABLE_CODE
  );
}
