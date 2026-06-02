import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SocialAuthPageClient } from '@/components/SocialAuthPageClient';

export const metadata: Metadata = {
  description: 'Connect Instagram and TikTok analytics for Ship Shit Show.',
  title: 'Social OAuth - Ship Shit Show',
};

export default function SocialAuthPage() {
  return (
    <Suspense>
      <SocialAuthPageClient />
    </Suspense>
  );
}
