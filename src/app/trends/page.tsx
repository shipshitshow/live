import { AppHeader } from '@/components/AppHeader';
import { TrendsClient } from '@/components/trends/TrendsClient';

export default function TrendsPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <AppHeader subtitle="Trends" activeHref="/trends" />

      <main className="mx-auto w-full max-w-[1800px] px-6 py-6">
        <TrendsClient />
      </main>
    </div>
  );
}
