import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SocialAuthPageClient } from '@/components/SocialAuthPageClient';
import { requireProducerPage } from '@/lib/producer-auth';

export const metadata: Metadata = {
  description: 'Connect Instagram and TikTok analytics for Ship Shit Show.',
  title: 'Social OAuth - Ship Shit Show',
};

export default async function SocialAuthPage() {
  await requireProducerPage();
  return (
    <Suspense>
      <SocialAuthPageClient />
    </Suspense>
  );
}
