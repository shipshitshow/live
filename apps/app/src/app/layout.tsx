import type { Metadata } from 'next';
import { AppSidebar } from '@/components/AppSidebar';
import { AppTitlebar } from '@/components/AppTitlebar';
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
        <div id="app-content-shell" className="flex h-screen flex-col bg-surface text-text-primary">
          <AppTitlebar />
          <div className="flex flex-1 overflow-hidden">
            <AppSidebar />
            <main className="flex-1 min-w-0 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
