'use client';

import { Eraser, PanelBottomClose, SquarePlus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  TerminalSessionCreateResponse,
  TerminalSnapshot,
} from '@/lib/dev-terminal-types';
import { parseJsonResponse } from '@/lib/parse-json-response';

const TERMINAL_OPEN_KEY = 'shipshitshow.devTerminal.open';
const TERMINAL_AGENT_KEY = 'shipshitshow.devTerminal.agent';

type AgentMode = 'shell' | 'codex' | 'claude';

function shellQuote(value: string) {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

function buildAgentCommand(mode: AgentMode, prompt: string) {
  if (mode === 'shell') return prompt;
  return `${mode} ${shellQuote(prompt)}`;
}

export function TerminalDrawer() {
  const drawerHeight = 360;
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const [status, setStatus] = useState<
    'idle' | 'connecting' | 'ready' | 'running' | 'closed' | 'error'
  >('idle');
  const [agentMode, setAgentMode] = useState<AgentMode>('codex');
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<import('xterm').Terminal | null>(null);
  const fitAddonRef = useRef<import('xterm-addon-fit').FitAddon | null>(null);
  const cursorRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);
  const statusRef = useRef(status);
  const writeToShellRef = useRef<(input: string) => Promise<void>>(
    async () => {},
  );
  const writeChainRef = useRef(Promise.resolve());

  const title = useMemo(() => {
    if (status === 'connecting') return 'Connecting...';
    if (status === 'error') return 'Terminal unavailable';
    if (status === 'closed') return 'Terminal exited';
    if (status === 'running') return 'Running command...';
    return 'Terminal';
  }, [status]);

  const writeToShell = useCallback(
    async (input: string) => {
      if (!sessionId) return;

      writeChainRef.current = writeChainRef.current.then(async () => {
        const res = await fetch('/api/dev/terminal', {
          body: JSON.stringify({ action: 'exec', input, sessionId }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });
        if (!res.ok) {
          setStatus('error');
          return;
        }

        const data = await parseJsonResponse<TerminalSnapshot>(res);
        setCursor(data.cursor);
        setStatus(data.status);
      });

      await writeChainRef.current;
    },
    [sessionId],
  );

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    writeToShellRef.current = writeToShell;
  }, [writeToShell]);

  const createSession = useCallback(async () => {
    setStatus('connecting');
    const res = await fetch('/api/dev/terminal', {
      body: JSON.stringify({ action: 'create' }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    if (!res.ok) {
      setStatus('error');
      return null;
    }

    const data = await parseJsonResponse<TerminalSessionCreateResponse>(res);
    setSessionId(data.id);
    setCursor(data.cursor);
    setStatus(data.status);
    terminalRef.current?.reset();
    if (data.output) {
      terminalRef.current?.write(data.output);
    }
    return data.id;
  }, []);

  const ensureSession = useCallback(async () => {
    if (sessionId) return sessionId;
    return createSession();
  }, [createSession, sessionId]);

  useEffect(() => {
    const savedOpen = window.localStorage.getItem(TERMINAL_OPEN_KEY);
    const savedAgent = window.localStorage.getItem(
      TERMINAL_AGENT_KEY,
    ) as AgentMode | null;
    if (savedOpen === '1') {
      setOpen(true);
    }
    if (
      savedAgent === 'shell' ||
      savedAgent === 'codex' ||
      savedAgent === 'claude'
    ) {
      setAgentMode(savedAgent);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(TERMINAL_OPEN_KEY, open ? '1' : '0');
  }, [open]);

  useEffect(() => {
    document.body.style.setProperty(
      '--dev-terminal-height',
      `${drawerHeight}px`,
    );
    document.body.classList.toggle('terminal-open', open);

    return () => {
      document.body.classList.remove('terminal-open');
      document.body.style.removeProperty('--dev-terminal-height');
    };
  }, [drawerHeight, open]);

  useEffect(() => {
    window.localStorage.setItem(TERMINAL_AGENT_KEY, agentMode);
  }, [agentMode]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [{ Terminal }, { FitAddon }] = await Promise.all([
        import('xterm'),
        import('xterm-addon-fit'),
      ]);
      if (cancelled) return;

      const terminal = new Terminal({
        allowTransparency: false,
        convertEol: true,
        cursorBlink: true,
        fontFamily:
          'ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, Consolas, monospace',
        fontSize: 12,
        theme: {
          background: '#0f0f10',
          black: '#0f0f10',
          blue: '#60a5fa',
          brightBlack: '#6b6b6b',
          brightBlue: '#93c5fd',
          brightCyan: '#67e8f9',
          brightGreen: '#98fb98',
          brightMagenta: '#f9a8d4',
          brightRed: '#ff7b72',
          brightWhite: '#ffffff',
          brightYellow: '#ffd166',
          cursor: '#ff2d20',
          cyan: '#22d3ee',
          foreground: '#f0f0f0',
          green: '#77dd77',
          magenta: '#f472b6',
          red: '#ff5b50',
          selectionBackground: 'rgba(255,45,32,0.25)',
          white: '#d4d4d4',
          yellow: '#fbbf24',
        },
      });
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.attachCustomKeyEventHandler((event) => {
        if (
          (event.metaKey || event.ctrlKey) &&
          event.key.toLowerCase() === 'l'
        ) {
          event.preventDefault();
          terminal.clear();
          void writeToShellRef.current('\u000c');
          return false;
        }
        return true;
      });

      terminal.onData((data) => {
        if (statusRef.current === 'connecting' || statusRef.current === 'error')
          return;
        if (!sessionIdRef.current && data !== '\u0003' && data !== '\u000c') {
          return;
        }
        setStatus('running');
        void writeToShellRef.current(data);
      });

      terminalRef.current = terminal;
      fitAddonRef.current = fitAddon;

      if (
        open &&
        containerRef.current &&
        !containerRef.current.hasChildNodes()
      ) {
        terminal.open(containerRef.current);
        fitAddon.fit();
        terminal.focus();
      }
    })();

    return () => {
      cancelled = true;
      terminalRef.current?.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (
      !open ||
      !containerRef.current ||
      !terminalRef.current ||
      !fitAddonRef.current
    )
      return;
    const terminal = terminalRef.current;

    if (!containerRef.current.hasChildNodes()) {
      terminal.open(containerRef.current);
    }

    fitAddonRef.current.fit();
    terminal.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    void ensureSession();
  }, [ensureSession, open]);

  useEffect(() => {
    if (!open || !sessionId) return;

    const poll = window.setInterval(async () => {
      const res = await fetch(
        `/api/dev/terminal?sessionId=${sessionId}&cursor=${cursorRef.current}`,
        {
          cache: 'no-store',
        },
      );

      if (!res.ok) {
        setStatus('error');
        return;
      }

      const data = await parseJsonResponse<TerminalSnapshot>(res);
      const terminal = terminalRef.current;
      if (!terminal) return;

      if (data.mode === 'reset') {
        terminal.reset();
      }
      if (data.output) {
        terminal.write(data.output);
      }

      setCursor(data.cursor);
      setStatus(data.status);
    }, 120);

    return () => window.clearInterval(poll);
  }, [open, sessionId]);

  useEffect(() => {
    if (!pendingPrompt) return;
    if (!sessionId) return;

    const command = buildAgentCommand(agentMode, pendingPrompt);
    void writeToShellRef.current(`${command}\r`);
    setPendingPrompt(null);
  }, [agentMode, pendingPrompt, sessionId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      if (
        open &&
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 'l'
      ) {
        event.preventDefault();
        terminalRef.current?.clear();
        void writeToShellRef.current('\u000c');
      }
    };

    const onPrompt = (
      event: WindowEventMap['shipshitshow:terminal-prompt'],
    ) => {
      setOpen(true);
      setPendingPrompt(event.detail.prompt);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('shipshitshow:terminal-prompt', onPrompt);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('shipshitshow:terminal-prompt', onPrompt);
    };
  }, []);

  const handleNewSession = useCallback(async () => {
    if (sessionId) {
      await fetch(`/api/dev/terminal?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
    }
    setSessionId(null);
    setCursor(0);
    terminalRef.current?.reset();
    await createSession();
  }, [createSession, sessionId]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleClear = useCallback(() => {
    terminalRef.current?.clear();
    setStatus('running');
    void writeToShell('\u000c');
  }, [writeToShell]);

  return (
    <>
      {!open ? (
        <Button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-surface-card/95 text-xs text-text-secondary shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur hover:text-text-primary"
          aria-expanded={false}
          aria-controls="dev-terminal-drawer"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect
              x="1.5"
              y="2"
              width="13"
              height="11.5"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.25"
            />
            <path
              d="M4.5 5.5L6.75 7.75L4.5 10"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.25 10H11.25"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </svg>
          Terminal
          <span className="rounded border border-surface-border px-1.5 py-0.5 text-[10px] text-text-muted">
            ⌘J
          </span>
        </Button>
      ) : null}

      <div
        id="dev-terminal-drawer"
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-surface-border bg-[#0b0b0c] shadow-[0_-20px_60px_rgba(0,0,0,0.55)] transition-transform duration-200 ${
          open ? 'translate-y-0' : 'translate-y-[calc(100%-1px)]'
        }`}
        style={{ height: drawerHeight }}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-text-primary">
              {title}
            </span>
            <span className="text-[10px] text-text-muted">
              Cursor-style local shell drawer
            </span>
            <Select
              value={agentMode}
              onValueChange={(value) => setAgentMode(value as AgentMode)}
            >
              <SelectTrigger className="ml-2 h-7 rounded-md px-2 py-1 text-[10px] text-text-secondary">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="codex">Codex</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="shell">Shell</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleNewSession}
              className="rounded-md px-2"
              aria-label="Start new terminal session"
              title="New session"
            >
              <SquarePlus className="size-3.5" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleClear}
              className="rounded-md px-2"
              aria-label="Clear terminal output"
              title="Clear terminal"
            >
              <Eraser className="size-3.5" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleClose}
              className="rounded-md px-2"
              aria-label="Hide terminal drawer"
              title="Hide terminal"
            >
              <PanelBottomClose className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="h-[calc(100%-41px)] bg-[#0f0f10] px-2 py-2">
          <div
            ref={containerRef}
            className="h-full w-full overflow-hidden rounded-lg border border-surface-border bg-[#0f0f10]"
          />
        </div>
      </div>
    </>
  );
}
