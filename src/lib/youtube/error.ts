import type { ErrorResponse } from '@/lib/api-types';

export function normalizeYouTubeError(
  status: number,
  body: string,
): ErrorResponse {
  let message = `YouTube API request failed (${status})`;
  let reason = '';

  try {
    const parsed = JSON.parse(body) as {
      error?: {
        errors?: Array<{ message?: string; reason?: string }>;
        message?: string;
      };
    };
    message =
      parsed.error?.errors?.[0]?.message ?? parsed.error?.message ?? message;
    reason = parsed.error?.errors?.[0]?.reason ?? '';
  } catch {
    if (body.trim()) {
      message = body.trim();
    }
  }

  if (status === 403 && reason === 'quotaExceeded') {
    return {
      code: 'youtube_quota_exceeded',
      error: 'YouTube Data API quota exceeded for today.',
      hint: 'Google resets quota daily. Retry later or use a cached/manual review path until the quota resets.',
    };
  }

  if (status === 403) {
    return {
      code: 'youtube_forbidden',
      error: 'YouTube rejected the request.',
      hint: message,
    };
  }

  if (status === 401) {
    return {
      code: 'youtube_unauthorized',
      error: 'YouTube authorization failed.',
      hint: 'Reconnect YouTube and try again.',
    };
  }

  return {
    code: 'youtube_api_error',
    error: message,
  };
}
