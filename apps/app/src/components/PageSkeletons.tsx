function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl border border-surface-border bg-surface-card ${className}`}
    />
  );
}

export function AnalyticsContentSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonBlock key={index} className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SkeletonBlock className="h-64" />
        <SkeletonBlock className="h-64" />
      </div>
    </div>
  );
}

/**
 * Shared by the episode rollup's Suspense fallback and its in-card refetch
 * state, so both spell the same table shape: one wide episode column followed by
 * the eight surface metrics.
 */
export function EpisodeRollupTableSkeleton() {
  return (
    <div className="divide-y divide-surface-border/50">
      {Array.from({ length: 6 }, (_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 px-4 py-4">
          <SkeletonBlock className="h-3 max-w-xs flex-1 rounded-md border-none bg-surface-elevated" />
          {Array.from({ length: 8 }, (_, cellIndex) => (
            <SkeletonBlock
              key={cellIndex}
              className="h-3 w-10 rounded-md border-none bg-surface-elevated"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EpisodeRollupContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-6 w-48 rounded-md border-none bg-surface-elevated" />
          <SkeletonBlock className="h-3 w-64 rounded-md border-none bg-surface-elevated" />
        </div>
        <SkeletonBlock className="h-9 w-10" />
      </div>
      <div className="rounded-xl border border-surface-border bg-surface-card">
        <EpisodeRollupTableSkeleton />
      </div>
    </div>
  );
}

export function CommentsContentSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-[1800px]"
      style={{ height: 'calc(100vh - 65px)' }}
    >
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-36 rounded-md border-none bg-surface-elevated" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-9 w-32" />
            <SkeletonBlock className="h-9 w-52" />
            <SkeletonBlock className="h-9 w-20" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, index) => (
            <SkeletonBlock key={index} className="h-28" />
          ))}
        </div>
      </div>
      <aside className="w-[460px] shrink-0 border-l border-surface-border p-4">
        <div className="space-y-4">
          <SkeletonBlock className="h-52" />
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
        </div>
      </aside>
    </div>
  );
}

export function ReviewQueueContentSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-[1800px]"
      style={{ height: 'calc(100vh - 65px)' }}
    >
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonBlock key={index} className="h-28" />
          ))}
        </div>
      </div>
      <aside className="w-[420px] shrink-0 border-l border-surface-border p-4">
        <div className="space-y-4">
          <SkeletonBlock className="h-48" />
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
        </div>
      </aside>
    </div>
  );
}

export function ReviewDetailContentSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <SkeletonBlock className="aspect-video" />
        <SkeletonBlock className="h-48" />
        <SkeletonBlock className="h-24" />
      </div>
      <SkeletonBlock className="h-96" />
    </div>
  );
}

export function TrendsContentSkeleton() {
  return (
    <div className="flex h-[calc(100vh-80px)] flex-col gap-6 lg:flex-row">
      <div className="flex min-w-0 w-full flex-col lg:w-3/5">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-8 w-72" />
            <SkeletonBlock className="h-3 w-32 rounded-md border-none bg-surface-elevated" />
          </div>
          <SkeletonBlock className="h-9 w-20" />
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto pr-2">
          {Array.from({ length: 8 }, (_, index) => (
            <SkeletonBlock key={index} className="h-24" />
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <SkeletonBlock className="h-10 flex-1" />
          <SkeletonBlock className="h-10 w-40" />
          <SkeletonBlock className="h-10 w-44" />
        </div>
      </div>
      <div className="w-full overflow-y-auto lg:w-2/5 lg:border-l lg:border-surface-border lg:pl-6">
        <div className="space-y-3">
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-20" />
          <SkeletonBlock className="h-20" />
          <SkeletonBlock className="h-20" />
        </div>
      </div>
    </div>
  );
}

export function LivestreamBoardContentSkeleton() {
  return (
    <main className="space-y-6 p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-40 rounded-md border-none bg-surface-elevated" />
          <SkeletonBlock className="h-3 w-56 rounded-md border-none bg-surface-elevated" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-8 w-40" />
          <SkeletonBlock className="h-8 w-24" />
        </div>
      </div>
      <div className="flex gap-6 overflow-x-auto">
        {Array.from({ length: 3 }, (_, columnIndex) => (
          <div
            key={columnIndex}
            className="min-w-[320px] flex-1 space-y-3 rounded-2xl border border-surface-border bg-surface-card/50 p-4"
          >
            <SkeletonBlock className="h-5 w-28 rounded-md border-none bg-surface-elevated" />
            {Array.from({ length: 3 }, (_, cardIndex) => (
              <SkeletonBlock key={cardIndex} className="h-32" />
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}

export function LivestreamTopicContentSkeleton() {
  return (
    <div className="mx-auto flex max-w-[1400px] gap-8 px-6 py-8">
      <main className="min-w-0 flex-1">
        <div className="overflow-hidden rounded-xl border border-surface-border bg-surface/30">
          <div className="flex gap-2 border-b border-surface-border px-4 py-3">
            <SkeletonBlock className="h-8 w-28 rounded-md" />
            <SkeletonBlock className="h-8 w-24 rounded-md" />
          </div>
          <div className="space-y-4 p-5">
            <SkeletonBlock className="h-4 w-48 rounded-md" />
            <SkeletonBlock className="h-7 w-3/4 rounded-lg" />
            <SkeletonBlock className="h-24" />
            <SkeletonBlock className="h-4 w-32 rounded-md" />
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-4 w-40 rounded-md" />
            <SkeletonBlock className="h-20" />
          </div>
        </div>
      </main>
      <aside className="hidden w-[380px] shrink-0 lg:block">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
            <SkeletonBlock className="aspect-video w-full rounded-none border-none" />
            <div className="space-y-3 p-4">
              <SkeletonBlock className="h-5 w-3/4 rounded-md" />
              <div className="flex gap-2">
                <SkeletonBlock className="h-5 w-14 rounded-full" />
                <SkeletonBlock className="h-5 w-24 rounded-md" />
              </div>
              <SkeletonBlock className="h-9 w-28 rounded-lg" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function YouTubeAuthContentSkeleton() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <SkeletonBlock className="h-[420px] rounded-2xl" />
    </main>
  );
}

export function AnalyticsPageSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <AnalyticsContentSkeleton />
    </main>
  );
}

export function EpisodeRollupPageSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <EpisodeRollupContentSkeleton />
    </main>
  );
}

export function CommentsPageSkeleton() {
  return <CommentsContentSkeleton />;
}

export function ReviewQueuePageSkeleton() {
  return <ReviewQueueContentSkeleton />;
}

export function ReviewDetailPageSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <ReviewDetailContentSkeleton />
    </main>
  );
}

export function TrendsPageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-[1800px] p-6">
      <TrendsContentSkeleton />
    </main>
  );
}

export function LivestreamBoardPageSkeleton() {
  return <LivestreamBoardContentSkeleton />;
}

export function YouTubeAuthPageSkeleton() {
  return <YouTubeAuthContentSkeleton />;
}
