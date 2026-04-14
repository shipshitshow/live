import { Suspense } from "react";
import { DashboardClient } from "@/components/DashboardClient";
import { AppHeader } from "@/components/AppHeader";

export default function Home() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <AppHeader subtitle="Analytics Dashboard" activeHref="/" />

      <main className="px-6 py-8 max-w-7xl mx-auto">
        <Suspense fallback={<LoadingState />}>
          <DashboardClient />
        </Suspense>
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface-card border border-surface-border rounded-xl h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-card border border-surface-border rounded-xl h-64" />
        <div className="bg-surface-card border border-surface-border rounded-xl h-64" />
      </div>
    </div>
  );
}
