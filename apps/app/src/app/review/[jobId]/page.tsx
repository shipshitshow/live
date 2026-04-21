import Link from 'next/link';
import { Suspense } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { ReviewDetailContentSkeleton } from '@/components/PageSkeletons';
import { ReviewDetailClient } from '@/components/review/ReviewDetailClient';

export const metadata = {
  title: 'Ship Shit Show — Review',
};

export default function ReviewDetailPage({
  params,
}: {
  params: { jobId: string };
}) {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <AppHeader
        subtitle="Video Review"
        activeHref="/review"
        links={[
          { href: '/', label: 'Analytics' },
          { href: '/review', label: 'Review Queue' },
        ]}
      />

      <main className="px-6 py-8 max-w-7xl mx-auto">
        <div className="mb-4">
          <Link
            href="/review"
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M7.5 2L3.5 6L7.5 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to queue
          </Link>
        </div>
        <Suspense fallback={<ReviewDetailContentSkeleton />}>
          <ReviewDetailClient jobId={params.jobId} />
        </Suspense>
      </main>
    </div>
  );
}
