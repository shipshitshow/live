import type {
  EpisodeDistributionAssetUpdate,
  EpisodeDistributionResponse,
} from '@shipshitshow/types';
import { isDistributionAssetStatus } from '@shipshitshow/types';
import { NextResponse } from 'next/server';
import { normalizeDistributionUrl } from '@/lib/distribution';
import {
  getEpisodeDistribution,
  isDistributionWritable,
  saveEpisodeDistributionAsset,
} from '@/lib/distribution-store';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface DistributionPatchRequest {
  assetId?: unknown;
  status?: unknown;
  url?: unknown;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  if (!DATE_PATTERN.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  return NextResponse.json({
    distribution: await getEpisodeDistribution(date),
    isWritable: isDistributionWritable(),
  } satisfies EpisodeDistributionResponse);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  if (!DATE_PATTERN.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  const body: DistributionPatchRequest = await request.json();
  if (typeof body.assetId !== 'string' || !body.assetId) {
    return NextResponse.json({ error: 'assetId is required' }, { status: 400 });
  }

  const update: EpisodeDistributionAssetUpdate = {};

  if (body.status !== undefined) {
    if (!isDistributionAssetStatus(body.status)) {
      return NextResponse.json(
        { error: 'status must be pending, published, or skipped' },
        { status: 400 },
      );
    }
    update.status = body.status;
  }

  if (body.url !== undefined) {
    if (body.url !== null && typeof body.url !== 'string') {
      return NextResponse.json(
        { error: 'url must be a string' },
        {
          status: 400,
        },
      );
    }

    // An empty field clears the URL; anything else has to be a real http(s)
    // link, because this value is the join key for platform metrics.
    const normalized =
      body.url === null ? null : normalizeDistributionUrl(body.url);
    if (body.url !== null && body.url.trim() !== '' && normalized === null) {
      return NextResponse.json(
        { error: 'url must be an http(s) link' },
        { status: 400 },
      );
    }
    update.url = normalized;
  }

  try {
    const distribution = await saveEpisodeDistributionAsset(
      date,
      body.assetId,
      update,
    );
    if (!distribution) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json({
      distribution,
      isWritable: true,
    } satisfies EpisodeDistributionResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to save distribution',
      },
      { status: 503 },
    );
  }
}
