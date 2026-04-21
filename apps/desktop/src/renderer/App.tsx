import { useCallback, useEffect, useMemo, useState } from 'react';
import { TerminalView } from './components/TerminalView';
import { KanbanBoard } from './components/topics/KanbanBoard';
import { TrendsView } from './components/trends/TrendsView';
import { ReviewQueueView } from './components/review/ReviewQueueView';
import { CommentsView } from './components/comments/CommentsView';
import { YouTubeAuthView } from './components/auth/YouTubeAuthView';
import {
  type ShellNavItem,
  Sidebar,
} from './components/shell/Sidebar';
import { TerminalDrawer } from './components/shell/TerminalDrawer';
import { Titlebar } from './components/shell/Titlebar';

const PRIMARY_VIEWS = [
  {
    description: 'Daily livestream topics and backlog',
    id: 'topics',
    label: 'Topics',
    shortLabel: 'TP',
  },
  {
    description: 'Trend research and deeper searches',
    id: 'trends',
    label: 'Trends',
    shortLabel: 'TR',
  },
  {
    description: 'Review queue and content generation',
    id: 'review',
    label: 'Review',
    shortLabel: 'RV',
  },
  {
    description: 'Comment triage and reply drafting',
    id: 'comments',
    label: 'Comments',
    shortLabel: 'CM',
  },
] as const satisfies readonly ShellNavItem[];

const SECONDARY_VIEWS = [
  {
    description: 'YouTube auth and local app setup',
    id: 'settings',
    label: 'Settings',
    shortLabel: 'ST',
  },
] as const satisfies readonly ShellNavItem[];

type ViewId = (typeof PRIMARY_VIEWS)[number]['id'] | (typeof SECONDARY_VIEWS)[number]['id'];

function renderView(activeView: ViewId) {
  switch (activeView) {
    case 'topics':
      return <KanbanBoard />;
    case 'trends':
      return <TrendsView />;
    case 'review':
      return <ReviewQueueView />;
    case 'comments':
      return <CommentsView />;
    case 'settings':
      return <YouTubeAuthView />;
    default:
      return <TerminalView />;
  }
}

export function App() {
  const [activeView, setActiveView] = useState<ViewId>('topics');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [terminalVisible, setTerminalVisible] = useState(true);
  const [terminalMaximized, setTerminalMaximized] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(280);

  const activeViewLabel =
    [...PRIMARY_VIEWS, ...SECONDARY_VIEWS].find((item) => item.id === activeView)?.label ??
    'Topics';

  const hideMainContent = terminalVisible && terminalMaximized;

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((current) => !current);
  }, []);

  const toggleTerminal = useCallback(() => {
    setTerminalVisible((current) => {
      const nextVisible = !current;
      if (!nextVisible) {
        setTerminalMaximized(false);
      }
      return nextVisible;
    });
  }, []);

  const toggleTerminalMaximized = useCallback(() => {
    setTerminalVisible(true);
    setTerminalMaximized((current) => !current);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        Boolean(target?.isContentEditable);

      if (isEditable) {
        return;
      }

      const modifierPressed = event.metaKey || event.ctrlKey;

      if (!modifierPressed || event.altKey || event.shiftKey) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 'b') {
        event.preventDefault();
        toggleSidebar();
      }

      if (key === 'j') {
        event.preventDefault();
        toggleTerminal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, toggleTerminal]);

  const content = useMemo(() => renderView(activeView), [activeView]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface text-text-primary">
      <Titlebar
        activeViewLabel={activeViewLabel}
        onToggleSidebar={toggleSidebar}
        onToggleTerminal={toggleTerminal}
        sidebarCollapsed={sidebarCollapsed}
        terminalVisible={terminalVisible}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          activeView={activeView}
          collapsed={sidebarCollapsed}
          onSelect={(viewId) => setActiveView(viewId as ViewId)}
          primaryItems={[...PRIMARY_VIEWS]}
          secondaryItems={[...SECONDARY_VIEWS]}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {hideMainContent ? (
            <TerminalDrawer
              height={terminalHeight}
              maximized={terminalMaximized}
              onClose={toggleTerminal}
              onHeightChange={setTerminalHeight}
              onToggleMaximize={toggleTerminalMaximized}
            />
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-hidden">{content}</div>
              {terminalVisible && (
                <TerminalDrawer
                  height={terminalHeight}
                  maximized={terminalMaximized}
                  onClose={toggleTerminal}
                  onHeightChange={setTerminalHeight}
                  onToggleMaximize={toggleTerminalMaximized}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
