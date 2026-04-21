import type { Metadata } from 'next';
import './globals.css';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://show.shipshit.dev';

export const metadata: Metadata = {
  description: 'Live coding, hot takes, and shipping in public — every week.',
  metadataBase: new URL(SITE_URL),
  title: 'Ship Shit Show',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
