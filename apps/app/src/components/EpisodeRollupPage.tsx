import { Suspense } from 'react';
import { EpisodeRollupClient } from '@/components/EpisodeRollupClient';
import { EpisodeRollupContentSkeleton } from '@/components/PageSkeletons';

export function EpisodeRollupPage() {
  return (
    <main className="px-6 py-8 max-w-7xl mx-auto">
      <Suspense fallback={<EpisodeRollupContentSkeleton />}>
        <EpisodeRollupClient />
      </Suspense>
    </main>
  );
}
