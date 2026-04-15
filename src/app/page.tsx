import { Suspense } from "react";
import { DashboardClient } from "@/components/DashboardClient";
import { AppHeader } from "@/components/AppHeader";
import { AnalyticsContentSkeleton } from "@/components/PageSkeletons";

export default function Home() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <AppHeader subtitle="Analytics Dashboard" activeHref="/" />

      <main className="px-6 py-8 max-w-7xl mx-auto">
        <Suspense fallback={<AnalyticsContentSkeleton />}>
          <DashboardClient />
        </Suspense>
      </main>
    </div>
  );
}
