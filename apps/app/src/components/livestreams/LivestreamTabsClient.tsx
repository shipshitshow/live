'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TAB_META = {
  'talking-points': 'Talking Points',
  transcript: 'Transcript',
} as const;

type LivestreamTab = keyof typeof TAB_META;

export function LivestreamTabsClient({
  date,
  streamSlug,
}: {
  date: string;
  streamSlug: string;
}) {
  const pathname = usePathname();
  const activeTab: LivestreamTab = pathname.endsWith('/transcript')
    ? 'transcript'
    : 'talking-points';

  const pathSlug = encodeURIComponent(streamSlug ?? date);

  return (
    <div className="flex flex-wrap gap-2 border-b border-surface-border">
      {Object.entries(TAB_META).map(([tab, label]) => {
        const isActive = tab === activeTab;
        return (
          <Link
            key={tab}
            href={`/livestreams/${pathSlug}/${tab}`}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              isActive
                ? 'border-accent-red text-text-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
