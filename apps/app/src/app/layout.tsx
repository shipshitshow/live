import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { buildDefaultMetadata } from '@/lib/site';
import './globals.scss';

export const metadata: Metadata = {
  description:
    'Live coding, hot takes, and shipping in public. Every week on YouTube.',
  title: 'Ship Shit Show',
  ...buildDefaultMetadata(),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
