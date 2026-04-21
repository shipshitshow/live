import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import os from 'node:os';
import { ipcMain } from 'electron';
import type { IPty } from 'node-pty';

let ptyProcess: IPty | null = null;
let cachedEnv: Record<string, string> | null = null;

const SAFE_ENV_KEYS = new Set([
  'HOME',
  'LANG',
  'LC_ALL',
  'LC_CTYPE',
  'PATH',
  'PWD',
  'SHELL',
  'TERM',
  'TMPDIR',
  'USER',
  'XDG_RUNTIME_DIR',
]);

const FALLBACK_SHELLS = [
  '/bin/zsh',
  '/bin/bash',
  '/bin/sh',
  '/usr/bin/zsh',
  '/usr/bin/bash',
  '/usr/local/bin/zsh',
  '/usr/local/bin/bash',
  '/opt/homebrew/bin/zsh',
  '/opt/homebrew/bin/bash',
] as const;

const TRUSTED_SHELLS = new Set<string>(FALLBACK_SHELLS);

function filterEnv(env: Record<string, string>): Record<string, string> {
  const filtered: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    if (SAFE_ENV_KEYS.has(key) && value) {
      filtered[key] = value;
    }
  }

  return filtered;
}

function getShellEnv(): Record<string, string> {
  const configuredShell = process.env.SHELL;

  if (!configuredShell || !TRUSTED_SHELLS.has(configuredShell)) {
    return filterEnv(process.env as Record<string, string>);
  }

  try {
    const output = execFileSync(configuredShell, ['-ilc', 'env'], {
      encoding: 'utf-8',
      timeout: 5_000,
    });
    const shellEnv: Record<string, string> = {};

    for (const line of output.split('\n')) {
      const separatorIndex = line.indexOf('=');

      if (separatorIndex <= 0) {
        continue;
      }

      shellEnv[line.slice(0, separatorIndex)] = line.slice(separatorIndex + 1);
    }

    return filterEnv(shellEnv);
  } catch {
    return filterEnv(process.env as Record<string, string>);
  }
}

function resolveShell(): string {
  const candidates = [process.env.SHELL?.trim(), ...FALLBACK_SHELLS].filter(
    (value): value is string => Boolean(value),
  );

  for (const candidate of candidates) {
    if (!candidate.startsWith('/')) {
      continue;
    }

    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return '/bin/sh';
}

function resolveWorkingDirectory(): string {
  const candidates = [process.env.PWD, process.cwd(), os.homedir()].filter(
    (value): value is string => Boolean(value),
  );

  for (const candidate of candidates) {
    if (!existsSync(candidate)) {
      continue;
    }

    if (statSync(candidate).isDirectory()) {
      return candidate;
    }
  }

  return os.homedir();
}

export function registerTerminalHandlers() {
  ipcMain.handle(
    'terminal:spawn',
    (_event, { cols, rows }: { cols: number; rows: number }) => {
      if (ptyProcess) {
        ptyProcess.kill();
      }

      // Dynamic import because node-pty is a native module
      const pty = require('node-pty') as typeof import('node-pty');

      if (!cachedEnv) {
        cachedEnv = getShellEnv();
      }

      const shell = resolveShell();
      const cwd = resolveWorkingDirectory();
      const safeCols = Number.isFinite(cols)
        ? Math.max(1, Math.floor(cols))
        : 120;
      const safeRows = Number.isFinite(rows)
        ? Math.max(1, Math.floor(rows))
        : 30;

      try {
        ptyProcess = pty.spawn(shell, [], {
          cols: safeCols,
          cwd,
          env: {
            ...cachedEnv,
            FORCE_COLOR: '1',
            SHELL: shell,
            TERM: 'xterm-256color',
          },
          name: 'xterm-256color',
          rows: safeRows,
        });
      } catch (error) {
        ptyProcess = null;

        return {
          cwd,
          error:
            error instanceof Error
              ? `Failed to start shell: ${error.message}`
              : 'Failed to start shell',
          pid: null,
          shell,
        };
      }

      return {
        cwd,
        error: null,
        pid: ptyProcess.pid,
        shell,
      };
    },
  );

  ipcMain.handle('terminal:write', (_event, data: string) => {
    ptyProcess?.write(data);
  });

  ipcMain.handle(
    'terminal:resize',
    (_event, { cols, rows }: { cols: number; rows: number }) => {
      ptyProcess?.resize(cols, rows);
    },
  );

  ipcMain.handle('terminal:kill', () => {
    ptyProcess?.kill();
    ptyProcess = null;
  });

  ipcMain.on('terminal:subscribe', (event) => {
    if (!ptyProcess) return;

    const onData = ptyProcess.onData((data) => {
      event.sender.send('terminal:data', data);
    });

    const onExit = ptyProcess.onExit(({ exitCode }) => {
      event.sender.send('terminal:exit', exitCode);
      onData.dispose();
    });

    event.sender.once('destroyed', () => {
      onData.dispose();
      onExit.dispose();
    });
  });
}
