import type { Metadata } from 'next';
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import 'xterm/css/xterm.css';
import './globals.scss';
import { TerminalDrawerGate } from '@/components/dev/TerminalDrawerGate';
import { YouTubeAuthGate } from '@/components/YouTubeAuthGate';
import { isDevToolsEnabled } from '@/lib/dev-tools';

const spaceGrotesk = Space_Grotesk({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const jetBrainsMono = JetBrains_Mono({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

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

  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
        <YouTubeAuthGate />
        <div id="app-content-shell" className="app-content-shell">
          {children}
        </div>
        {devToolsEnabled ? <TerminalDrawerGate /> : null}
      </body>
    </html>
  );
}
