'use client';

import dynamic from 'next/dynamic';

const YouTubeAuthGate = dynamic(
  async () => (await import('@/components/YouTubeAuthGate')).YouTubeAuthGate,
  { ssr: false },
);

const TerminalDrawerGate = dynamic(
  async () =>
    (await import('@/components/dev/TerminalDrawerGate')).TerminalDrawerGate,
  { ssr: false },
);

interface DevOverlaysProps {
  devToolsEnabled: boolean;
  youtubeAuthEnabled: boolean;
}

export function DevOverlays({
  devToolsEnabled,
  youtubeAuthEnabled,
}: DevOverlaysProps) {
  return (
    <>
      {youtubeAuthEnabled ? <YouTubeAuthGate /> : null}
      {devToolsEnabled ? <TerminalDrawerGate /> : null}
    </>
  );
}
