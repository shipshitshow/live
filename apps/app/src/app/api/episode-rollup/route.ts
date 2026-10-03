import type {
  ErrorResponse,
  ReauthRequiredResponse,
} from '@shipshitshow/types';
import { NextResponse } from 'next/server';
import { buildEpisodeRollup } from '@/lib/episode-rollup';
import { logError, logEvent } from '@/lib/logger';
import { requireProducer } from '@/lib/producer-auth';
import { isYouTubeReauthError } from '@/lib/youtube/token';

export async function GET() {
  const producer = await requireProducer();
  if (!producer.ok) return producer.response;

  try {
    const rollup = await buildEpisodeRollup();
    logEvent('api.episode_rollup.list', {
      episodeCount: rollup.episodes.length,
      isYouTubeConnected: rollup.isYouTubeConnected,
    });

    return NextResponse.json(rollup, {
      headers: { 'Cache-Control': 'private, max-age=300' },
    });
  } catch (error) {
    if (isYouTubeReauthError(error)) {
      const response: ReauthRequiredResponse = {
        channelLabel: error.channelLabel ?? null,
        error: 'YouTube authentication expired. Reconnect YouTube to continue.',
        reauthRequired: true,
      };
      return NextResponse.json(response, { status: 401 });
    }

    logError('api.episode_rollup.failed', error);
    const response: ErrorResponse =
      error instanceof Error
        ? {
            code:
              'code' in error && typeof error.code === 'string'
                ? error.code
                : undefined,
            error: error.message,
            hint:
              'hint' in error && typeof error.hint === 'string'
                ? error.hint
                : undefined,
          }
        : { error: 'Failed to load episode rollup' };
    return NextResponse.json(response, { status: 503 });
  }
}
