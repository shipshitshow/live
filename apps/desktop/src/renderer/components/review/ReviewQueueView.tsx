import type { UnlistedVideo } from '@shipshitshow/types';
import { Button } from '@shipshitshow/ui';
import { useCallback, useEffect, useState } from 'react';
import { CopyButton } from '../CopyButton';
import { formatDuration, formatNumber } from '../../lib/format';

interface VideoGeneratedContent {
  titles: string[];
  youtubeDescription: string;
  linkedinPost: string;
  announcementTweet: string;
  recapTweet: string;
}

const CHANNEL_HANDLES: Record<string, { handle: string; cls: string }> = {
  clips: { cls: 'bg-blue-500/20 text-blue-400', handle: '@sssclips' },
  main: { cls: 'bg-accent-red/20 text-accent-red', handle: '@shipshitshow' },
};

function ContentBlock({
  label,
  content,
  onRegen,
}: {
  label: string;
  content: string;
  onRegen: () => void;
}) {
  return (
    <div className="bg-surface-elevated rounded-lg border border-surface-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-surface-border">
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
          {label}
        </span>
        <div className="flex gap-1.5">
          <Button
            onClick={onRegen}
            size="sm"
            className="rounded bg-accent-red/10 text-[10px] text-accent-red hover:bg-accent-red/20 hover:text-accent-red"
          >
            Regen
          </Button>
          <CopyButton text={content} />
        </div>
      </div>
      <div className="px-3 py-2">
        <pre className="text-xs text-text-secondary font-mono whitespace-pre-wrap leading-relaxed">
          {content}
        </pre>
      </div>
    </div>
  );
}

export function ReviewQueueView() {
  const [videos, setVideos] = useState<UnlistedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<UnlistedVideo | null>(null);
  const [content, setContent] = useState<VideoGeneratedContent | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await window.electronAPI.review.listVideos();
      setVideos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load review queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  async function handleGenerate() {
    if (!selected) return;
    const generated = await window.electronAPI.review.generateContent({
      channelLabel: selected.channel_label || 'main',
      duration: selected.avg_view_duration_seconds,
      title: selected.title,
      videoType: selected.video_type === 'short' ? 'short' : 'video',
    });
    setContent(generated);
  }

  async function handleRegenField(field: keyof VideoGeneratedContent) {
    if (!selected || !content) return;
    const newValue = await window.electronAPI.review.regenerateField(
      {
        channelLabel: selected.channel_label || 'main',
        duration: selected.avg_view_duration_seconds,
        title: selected.title,
        videoType: selected.video_type === 'short' ? 'short' : 'video',
      },
      field,
    );
    setContent({ ...content, [field]: newValue });
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="text-accent-red text-4xl">!</div>
        <p className="text-text-secondary text-sm">{error}</p>
        <Button
          onClick={fetchVideos}
          className="text-xs hover:border-accent-red"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-surface-card border border-surface-border rounded-xl h-24"
              />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-text-secondary text-sm">
              No videos in the review queue
            </p>
            <p className="text-text-muted text-xs">
              Upload a video as unlisted from Premiere, then refresh
            </p>
            <Button
              onClick={fetchVideos}
              className="text-xs hover:border-accent-red"
            >
              Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-muted">
                {videos.length} review queue video
                {videos.length !== 1 ? 's' : ''}
              </p>
              <Button
                onClick={fetchVideos}
                className="text-xs text-text-muted hover:text-text-primary"
              >
                Refresh
              </Button>
            </div>

            {videos.map((video) => {
              const ch = video.channel_label
                ? CHANNEL_HANDLES[video.channel_label]
                : null;
              const isSelected = selected?.video_id === video.video_id;

              return (
                <Button
                  key={video.video_id}
                  onClick={() => {
                    setSelected(video);
                    setContent(null);
                  }}
                  variant="ghost"
                  className={`h-auto w-full justify-start gap-4 whitespace-normal rounded-xl border p-4 text-left transition-colors ${
                    isSelected
                      ? 'bg-accent-red/5 border-accent-red/30 hover:bg-accent-red/5'
                      : 'bg-surface-card border-surface-border hover:border-surface-border/80 hover:bg-surface-card'
                  }`}
                >
                  {video.thumbnail_url && (
                    <div className="w-32 h-[72px] rounded-lg overflow-hidden shrink-0 bg-surface-elevated">
                      <img
                        src={video.thumbnail_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {ch && (
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${ch.cls}`}
                        >
                          {ch.handle}
                        </span>
                      )}
                      {video.video_type === 'short' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                          SHORT
                        </span>
                      )}
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                        UNLISTED
                      </span>
                    </div>
                    <p className="text-sm text-text-primary font-medium line-clamp-2">
                      {video.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-text-muted">
                      <span>
                        {formatDuration(video.avg_view_duration_seconds)}
                      </span>
                      <span>{formatNumber(video.views)} views</span>
                      <span>
                        {new Date(video.published_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        )}
      </div>

      <aside className="w-[420px] shrink-0 border-l border-surface-border overflow-y-auto p-4">
        {!selected ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-text-muted text-center">
              Select a review queue video to generate
              <br />
              title, description &amp; social copy
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-surface-card border border-surface-border rounded-xl p-4">
              <p className="text-sm font-semibold text-text-primary line-clamp-2">
                {selected.title}
              </p>
              <p className="text-[10px] text-text-muted mt-1">
                {formatDuration(selected.avg_view_duration_seconds)} ·{' '}
                {selected.video_type}
              </p>
              <div className="mt-3">
                <Button
                  onClick={handleGenerate}
                  className="w-full text-xs bg-accent-red/10 text-accent-red hover:bg-accent-red/20 hover:text-accent-red"
                >
                  {content ? 'Regenerate All' : 'Generate Content'}
                </Button>
              </div>
            </div>

            {content && (
              <>
                <div className="bg-surface-elevated rounded-lg border border-surface-border overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-surface-border">
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                      Title Variants
                    </span>
                    <Button
                      onClick={() => handleRegenField('titles')}
                      size="sm"
                      className="rounded bg-accent-red/10 text-[10px] text-accent-red hover:bg-accent-red/20 hover:text-accent-red"
                    >
                      Regen
                    </Button>
                  </div>
                  <div className="p-3 space-y-2">
                    {content.titles.map((t, i) => (
                      <div key={i} className="flex items-start gap-2 group">
                        <span className="text-[10px] text-text-muted shrink-0 mt-0.5 w-4">
                          {i + 1}.
                        </span>
                        <span className="text-xs text-text-secondary flex-1">
                          {t}
                        </span>
                        <CopyButton text={t} timeoutMs={2000} />
                      </div>
                    ))}
                  </div>
                </div>

                <ContentBlock
                  label="YouTube Description"
                  content={content.youtubeDescription}
                  onRegen={() => handleRegenField('youtubeDescription')}
                />
                <ContentBlock
                  label="LinkedIn Post"
                  content={content.linkedinPost}
                  onRegen={() => handleRegenField('linkedinPost')}
                />
                <ContentBlock
                  label="Tweet — Announcement"
                  content={content.announcementTweet}
                  onRegen={() => handleRegenField('announcementTweet')}
                />
                <ContentBlock
                  label="Tweet — Recap"
                  content={content.recapTweet}
                  onRegen={() => handleRegenField('recapTweet')}
                />
              </>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
