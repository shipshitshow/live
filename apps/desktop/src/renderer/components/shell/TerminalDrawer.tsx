import { Button } from '@shipshitshow/ui';
import { Maximize2, Minimize2, Terminal, X } from 'lucide-react';
import { type MouseEvent as ReactMouseEvent, useCallback, useRef } from 'react';
import { TerminalView } from '../TerminalView';

const MIN_DRAWER_HEIGHT = 220;

interface TerminalDrawerProps {
  height: number;
  maximized: boolean;
  onClose: () => void;
  onHeightChange: (height: number) => void;
  onToggleMaximize: () => void;
}

export function TerminalDrawer({
  height,
  maximized,
  onClose,
  onHeightChange,
  onToggleMaximize,
}: TerminalDrawerProps) {
  const dragStateRef = useRef<{ startHeight: number; startY: number } | null>(null);

  const handleResizeMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      dragStateRef.current = {
        startHeight: height,
        startY: event.clientY,
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!dragStateRef.current) {
          return;
        }

        const delta = dragStateRef.current.startY - moveEvent.clientY;
        const maxHeight = Math.max(MIN_DRAWER_HEIGHT, window.innerHeight - 160);
        const nextHeight = Math.min(
          maxHeight,
          Math.max(MIN_DRAWER_HEIGHT, dragStateRef.current.startHeight + delta),
        );

        onHeightChange(nextHeight);
      };

      const handleMouseUp = () => {
        dragStateRef.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    },
    [height, onHeightChange],
  );

  return (
    <section
      className="flex shrink-0 flex-col border-t border-surface-border bg-surface-elevated"
      style={maximized ? { flex: '1 1 0', minHeight: 0 } : { height }}
    >
      {!maximized && (
        <button
          type="button"
          aria-label="Resize terminal drawer"
          className="h-1 shrink-0 cursor-ns-resize bg-transparent transition-colors hover:bg-accent-red/30"
          onMouseDown={handleResizeMouseDown}
        />
      )}

      <div className="flex items-center justify-between gap-3 border-b border-surface-border px-3 py-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-accent-red" />
            <span className="text-sm font-semibold text-text-primary">Terminal</span>
          </div>
          <p className="mt-0.5 text-xs text-text-muted">
            Local shell drawer. Toggle with <span className="font-medium text-text-secondary">Cmd/Ctrl+J</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={onToggleMaximize}
          >
            {maximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {maximized ? 'Restore' : 'Maximize'}
          </Button>
          <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={onClose}>
            <X size={14} />
            Hide
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <TerminalView />
      </div>
    </section>
  );
}
