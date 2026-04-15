import type { Metadata } from 'next';
import { Suspense } from 'react';
import 'xterm/css/xterm.css';
import './globals.scss';
import { TerminalDrawerGate } from '@/components/dev/TerminalDrawerGate';
import { YouTubeAuthGate } from '@/components/YouTubeAuthGate';
import { isDevToolsEnabled, isYouTubeAuthEnabled } from '@/lib/dev-tools';

export const metadata: Metadata = {
  description: 'YouTube channel analytics and review dashboard',
  title: 'Ship Shit Show',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const devToolsEnabled = isDevToolsEnabled();
  const youtubeAuthEnabled = isYouTubeAuthEnabled();

  return (
    <html lang="en">
      <body>
        {youtubeAuthEnabled ? (
          <Suspense fallback={null}>
            <YouTubeAuthGate />
          </Suspense>
        ) : null}
        <div id="app-content-shell" className="app-content-shell">
          {children}
        </div>
        {devToolsEnabled ? <TerminalDrawerGate /> : null}
      </body>
    </html>
  );
}
