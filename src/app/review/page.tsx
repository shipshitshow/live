import { Suspense } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { ReviewQueueContentSkeleton } from '@/components/PageSkeletons';
import { ReviewQueueClient } from '@/components/review/ReviewQueueClient';

export const metadata = {
  title: 'Ship Shit Show — Review Queue',
};

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <AppHeader subtitle="Review Queue" activeHref="/review" />
      <Suspense fallback={<ReviewQueueContentSkeleton />}>
        <ReviewQueueClient />
      </Suspense>
    </div>
  );
}
