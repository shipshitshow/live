import { Suspense } from "react";
import Link from "next/link";
import { ReviewDetailClient } from "@/components/review/ReviewDetailClient";

export const metadata = {
  title: "Ship Shit Show — Review",
};

export default function ReviewDetailPage({ params }: { params: { jobId: string } }) {
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
            <p className="text-xs text-text-muted mt-0.5">Video Review</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-xs text-text-secondary">
          <Link href="/" className="hover:text-text-primary transition-colors">Analytics</Link>
          <Link href="/review" className="hover:text-text-primary transition-colors">Review Queue</Link>
        </nav>
      </header>

      <main className="px-6 py-8 max-w-7xl mx-auto">
        <div className="mb-4">
          <Link
            href="/review"
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to queue
          </Link>
        </div>
        <Suspense fallback={<DetailSkeleton />}>
          <ReviewDetailClient jobId={params.jobId} />
        </Suspense>
      </main>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4">
        <div className="bg-surface-card border border-surface-border rounded-xl aspect-video" />
        <div className="bg-surface-card border border-surface-border rounded-xl h-48" />
      </div>
      <div className="bg-surface-card border border-surface-border rounded-xl h-96" />
    </div>
  );
}
