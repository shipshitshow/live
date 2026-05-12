'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ALL_TABS = {
  'talking-points': 'Talking Points',
  transcript: 'Transcript',
} as const;

type LivestreamTab = keyof typeof ALL_TABS;

export function LivestreamTabsClient({
  date,
  hasTranscript,
  streamSlug,
}: {
  date: string;
  hasTranscript: boolean;
  streamSlug: string;
}) {
  const pathname = usePathname();
  const activeTab: LivestreamTab = pathname.endsWith('/transcript')
    ? 'transcript'
    : 'talking-points';

  const pathSlug = encodeURIComponent(streamSlug ?? date);

  const tabs = Object.entries(ALL_TABS).filter(
    ([tab]) => tab !== 'transcript' || hasTranscript,
  );

  return (
    <div className="flex flex-wrap gap-2 border-b border-surface-border">
      {tabs.map(([tab, label]) => {
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
