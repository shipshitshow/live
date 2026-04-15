import { randomUUID } from 'node:crypto';
import {
  type ChildProcessWithoutNullStreams,
  spawn,
} from 'node:child_process';
import type {
  TerminalSessionCreateResponse,
  TerminalSessionStatus,
  TerminalSnapshot,
} from '@/lib/dev-terminal-types';
import { isDevToolsEnabled } from '@/lib/dev-tools';

interface TerminalSession {
  id: string;
  shell: string;
  cwd: string;
  process: ChildProcessWithoutNullStreams;
  buffer: string;
  offset: number;
  createdAt: number;
  updatedAt: number;
  status: TerminalSessionStatus;
  exitCode: number | null;
}

interface SessionSnapshot extends TerminalSnapshot {
  id: string;
  shell: string;
  cwd: string;
}

const MAX_BUFFER_SIZE = 200_000;
const STALE_SESSION_MS = 1000 * 60 * 60 * 4;

function appendToSession(session: TerminalSession, chunk: string) {
  session.buffer += chunk;
  session.updatedAt = Date.now();

  if (session.buffer.length > MAX_BUFFER_SIZE) {
    const dropCount = session.buffer.length - MAX_BUFFER_SIZE;
    session.buffer = session.buffer.slice(dropCount);
    session.offset += dropCount;
  }
}

function buildSnapshot(
  session: TerminalSession,
  cursor: number,
): SessionSnapshot {
  const sessionCursor = Number.isFinite(cursor) ? cursor : 0;
  const currentCursor = session.offset + session.buffer.length;

  if (sessionCursor < session.offset) {
    return {
      cursor: currentCursor,
      cwd: session.cwd,
      exitCode: session.exitCode,
      id: session.id,
      mode: 'reset',
      output: session.buffer,
      shell: session.shell,
      status: session.status,
    };
  }

  const relativeCursor = Math.max(0, sessionCursor - session.offset);
  return {
    cursor: currentCursor,
    cwd: session.cwd,
    exitCode: session.exitCode,
    id: session.id,
    mode: 'append',
    output: session.buffer.slice(relativeCursor),
    shell: session.shell,
    status: session.status,
  };
}

class DevTerminalManager {
  private sessions = new Map<string, TerminalSession>();

  async createSession() {
    if (!isDevToolsEnabled()) {
      throw new Error('Dev terminal is disabled');
    }

    this.cleanup();

    const id = randomUUID();
    const shell = process.env.SHELL || '/bin/zsh';
    const cwd = process.cwd();
    const child = spawn(shell, ['-i'], {
      cwd,
      env: {
        ...process.env,
        COLORTERM: 'truecolor',
        FORCE_COLOR: '1',
        TERM: process.env.TERM || 'xterm-256color',
      },
      stdio: 'pipe',
    });

    const session: TerminalSession = {
      buffer: '',
      createdAt: Date.now(),
      cwd,
      exitCode: null,
      id,
      offset: 0,
      process: child,
      shell,
      status: 'ready',
      updatedAt: Date.now(),
    };

    child.stdout.on('data', (data) => {
      appendToSession(session, data.toString());
      session.status = 'ready';
    });

    child.stderr.on('data', (data) => {
      appendToSession(session, data.toString());
      session.status = 'ready';
    });

    child.on('exit', (exitCode) => {
      session.exitCode = exitCode ?? null;
      session.status = 'closed';
      appendToSession(session, `\r\n[session closed]\r\n`);
    });

    this.sessions.set(id, session);
    await this.waitForInitialOutput(session);

    const response: TerminalSessionCreateResponse = {
      cursor: 0,
      cwd,
      exitCode: session.exitCode,
      id,
      mode: 'append',
      output: session.buffer,
      shell,
      status: session.status,
    };

    return response;
  }

  readSession(id: string, cursor: number): SessionSnapshot {
    this.cleanup();
    const session = this.getSession(id);
    return buildSnapshot(session, cursor);
  }

  async executeCommand(id: string, input: string) {
    this.cleanup();
    const session = this.getSession(id);

    if (session.status === 'closed') {
      return buildSnapshot(session, 0);
    }

    session.status = 'running';
    session.updatedAt = Date.now();
    session.process.stdin.write(input);

    await this.waitForOutput(session);
    return buildSnapshot(session, 0);
  }

  closeSession(id: string) {
    const session = this.sessions.get(id);
    if (!session) return;
    session.process.kill();
    this.sessions.delete(id);
  }

  private getSession(id: string) {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error('Terminal session not found');
    }
    return session;
  }

  private async waitForInitialOutput(
    session: TerminalSession,
    timeoutMs = 300,
  ) {
    const start = session.buffer.length;
    await this.waitForBufferAdvance(session, start, timeoutMs);
  }

  private async waitForOutput(session: TerminalSession, timeoutMs = 60) {
    const start = session.buffer.length;
    await this.waitForBufferAdvance(session, start, timeoutMs);
  }

  private async waitForBufferAdvance(
    session: TerminalSession,
    startLength: number,
    timeoutMs: number,
  ) {
    if (session.buffer.length > startLength || session.status === 'closed') {
      return;
    }

    await new Promise<void>((resolve) => {
      const startedAt = Date.now();
      const timer = setInterval(() => {
        if (
          session.buffer.length > startLength ||
          session.status === 'closed'
        ) {
          clearInterval(timer);
          resolve();
          return;
        }

        if (Date.now() - startedAt >= timeoutMs) {
          clearInterval(timer);
          resolve();
        }
      }, 10);
    });
  }

  private cleanup() {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (
        session.status === 'closed' ||
        now - session.updatedAt > STALE_SESSION_MS
      ) {
        session.process.kill();
        this.sessions.delete(id);
      }
    }
  }
}

declare global {
  var __shipshitTerminalManager: DevTerminalManager | undefined;
}

export function getDevTerminalManager() {
  if (!globalThis.__shipshitTerminalManager) {
    globalThis.__shipshitTerminalManager = new DevTerminalManager();
  }
  return globalThis.__shipshitTerminalManager;
}
