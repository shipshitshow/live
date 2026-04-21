import { Button, cn } from '@shipshitshow/ui';
import { PanelLeftClose, PanelLeftOpen, Terminal } from 'lucide-react';

interface TitlebarProps {
  activeViewLabel: string;
  onToggleSidebar: () => void;
  onToggleTerminal: () => void;
  sidebarCollapsed: boolean;
  terminalVisible: boolean;
}

export function Titlebar({
  activeViewLabel,
  onToggleSidebar,
  onToggleTerminal,
  sidebarCollapsed,
  terminalVisible,
}: TitlebarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-surface-border bg-[linear-gradient(180deg,rgba(20,20,20,0.98),rgba(13,13,13,0.96))] px-3">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen size={16} />
          ) : (
            <PanelLeftClose size={16} />
          )}
        </Button>
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.18em] text-text-muted uppercase">
            Ship Shit Show
          </div>
          <div className="truncate text-sm font-semibold text-text-primary">
            {activeViewLabel}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-[11px] text-text-muted md:block">
          Cmd/Ctrl+J
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'shrink-0 border border-transparent',
            terminalVisible &&
              'border-accent-red/20 bg-accent-red/10 text-text-primary',
          )}
          onClick={onToggleTerminal}
        >
          <Terminal
            size={14}
            className={terminalVisible ? 'text-accent-red' : ''}
          />
          Terminal
        </Button>
      </div>
    </header>
  );
}
