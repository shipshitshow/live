import type { Metadata } from 'next';
import { AnalyticsPage } from '@/components/AnalyticsPage';

export const metadata: Metadata = {
  description:
    'Producer dashboard for the Ship Shit Show — analytics, livestreams, and content management.',
  title: 'Ship Shit Show - Producer Dashboard',
};

export default function Home() {
  return <AnalyticsPage />;
}
