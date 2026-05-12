'use client';

import { useSidebarState } from '@/components/livestreams/SidebarStateContext';

export function CollapsibleSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const { collapsed } = useSidebarState();

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-auto">
      <div
        className={`transition-all duration-200 ${
          collapsed ? 'lg:w-0 lg:overflow-hidden lg:opacity-0' : 'lg:w-[380px]'
        } w-full`}
      >
        {children}
      </div>
    </aside>
  );
}
