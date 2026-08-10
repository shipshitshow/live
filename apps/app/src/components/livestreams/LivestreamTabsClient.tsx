'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ALL_TABS = [
  { label: 'Talking Points', tab: 'talking-points' },
  { label: 'Resources', tab: 'resources' },
  { label: 'X Posts', tab: 'x-posts' },
  { label: 'Transcript', tab: 'transcript' },
] as const;

type LivestreamTab = (typeof ALL_TABS)[number]['tab'];

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
  const activeTab: LivestreamTab =
    ALL_TABS.find(({ tab }) => pathname.endsWith(`/${tab}`))?.tab ??
    'talking-points';

  const pathSlug = encodeURIComponent(streamSlug ?? date);

  const tabs = ALL_TABS.filter(
    ({ tab }) => tab !== 'transcript' || hasTranscript,
  );

  return (
    <div className="flex flex-wrap gap-2 border-b border-surface-border">
      {tabs.map(({ label, tab }) => {
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
