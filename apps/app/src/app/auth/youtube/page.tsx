import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { YouTubeAuthContentSkeleton } from '@/components/PageSkeletons';
import { YouTubeAuthPageClient } from '@/components/YouTubeAuthPageClient';
import { isYouTubeAuthEnabled } from '@/lib/dev-tools';

export default function YouTubeAuthPage() {
  if (!isYouTubeAuthEnabled()) {
    notFound();
  }

  return (
    <Suspense fallback={<YouTubeAuthContentSkeleton />}>
      <YouTubeAuthPageClient />
    </Suspense>
  );
}
