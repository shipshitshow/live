'use client';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getProductionApp, getProductionPageLabel } from '@/lib/app-navigation';

export function AppTitlebar({
  onOpenNavigation,
}: {
  onOpenNavigation: () => void;
}) {
  const pathname = usePathname();
  const app = getProductionApp(pathname);
  const label = getProductionPageLabel(pathname);
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 px-3 text-[13px] md:px-4">
      <button
        type="button"
        onClick={onOpenNavigation}
        aria-label="Open navigation"
        className="flex size-9 shrink-0 items-center justify-center rounded-md text-text-secondary hover:bg-surface-elevated md:hidden"
      >
        <Menu size={18} />
      </button>
      {app && (
        <app.icon
          size={15}
          className="hidden shrink-0 text-text-secondary md:block"
          aria-hidden="true"
        />
      )}
      <span className="shrink-0 text-text-secondary">
        {app?.label ?? 'Production'}
      </span>
      {label !== app?.label && (
        <>
          <span aria-hidden="true" className="text-text-muted">
            /
          </span>
          <span className="truncate text-text-primary">{label}</span>
        </>
      )}
    </header>
  );
}
