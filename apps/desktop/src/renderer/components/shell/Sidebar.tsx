import { Button, cn } from '@shipshitshow/ui';

export interface ShellNavItem {
  description: string;
  id: string;
  label: string;
  shortLabel: string;
}

interface SidebarProps {
  activeView: string;
  collapsed: boolean;
  onSelect: (viewId: string) => void;
  primaryItems: ShellNavItem[];
  secondaryItems: ShellNavItem[];
}

function SidebarItem({
  active,
  collapsed,
  item,
  onSelect,
}: {
  active: boolean;
  collapsed: boolean;
  item: ShellNavItem;
  onSelect: (viewId: string) => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => onSelect(item.id)}
      className={cn(
        'h-auto w-full rounded-xl border border-transparent px-3 py-3 transition-colors',
        collapsed ? 'justify-center' : 'justify-start',
        active
          ? 'border-accent-red/20 bg-accent-red/5 text-text-primary'
          : 'text-text-secondary hover:bg-surface-card/80 hover:text-text-primary',
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg border text-[11px] font-semibold uppercase tracking-[0.14em]',
          collapsed ? 'size-9' : 'size-10',
          active
            ? 'border-accent-red/30 bg-accent-red/10 text-accent-red'
            : 'border-surface-border bg-surface-card text-text-muted',
        )}
      >
        {item.shortLabel}
      </span>
      {!collapsed && (
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-sm font-medium text-inherit">{item.label}</span>
          <span className="mt-0.5 block text-xs text-text-muted">{item.description}</span>
        </span>
      )}
    </Button>
  );
}

export function Sidebar({
  activeView,
  collapsed,
  onSelect,
  primaryItems,
  secondaryItems,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col border-r border-surface-border bg-surface-elevated/90 transition-[width]',
        collapsed ? 'w-[84px]' : 'w-[244px]',
      )}
    >
      <div
        className={cn(
          'border-b border-surface-border',
          collapsed ? 'px-3 py-3' : 'px-4 py-4',
        )}
      >
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-accent-red/20 bg-accent-red/10 text-[11px] font-semibold tracking-[0.18em] text-accent-red uppercase">
            SS
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[10px] tracking-[0.18em] text-text-muted uppercase">
                Workspace
              </div>
              <div className="truncate text-sm font-semibold text-text-primary">
                Ship Shit Show
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-2">
        <div className="space-y-1.5">
          {primaryItems.map((item) => (
            <SidebarItem
              key={item.id}
              active={activeView === item.id}
              collapsed={collapsed}
              item={item}
              onSelect={onSelect}
            />
          ))}
        </div>

        <div className="mt-auto space-y-1.5 border-t border-surface-border pt-3">
          {secondaryItems.map((item) => (
            <SidebarItem
              key={item.id}
              active={activeView === item.id}
              collapsed={collapsed}
              item={item}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
