'use client';

import dynamic from 'next/dynamic';
import { useParams, useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { todayLocalDate } from '@/lib/date';

const TopicDrawingBoard = dynamic(
  async () =>
    (await import('@/components/livestream/TopicDrawingBoard'))
      .TopicDrawingBoard,
  {
    loading: () => (
      <div className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-surface">
        <p className="text-sm text-text-muted animate-pulse">
          Loading drawing board…
        </p>
      </div>
    ),
    ssr: false,
  },
);

export default function TopicDrawingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const date = searchParams.get('date') || todayLocalDate();

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <AppHeader subtitle="Livestream Drawing Board" activeHref="/livestream" />
      <TopicDrawingBoard date={date} slug={slug} />
    </div>
  );
}
