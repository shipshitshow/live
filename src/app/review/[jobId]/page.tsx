import { Suspense } from "react";
import Link from "next/link";
import { ReviewDetailClient } from "@/components/review/ReviewDetailClient";
import { AppHeader } from "@/components/AppHeader";

export const metadata = {
  title: "Ship Shit Show — Review",
};

export default function ReviewDetailPage({ params }: { params: { jobId: string } }) {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <AppHeader
        subtitle="Video Review"
        activeHref="/review"
        links={[
          { href: "/", label: "Analytics" },
          { href: "/review", label: "Review Queue" },
        ]}
      />

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
