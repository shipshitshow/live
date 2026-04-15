import { DevOverlays } from '@/components/DevOverlays';
import { isDevToolsEnabled, isYouTubeAuthEnabled } from '@/lib/dev-tools';
import { buildDefaultMetadata } from '@/lib/site';
import type { Metadata } from 'next';
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
