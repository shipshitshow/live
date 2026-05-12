import type { Metadata } from 'next';
import { AnalyticsPage } from '@/components/AnalyticsPage';

export const metadata: Metadata = {
  title: 'Analytics - Ship Shit Show',
  description: 'YouTube analytics and video performance for Ship Shit Show.',
};

export default function AnalyticsRoutePage() {
  return <AnalyticsPage />;
}
