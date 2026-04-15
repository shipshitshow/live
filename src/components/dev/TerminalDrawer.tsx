"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TerminalSessionCreateResponse, TerminalSnapshot } from "@/lib/dev-terminal-types";
import type { TerminalPromptEventDetail } from "@/lib/dev-terminal-events";

const TERMINAL_OPEN_KEY = "shipshitshow.devTerminal.open";
const TERMINAL_AGENT_KEY = "shipshitshow.devTerminal.agent";

type AgentMode = "shell" | "codex" | "claude";

function shellQuote(value: string) {
  return `'${value.replace(/'/g, `'\"'\"'`)}'`;
}

function buildAgentCommand(mode: AgentMode, prompt: string) {
  if (mode === "shell") return prompt;
  return `${mode} ${shellQuote(prompt)}`;
}

export function TerminalDrawer() {
  const drawerHeight = 360;
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const [status, setStatus] = useState<"idle" | "connecting" | "ready" | "running" | "closed" | "error">("idle");
  const [agentMode, setAgentMode] = useState<AgentMode>("codex");
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [inputBuffer, setInputBuffer] = useState("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<import("xterm").Terminal | null>(null);
  const fitAddonRef = useRef<import("xterm-addon-fit").FitAddon | null>(null);
  const inputBufferRef = useRef("");
  const statusRef = useRef(status);
  const writeToShellRef = useRef<(input: string) => Promise<void>>(async () => {});

  const title = useMemo(() => {
    if (status === "connecting") return "Connecting...";
    if (status === "error") return "Terminal unavailable";
    if (status === "closed") return "Terminal exited";
    if (status === "running") return "Running command...";
    return "Terminal";
  }, [status]);

  const writeToShell = useCallback(async (input: string) => {
    if (!sessionId) return;
    const res = await fetch("/api/dev/terminal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "exec", sessionId, input }),
    });
    if (!res.ok) {
      setStatus("error");
      return;
    }

    const data = (await res.json()) as TerminalSnapshot;
    const terminal = terminalRef.current;
    if (!terminal) return;

    if (data.mode === "reset") {
      terminal.reset();
    }
    if (data.output) {
      terminal.write(data.output);
    }

    setCursor(data.cursor);
    setStatus(data.status);
  }, [sessionId]);

  useEffect(() => {
    inputBufferRef.current = inputBuffer;
  }, [inputBuffer]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    writeToShellRef.current = writeToShell;
  }, [writeToShell]);

  const createSession = useCallback(async () => {
    setStatus("connecting");
    const res = await fetch("/api/dev/terminal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create" }),
    });

    if (!res.ok) {
      setStatus("error");
      return null;
    }

    const data = (await res.json()) as TerminalSessionCreateResponse;
    setSessionId(data.id);
    setCursor(data.cursor);
    setStatus(data.status);
    setInputBuffer("");
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
    const savedAgent = window.localStorage.getItem(TERMINAL_AGENT_KEY) as AgentMode | null;
    if (savedOpen === "1") {
      setOpen(true);
    }
    if (savedAgent === "shell" || savedAgent === "codex" || savedAgent === "claude") {
      setAgentMode(savedAgent);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(TERMINAL_OPEN_KEY, open ? "1" : "0");
  }, [open]);

  useEffect(() => {
    document.body.style.setProperty("--dev-terminal-height", `${drawerHeight}px`);
    document.body.classList.toggle("terminal-open", open);

    return () => {
      document.body.classList.remove("terminal-open");
      document.body.style.removeProperty("--dev-terminal-height");
    };
  }, [drawerHeight, open]);

  useEffect(() => {
    window.localStorage.setItem(TERMINAL_AGENT_KEY, agentMode);
  }, [agentMode]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [{ Terminal }, { FitAddon }] = await Promise.all([
        import("xterm"),
        import("xterm-addon-fit"),
      ]);
      if (cancelled) return;

      const terminal = new Terminal({
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: 12,
        theme: {
          background: "#0f0f10",
          foreground: "#f0f0f0",
          cursor: "#ff2d20",
          selectionBackground: "rgba(255,45,32,0.25)",
          black: "#0f0f10",
          brightBlack: "#6b6b6b",
          red: "#ff5b50",
          brightRed: "#ff7b72",
          green: "#77dd77",
          brightGreen: "#98fb98",
          yellow: "#fbbf24",
          brightYellow: "#ffd166",
          blue: "#60a5fa",
          brightBlue: "#93c5fd",
          magenta: "#f472b6",
          brightMagenta: "#f9a8d4",
          cyan: "#22d3ee",
          brightCyan: "#67e8f9",
          white: "#d4d4d4",
          brightWhite: "#ffffff",
        },
        convertEol: true,
        cursorBlink: true,
        allowTransparency: false,
      });
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);

      terminal.onData((data) => {
        if (statusRef.current === "running" || statusRef.current === "connecting") return;

        if (data === "\r") {
          const command = inputBufferRef.current;
          terminal.write("\r\n");
          setInputBuffer("");
          setStatus("running");
          void writeToShellRef.current(command);
          return;
        }

        if (data === "\u0003") {
          terminal.write("^C\r\n");
          setInputBuffer("");
          setStatus("running");
          void writeToShellRef.current("");
          return;
        }

        if (data === "\u007f") {
          if (inputBufferRef.current.length === 0) return;
          terminal.write("\b \b");
          setInputBuffer((prev) => prev.slice(0, -1));
          return;
        }

        if (data >= " " || data === "\t") {
          terminal.write(data);
          setInputBuffer((prev) => prev + data);
        }
      });

      terminalRef.current = terminal;
      fitAddonRef.current = fitAddon;

      if (open && containerRef.current && !containerRef.current.hasChildNodes()) {
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
    if (!open || !containerRef.current || !terminalRef.current || !fitAddonRef.current) return;
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
    if (!pendingPrompt) return;
    if (!sessionId || (status !== "ready" && status !== "closed")) return;

    const command = buildAgentCommand(agentMode, pendingPrompt);
    terminalRef.current?.write(command);
    setInputBuffer(command);
    setPendingPrompt(null);
  }, [agentMode, pendingPrompt, sessionId, status]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "j") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    const onPrompt = (event: WindowEventMap["shipshitshow:terminal-prompt"]) => {
      setOpen(true);
      setPendingPrompt(event.detail.prompt);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("shipshitshow:terminal-prompt", onPrompt);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("shipshitshow:terminal-prompt", onPrompt);
    };
  }, []);

  const handleNewSession = useCallback(async () => {
    if (sessionId) {
      await fetch(`/api/dev/terminal?sessionId=${sessionId}`, { method: "DELETE" });
    }
    setSessionId(null);
    setCursor(0);
    setInputBuffer("");
    terminalRef.current?.reset();
    await createSession();
  }, [createSession, sessionId]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleClear = useCallback(() => {
    terminalRef.current?.clear();
    setInputBuffer("");
    setStatus("running");
    void writeToShell("clear");
  }, [writeToShell]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-surface-border bg-surface-card/95 px-3 py-2 text-xs font-medium text-text-secondary shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur hover:text-text-primary"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <rect x="1.5" y="2" width="13" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.25" />
          <path d="M4.5 5.5L6.75 7.75L4.5 10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8.25 10H11.25" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
        Terminal
        <span className="rounded border border-surface-border px-1.5 py-0.5 text-[10px] text-text-muted">
          ⌘J
        </span>
      </button>

      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-surface-border bg-[#0b0b0c] shadow-[0_-20px_60px_rgba(0,0,0,0.55)] transition-transform duration-200 ${
          open ? "translate-y-0" : "translate-y-[calc(100%-1px)]"
        }`}
        style={{ height: drawerHeight }}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-text-primary">{title}</span>
            <span className="text-[10px] text-text-muted">
              Cursor-style local shell drawer
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={agentMode}
              onChange={(event) => setAgentMode(event.target.value as AgentMode)}
              className="rounded-md border border-surface-border bg-surface-card px-2 py-1 text-[10px] text-text-secondary"
            >
              <option value="codex">Codex</option>
              <option value="claude">Claude</option>
              <option value="shell">Shell</option>
            </select>
            <button
              type="button"
              onClick={handleNewSession}
              className="rounded-md border border-surface-border bg-surface-card px-2 py-1 text-[10px] text-text-secondary hover:text-text-primary"
            >
              New
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md border border-surface-border bg-surface-card px-2 py-1 text-[10px] text-text-secondary hover:text-text-primary"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-surface-border bg-surface-card px-2 py-1 text-[10px] text-text-secondary hover:text-text-primary"
            >
              Hide
            </button>
          </div>
        </div>

        <div className="h-[calc(100%-41px)] bg-[#0f0f10] px-2 py-2">
          <div ref={containerRef} className="h-full w-full overflow-hidden rounded-lg border border-surface-border bg-[#0f0f10]" />
        </div>
      </div>
    </>
  );
}
