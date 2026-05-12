import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  description: 'Authenticate with YouTube for Ship Shit Show.',
  title: 'YouTube Auth - Ship Shit Show',
};

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
