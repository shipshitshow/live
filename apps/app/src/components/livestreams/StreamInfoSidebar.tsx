import Image from 'next/image';
import { TranscriptScorecard } from '@/components/TranscriptScorecard';
import { formatNumber } from '@/lib/format';
import {
  formatLivestreamDate,
  isPastDate,
  STATUS_META,
} from '@/lib/livestreams-ui';
import type { TranscriptScorecard as TranscriptScorecardData } from '@/lib/transcript-scorecard';

export function StreamInfoSidebar({
  commentCount,
  effectiveStatus,
  resolvedDate,
  restreamUrl,
  scorecard,
  thumbnailUrl,
  title,
  viewCount,
  youtubeUrl,
}: {
  commentCount: number | null;
  effectiveStatus: keyof typeof STATUS_META;
  resolvedDate: string;
  restreamUrl: string | null;
  scorecard: TranscriptScorecardData | null;
  thumbnailUrl: string | null;
  title: string;
  viewCount: number | null;
  youtubeUrl: string | null;
}) {
  const statusMeta = STATUS_META[effectiveStatus];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        {thumbnailUrl ? (
          <div className="relative aspect-video overflow-hidden bg-surface-elevated">
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              loading="eager"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="space-y-3 p-4">
          <h1 className="text-base font-semibold leading-snug text-text-primary">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusMeta.badgeClass}`}
            >
              {statusMeta.label}
            </span>
            <span className="text-xs text-text-muted">
              {formatLivestreamDate(resolvedDate)}
            </span>
          </div>

          {viewCount !== null || commentCount !== null ? (
            <div className="flex items-center gap-4 text-xs text-text-muted">
              {viewCount !== null ? (
                <span>{formatNumber(viewCount)} views</span>
              ) : null}
              {commentCount !== null ? (
                <span>{formatNumber(commentCount)} comments</span>
              ) : null}
            </div>
          ) : null}

          {youtubeUrl || restreamUrl ? (
            <div className="flex flex-col gap-2">
              {youtubeUrl ? (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-accent-red px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-accent-red/85"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-5"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  {isPastDate(resolvedDate) ? 'Watch replay' : 'Watch stream'}
                </a>
              ) : null}
              {restreamUrl ? (
                <a
                  href={restreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-surface-border bg-surface-elevated px-5 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-accent-red hover:text-accent-red"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-4"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                  </svg>
                  Restream Studio
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <TranscriptScorecard scorecard={scorecard} />
    </div>
  );
}
