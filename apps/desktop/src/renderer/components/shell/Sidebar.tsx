import { cn } from '@shipshitshow/ui';
import type { ComponentType } from 'react';

export interface ShellNavItem {
  icon: ComponentType<{ size?: number; className?: string }>;
  id: string;
  label: string;
}

interface SidebarProps {
  activeView: string;
  onSelect: (viewId: string) => void;
  primaryItems: ShellNavItem[];
  secondaryItems: ShellNavItem[];
}

function NavItem({
  active,
  item,
  onSelect,
}: {
  active: boolean;
  item: ShellNavItem;
  onSelect: (viewId: string) => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={cn(
        'flex w-full items-center gap-2 rounded-md pl-3 pr-5 py-2 text-[13px] font-normal transition-colors app-region-no-drag',
        active
          ? 'bg-surface-elevated text-text-primary font-medium'
          : 'text-text-secondary hover:bg-surface-elevated/60 hover:text-text-primary',
      )}
    >
      <Icon size={14} className="shrink-0" />
      {item.label}
    </button>
  );
}

export function Sidebar({
  activeView,
  onSelect,
  primaryItems,
  secondaryItems,
}: SidebarProps) {
  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-surface-border bg-surface">
      <div className="flex-1 overflow-y-auto px-2 pt-3 space-y-0.5">
        {primaryItems.map((item) => (
          <NavItem
            key={item.id}
            active={activeView === item.id}
            item={item}
            onSelect={onSelect}
          />
        ))}
      </div>

      <div className="mt-auto space-y-0.5 border-t border-surface-border px-2 py-2">
        {secondaryItems.map((item) => (
          <NavItem
            key={item.id}
            active={activeView === item.id}
            item={item}
            onSelect={onSelect}
          />
        ))}
      </div>
    </aside>
  );
}
