import type { Metadata } from 'next';
import { TrendsView } from '@/components/trends/TrendsView';

export const metadata: Metadata = { title: 'Trends — Ship Shit Show' };

export default function TrendsPage() {
  return (
    <div className="h-screen overflow-hidden">
      <TrendsView />
    </div>
  );
}
