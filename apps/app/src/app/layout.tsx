import type { Metadata } from 'next';
import { buildDefaultMetadata } from '@/lib/site';
import './globals.scss';

export const metadata: Metadata = {
  description: 'YouTube channel analytics and review dashboard',
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
        <div id="app-content-shell" className="app-content-shell">
          {children}
        </div>
      </body>
    </html>
  );
}
