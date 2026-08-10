'use client';

import { cn } from '@shipshitshow/ui';
import {
  BarChart3,
  Film,
  Inbox,
  LayoutGrid,
  MessageSquare,
  Radio,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType } from 'react';
import { useSidebarState } from '@/components/livestreams/SidebarStateContext';

interface NavItemDef {
  href: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
}

interface NavSection {
  items: NavItemDef[];
  label: string;
}

const OVERVIEW_ITEMS: NavItemDef[] = [
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/leads', icon: Inbox, label: 'Leads' },
];

const SECTIONS: NavSection[] = [
  {
    items: [
      { href: '/livestreams', icon: Radio, label: 'Livestreams' },
      { href: '/videos', icon: Film, label: 'Videos' },
    ],
    label: 'Content',
  },
  {
    items: [
      { href: '/trends', icon: TrendingUp, label: 'Trends' },
      { href: '/topics', icon: LayoutGrid, label: 'Topics' },
      { href: '/comments', icon: MessageSquare, label: 'Comments' },
    ],
    label: 'Trends',
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/analytics')
    return pathname === '/analytics' || pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { collapsed } = useSidebarState();

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col border-r border-surface-border bg-surface overflow-hidden transition-[width,opacity] duration-200 ease-out',
        collapsed ? 'w-0 opacity-0' : 'w-[240px] opacity-100',
      )}
    >
      <nav className="flex-1 overflow-y-auto">
        <div className="space-y-0.5 px-2 pt-4 pb-2">
          {OVERVIEW_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md pl-3 pr-5 py-2 text-[13px] font-normal transition-colors',
                  active
                    ? 'bg-surface-elevated text-text-primary font-medium'
                    : 'text-text-secondary hover:bg-surface-elevated/60 hover:text-text-primary',
                )}
              >
                <Icon size={14} className="shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="px-4 pt-4 pb-1">
              <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
                {section.label}
              </span>
            </div>
            <div className="space-y-0.5 px-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md pl-3 pr-5 py-2 text-[13px] font-normal transition-colors',
                      active
                        ? 'bg-surface-elevated text-text-primary font-medium'
                        : 'text-text-secondary hover:bg-surface-elevated/60 hover:text-text-primary',
                    )}
                  >
                    <Icon size={14} className="shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
