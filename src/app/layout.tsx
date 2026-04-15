import type { Metadata } from 'next';
import './globals.scss';
import { DevOverlays } from '@/components/DevOverlays';
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
        <div id="app-content-shell" className="app-content-shell">
          {children}
        </div>
        <DevOverlays
          devToolsEnabled={devToolsEnabled}
          youtubeAuthEnabled={youtubeAuthEnabled}
        />
      </body>
    </html>
  );
}
