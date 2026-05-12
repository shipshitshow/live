import { NextResponse } from 'next/server';
import { getConfiguredChannelMeta, saveRefreshToken } from '@/lib/youtube/token';

export async function POST() {
  const channels = getConfiguredChannelMeta();

  if (channels.length === 0) {
    return NextResponse.json(
      { error: 'No channel env vars configured (YOUTUBE_CHANNEL_ID_MAIN etc.)' },
      { status: 400 },
    );
  }

  const results: Record<string, string> = {};

  for (const ch of channels) {
    if (!ch.envRefreshToken) {
      results[ch.label] = 'skipped — no env refresh token';
      continue;
    }
    await saveRefreshToken(ch.label, ch.envRefreshToken);
    results[ch.label] = 'seeded';
  }

  return NextResponse.json({ results });
}
