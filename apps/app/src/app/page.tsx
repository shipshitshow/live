import type { Metadata } from 'next';
import { AnalyticsPage } from '@/components/AnalyticsPage';

export const metadata: Metadata = {
  title: 'Ship Shit Show - Producer Dashboard',
  description: 'Producer dashboard for the Ship Shit Show — analytics, livestreams, and content management.',
};

export default function Home() {
  return <AnalyticsPage />;
}
