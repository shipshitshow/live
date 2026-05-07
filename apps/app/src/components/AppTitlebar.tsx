'use client';

import { usePathname } from 'next/navigation';

const SUBTITLE_MAP: Record<string, string> = {
  '/analytics': 'Analytics',
  '/comments': 'Comments',
  '/livestreams': 'Livestreams',
  '/topics': 'Topics',
  '/trends': 'Trends',
  '/videos': 'Videos',
};

function resolveSubtitle(pathname: string): string {
  if (pathname.includes('/draw')) return 'Drawing Board';
  if (pathname.startsWith('/videos/')) return 'Video Detail';
  if (pathname.includes('/transcript')) return 'Transcript';
  if (pathname.includes('/talking-points')) return 'Talking Points';
  if (pathname.startsWith('/livestreams/')) return 'Livestream';
  return SUBTITLE_MAP[pathname] ?? 'Ship Shit Show';
}

export function AppTitlebar() {
  const pathname = usePathname();
  const subtitle = resolveSubtitle(pathname);

  return (
    <div className="flex h-[38px] shrink-0 items-center justify-between border-b border-surface-border bg-surface px-4">
      <div className="flex items-center gap-2 text-[11px]">
        <span className="font-semibold text-text-secondary">Ship Shit Show</span>
        <span className="text-text-muted">/</span>
        <span className="text-text-secondary">{subtitle}</span>
      </div>
    </div>
  );
}
