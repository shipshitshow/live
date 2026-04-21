import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    electronAPI: {
      terminal: {
        kill: () => Promise<void>;
        onData: (cb: (data: string) => void) => () => void;
        onExit: (cb: (exitCode: number) => void) => () => void;
        resize: (cols: number, rows: number) => Promise<void>;
        spawn: (cols: number, rows: number) => Promise<{ pid: number }>;
        subscribe: () => void;
        write: (data: string) => Promise<void>;
      };
    };
  }
}

export function TerminalView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<import('xterm').Terminal | null>(null);

  useEffect(() => {
    let cleanupData: (() => void) | null = null;
    let cleanupExit: (() => void) | null = null;

    async function init() {
      if (!containerRef.current) return;

      const { Terminal } = await import('xterm');
      const { FitAddon } = await import('xterm-addon-fit');

      const term = new Terminal({
        cursorBlink: true,
        fontFamily: 'monospace',
        fontSize: 14,
        theme: {
          background: '#0d0d0d',
          cursor: '#ff2d20',
          foreground: '#f0f0f0',
        },
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(containerRef.current!);
      fitAddon.fit();
      termRef.current = term;

      const { terminal } = window.electronAPI;

      await terminal.spawn(term.cols, term.rows);
      terminal.subscribe();

      cleanupData = terminal.onData((data) => term.write(data));
      cleanupExit = terminal.onExit((code) => {
        term.writeln(`\r\n[Process exited with code ${code}]`);
      });

      term.onData((data) => terminal.write(data));
      term.onResize(({ cols, rows }) => terminal.resize(cols, rows));

      const observer = new ResizeObserver(() => fitAddon.fit());
      observer.observe(containerRef.current!);

      return () => {
        observer.disconnect();
        term.dispose();
        terminal.kill();
      };
    }

    const cleanupPromise = init();

    return () => {
      cleanupPromise.then((cleanup) => cleanup?.());
      cleanupData?.();
      cleanupExit?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height: '100%', padding: '4px', width: '100%' }}
    />
  );
}
