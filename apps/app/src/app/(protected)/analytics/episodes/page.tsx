import type { Metadata } from 'next';
import { EpisodeRollupPage } from '@/components/EpisodeRollupPage';

export const metadata: Metadata = {
  description:
    'Per-episode performance across every distribution surface for Ship Shit Show.',
  title: 'Episode Rollup - Ship Shit Show',
};

export default function EpisodeRollupRoutePage() {
  return <EpisodeRollupPage />;
}
