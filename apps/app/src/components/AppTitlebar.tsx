'use client';

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { usePathname } from 'next/navigation';
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

export function AppTitlebar() {
  const pathname = usePathname();
  const subtitle = resolveSubtitle(pathname);
  const { collapsed, toggle } = useSidebarState();
  const hasSidebar = pathname.startsWith('/livestreams/') && pathname !== '/livestreams/';

  return (
    <div className="flex h-[38px] shrink-0 items-center justify-between border-b border-surface-border bg-surface px-4">
      <div className="flex items-center gap-2 text-[11px]">
        <span className="font-semibold text-text-secondary">
          Ship Shit Show
        </span>
        <span className="text-text-muted">/</span>
        <span className="text-text-secondary">{subtitle}</span>
      </div>
      {hasSidebar ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex items-center justify-center size-6 rounded-full border border-surface-border bg-surface-card text-text-muted transition-colors hover:border-accent-red hover:text-accent-red"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`size-3 transition-transform ${collapsed ? 'rotate-180' : ''}`}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
