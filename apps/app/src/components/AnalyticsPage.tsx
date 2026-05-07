import { Suspense } from 'react';
import { DashboardClient } from '@/components/DashboardClient';
import { AnalyticsContentSkeleton } from '@/components/PageSkeletons';

export function AnalyticsPage() {
  return (
    <main className="px-6 py-8 max-w-7xl mx-auto">
      <Suspense fallback={<AnalyticsContentSkeleton />}>
        <DashboardClient />
      </Suspense>
    </main>
  );
}
