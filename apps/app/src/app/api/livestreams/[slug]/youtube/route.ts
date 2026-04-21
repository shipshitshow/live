import fs from 'node:fs';
import { NextResponse } from 'next/server';
import { todayLocalDate } from '@/lib/date';
import { findTopicFile } from '@/lib/livestreams-files';
import { extractVideoId, extractYouTubeUrl } from '@/lib/livestreams-youtube';
import { logError, logEvent } from '@/lib/logger';
import {
  getAccessToken,
  getChannelConfigs,
  hasYouTubeCredentials,
  isYouTubeReauthError,
} from '@/lib/youtube/token';

const DATA_API = 'https://www.googleapis.com/youtube/v3';

async function ytFetch(url: string, token: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API ${res.status}: ${body}`);
  }
  return res.json();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || todayLocalDate();
  const filePath = findTopicFile(slug, date);

  if (!filePath) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const youtubeUrl = extractYouTubeUrl(raw);
  if (!youtubeUrl) {
    return NextResponse.json({ liveStatus: 'missing', youtubeUrl: null });
  }

  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) {
    return NextResponse.json({ liveStatus: 'invalid', youtubeUrl });
  }

  if (!hasYouTubeCredentials()) {
    return NextResponse.json({
      liveStatus: 'unauthorized',
      videoId,
      youtubeUrl,
    });
  }

  try {
    const channelConfig = (await getChannelConfigs())[0];
    if (!channelConfig) {
      return NextResponse.json({
        liveStatus: 'unauthorized',
        videoId,
        youtubeUrl,
      });
    }
    const token = await getAccessToken(channelConfig);
    const res = await ytFetch(
      `${DATA_API}/videos?part=snippet,statistics,liveStreamingDetails&id=${videoId}`,
      token,
    );

    const item = res.items?.[0];
    if (!item) {
      return NextResponse.json({ liveStatus: 'missing', videoId, youtubeUrl });
    }

    const live = item.liveStreamingDetails;
    const isLiveNow = !!live?.actualStartTime && !live?.actualEndTime;
    const liveStatus = isLiveNow
      ? 'live'
      : live?.actualEndTime
        ? 'ended'
        : 'scheduled';

    logEvent('api.livestream.youtube', {
      concurrentViewers: live?.concurrentViewers
        ? Number(live.concurrentViewers)
        : null,
      date,
      liveStatus,
      slug,
      videoId,
      viewCount: Number(item.statistics?.viewCount ?? 0),
    });

    return NextResponse.json({
      actualEndTime: live?.actualEndTime ?? null,
      actualStartTime: live?.actualStartTime ?? null,
      channelTitle: item.snippet?.channelTitle ?? null,
      concurrentViewers: live?.concurrentViewers
        ? Number(live.concurrentViewers)
        : null,
      liveStatus,
      publishedAt: item.snippet?.publishedAt ?? null,
      scheduledStartTime: live?.scheduledStartTime ?? null,
      thumbnailUrl:
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        null,
      title: item.snippet?.title ?? null,
      videoId,
      viewCount: Number(item.statistics?.viewCount ?? 0),
      youtubeUrl,
    });
  } catch (error) {
    if (isYouTubeReauthError(error)) {
      return NextResponse.json(
        {
          channelLabel: error.channelLabel ?? null,
          liveStatus: 'unauthorized',
          reauthRequired: true,
          videoId,
          youtubeUrl,
        },
        { status: 401 },
      );
    }
    logError('api.livestream.youtube_failed', error, { date, slug, videoId });
    return NextResponse.json(
      { liveStatus: 'error', videoId, youtubeUrl },
      { status: 500 },
    );
  }
}
