import { Suspense } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { DashboardClient } from '@/components/DashboardClient';
import { AnalyticsContentSkeleton } from '@/components/PageSkeletons';

export function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <AppHeader subtitle="Analytics Dashboard" activeHref="/analytics" />

      <main className="px-6 py-8 max-w-7xl mx-auto">
        <Suspense fallback={<AnalyticsContentSkeleton />}>
          <DashboardClient />
        </Suspense>
      </main>
    </div>
  );
}
