'use client';

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AppAccountButton } from '@/components/AppAccountButton';
import { useSidebarState } from '@/components/livestreams/SidebarStateContext';

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

function LogoMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81z" />
      <path d="M9.75 15.02V8.98L15.5 12l-5.75 3.02z" fill="#0d0d0d" />
    </svg>
  );
}

export function AppTitlebar() {
  const pathname = usePathname();
  const subtitle = resolveSubtitle(pathname);
  const { collapsed, toggle } = useSidebarState();

  return (
    <div className="flex h-[38px] shrink-0 items-center gap-3 border-b border-surface-border bg-surface px-4">
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="group relative flex size-6 shrink-0 items-center justify-center rounded-md text-accent-red transition-colors hover:bg-surface-elevated"
      >
        <span className="transition-opacity group-hover:opacity-0">
          <LogoMark />
        </span>
        <span className="absolute inset-0 flex items-center justify-center text-text-muted opacity-0 transition-opacity group-hover:opacity-100">
          {collapsed ? (
            <PanelLeftOpen size={14} />
          ) : (
            <PanelLeftClose size={14} />
          )}
        </span>
      </button>

      <div className="flex items-center gap-2 text-[11px]">
        <span className="font-semibold text-text-secondary">
          Ship Shit Show
        </span>
        <span className="text-text-muted">/</span>
        <span className="text-text-secondary">{subtitle}</span>
      </div>
      <div className="ml-auto flex items-center">
        <AppAccountButton />
      </div>
    </div>
  );
}
