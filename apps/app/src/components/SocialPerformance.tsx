'use client';

import type {
  PerformancePlatform,
  SocialPlatformStatus,
  VideoStats,
} from '@shipshitshow/types';
import { Button } from '@shipshitshow/ui';
import Image from 'next/image';
import { useMemo } from 'react';
import { formatNumber } from '@/lib/format';

interface SocialPerformanceProps {
  socialStatuses: SocialPlatformStatus[];
  socialVideos: VideoStats[];
  youtubeVideos: VideoStats[];
}

const PLATFORM_CONFIG: Record<
  PerformancePlatform,
  { accent: string; label: string }
> = {
  instagram: { accent: 'bg-pink-500/20 text-pink-300', label: 'Instagram' },
  tiktok: { accent: 'bg-cyan-400/20 text-cyan-200', label: 'TikTok' },
  youtube: { accent: 'bg-purple-500/20 text-purple-300', label: 'YT Shorts' },
};

const PLATFORM_ORDER: PerformancePlatform[] = [
  'youtube',
  'instagram',
  'tiktok',
];

function getVideoUrl(video: VideoStats): string {
  if (video.source_url) return video.source_url;
  if (video.platform === 'youtube' || !video.platform) {
    return `https://youtu.be/${video.video_id}`;
  }
  return '#';
}

function SocialVideoCard({ video, rank }: { rank: number; video: VideoStats }) {
  return (
    <a
      href={getVideoUrl(video)}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3"
    >
      <div className="w-5 shrink-0 pt-1 text-right text-lg font-bold text-text-muted">
        {rank}
      </div>
      <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-surface-elevated">
        {video.thumbnail_url ? (
          <Image
            src={video.thumbnail_url}
            alt=""
            fill
            className="object-cover transition-transform group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-text-muted">
            No thumb
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-xs font-medium text-text-primary transition-colors group-hover:text-accent-red">
          {video.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-text-muted">
          <span>{formatNumber(video.views)} views</span>
          <span>{formatNumber(video.likes)} likes</span>
          <span>{formatNumber(video.comments)} comments</span>
          {video.shares ? (
            <span>{formatNumber(video.shares)} shares</span>
          ) : null}
        </div>
      </div>
    </a>
  );
}

export function SocialPerformance({
  socialStatuses,
  socialVideos,
  youtubeVideos,
}: SocialPerformanceProps) {
  const sections = useMemo(() => {
    const youtubeShorts = youtubeVideos
      .filter((video) => video.video_type === 'short')
      .map((video) => ({ ...video, platform: 'youtube' as const }));

    const all = [...youtubeShorts, ...socialVideos];
    return PLATFORM_ORDER.map((platform) => ({
      platform,
      status: socialStatuses.find((status) => status.platform === platform),
      videos: all
        .filter((video) => video.platform === platform)
        .sort((a, b) => b.views - a.views)
        .slice(0, 5),
    }));
  }, [socialStatuses, socialVideos, youtubeVideos]);

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card">
      <div className="border-b border-surface-border px-5 pb-3 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xs font-medium uppercase tracking-widest text-text-secondary">
            Short-Form Performance
          </h3>
          <Button
            asChild
            size="sm"
            className="rounded bg-surface-elevated text-xs text-text-secondary hover:text-text-primary"
          >
            <a href="/auth/social">OAuth setup</a>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-surface-border md:grid-cols-3 md:divide-x md:divide-y-0">
        {sections.map((section) => {
          const config = PLATFORM_CONFIG[section.platform];
          return (
            <div key={section.platform} className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-[9px] font-bold ${config.accent}`}
                >
                  {config.label.toUpperCase()}
                </span>
                <span className="text-[10px] text-text-muted">
                  Top {section.videos.length}
                </span>
              </div>

              {section.videos.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {section.videos.map((video, index) => (
                    <SocialVideoCard
                      key={`${section.platform}:${video.video_id}`}
                      video={video}
                      rank={index + 1}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-surface-border/70 bg-surface-elevated/30 px-3 py-4 text-xs leading-relaxed text-text-muted">
                  {section.status?.error
                    ? section.status.error
                    : section.platform === 'youtube'
                      ? 'No Shorts found for this date range.'
                      : 'Connect OAuth or add an access token to load performance.'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
