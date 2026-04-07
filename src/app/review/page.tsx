import { Suspense } from "react";
import Link from "next/link";
import { ReviewQueueClient } from "@/components/review/ReviewQueueClient";

export const metadata = {
  title: "Ship Shit Show — Review Queue",
};

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <header className="border-b border-surface-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-red flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81z" />
              <path d="M9.75 15.02V8.98L15.5 12l-5.75 3.02z" fill="#ff2d20" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary leading-none">Ship Shit Show</h1>
            <p className="text-xs text-text-muted mt-0.5">Review Queue</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-xs text-text-secondary">
          <Link href="/" className="hover:text-text-primary transition-colors">Analytics</Link>
          <span className="text-text-primary font-medium">Review</span>
          <Link href="/livestream" className="hover:text-text-primary transition-colors">Livestream</Link>
        </nav>
      </header>

      <main className="px-6 py-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-text-primary">Pre-publish Review Queue</h2>
          <p className="text-text-muted text-sm mt-0.5">Videos awaiting human approval before YouTube upload</p>
        </div>
        <Suspense fallback={<QueueSkeleton />}>
          <ReviewQueueClient />
        </Suspense>
      </main>
    </div>
  );
}

function QueueSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-surface-card border border-surface-border rounded-xl h-20" />
      ))}
    </div>
  );
}
