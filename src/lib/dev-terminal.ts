import { randomUUID } from "crypto";
import { execSync, spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { isDevToolsEnabled } from "@/lib/dev-tools";

type TerminalSessionStatus = "ready" | "running" | "closed";

interface TerminalSession {
  id: string;
  shell: string;
  cwd: string;
  buffer: string;
  offset: number;
  createdAt: number;
  updatedAt: number;
  status: TerminalSessionStatus;
  exitCode: number | null;
}

interface SessionSnapshot {
  id: string;
  shell: string;
  cwd: string;
  output: string;
  cursor: number;
  mode: "append" | "reset";
  status: TerminalSessionStatus;
  exitCode: number | null;
}

const MAX_BUFFER_SIZE = 200_000;
const STALE_SESSION_MS = 1000 * 60 * 60 * 4;
const SESSION_DIR = path.join(os.tmpdir(), "shipshitshow-dev-terminal");

function ensureSessionDir() {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

function getSessionPath(id: string) {
  ensureSessionDir();
  return path.join(SESSION_DIR, `${id}.json`);
}

function writeSession(session: TerminalSession) {
  fs.writeFileSync(getSessionPath(session.id), JSON.stringify(session), "utf8");
}

function readStoredSession(id: string): TerminalSession {
  const filePath = getSessionPath(id);
  if (!fs.existsSync(filePath)) {
    throw new Error("Terminal session not found");
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as TerminalSession;
}

function appendToSession(session: TerminalSession, chunk: string) {
  session.buffer += chunk;
  session.updatedAt = Date.now();

  if (session.buffer.length > MAX_BUFFER_SIZE) {
    const dropCount = session.buffer.length - MAX_BUFFER_SIZE;
    session.buffer = session.buffer.slice(dropCount);
    session.offset += dropCount;
  }
}

function getGitBranch(cwd: string) {
  try {
    return execSync("git branch --show-current", {
      cwd,
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

function getPrompt(cwd: string) {
  const user = os.userInfo().username;
  const host = os.hostname().split(".")[0];
  const branch = getGitBranch(cwd);
  return `${user}@${host} ${cwd}${branch ? ` [${branch}]` : ""}\n% `;
}

async function runShellCommand(shell: string, cwd: string, command: string) {
  return await new Promise<{ output: string; exitCode: number }>((resolve) => {
    const child = spawn(shell, ["-lc", command], {
      cwd,
      env: {
        ...process.env,
        TERM: process.env.TERM || "xterm-256color",
        COLORTERM: "truecolor",
        FORCE_COLOR: "1",
      },
      stdio: "pipe",
    });

    let output = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });
    child.stderr.on("data", (data) => {
      output += data.toString();
    });
    child.on("close", (code) => {
      resolve({ output, exitCode: code ?? 0 });
    });
  });
}

function buildSnapshot(session: TerminalSession, cursor: number): SessionSnapshot {
  const sessionCursor = Number.isFinite(cursor) ? cursor : 0;
  const currentCursor = session.offset + session.buffer.length;

  if (sessionCursor < session.offset) {
    return {
      id: session.id,
      shell: session.shell,
      cwd: session.cwd,
      output: session.buffer,
      cursor: currentCursor,
      mode: "reset",
      status: session.status,
      exitCode: session.exitCode,
    };
  }

  const relativeCursor = Math.max(0, sessionCursor - session.offset);
  return {
    id: session.id,
    shell: session.shell,
    cwd: session.cwd,
    output: session.buffer.slice(relativeCursor),
    cursor: currentCursor,
    mode: "append",
    status: session.status,
    exitCode: session.exitCode,
  };
}

function resolveCdPath(currentCwd: string, target: string) {
  if (target === "~") return os.homedir();
  if (target.startsWith("~/")) return path.join(os.homedir(), target.slice(2));
  return path.resolve(currentCwd, target);
}

class DevTerminalManager {
  createSession() {
    if (!isDevToolsEnabled()) {
      throw new Error("Dev terminal is disabled");
    }

    this.cleanup();

    const id = randomUUID();
    const shell = process.env.SHELL || "/bin/zsh";
    const cwd = process.cwd();
    const session: TerminalSession = {
      id,
      shell,
      cwd,
      buffer: getPrompt(cwd),
      offset: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "ready",
      exitCode: null,
    };

    writeSession(session);

    return {
      id,
      shell,
      cwd,
      cursor: 0,
      output: session.buffer,
      status: session.status,
    };
  }

  readSession(id: string, cursor: number): SessionSnapshot {
    this.cleanup();
    const session = readStoredSession(id);
    return buildSnapshot(session, cursor);
  }

  async executeCommand(id: string, command: string) {
    this.cleanup();
    const session = readStoredSession(id);
    const normalized = command.replace(/\r/g, "");
    const trimmed = normalized.trim();

    if (trimmed === "clear") {
      session.buffer = getPrompt(session.cwd);
      session.offset = 0;
      session.updatedAt = Date.now();
      session.exitCode = 0;
      session.status = "ready";
      writeSession(session);
      return buildSnapshot(session, 0);
    }

    appendToSession(session, `${normalized}\r\n`);

    if (trimmed.length === 0) {
      appendToSession(session, getPrompt(session.cwd));
      session.exitCode = 0;
      session.status = "ready";
      writeSession(session);
      return buildSnapshot(session, 0);
    }

    if (trimmed === "exit") {
      appendToSession(session, "[session closed]\r\n");
      session.status = "closed";
      session.exitCode = 0;
      writeSession(session);
      return buildSnapshot(session, 0);
    }

    if (trimmed.startsWith("cd ")) {
      const nextPath = trimmed.slice(3).trim();
      const resolved = resolveCdPath(session.cwd, nextPath);

      if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
        session.cwd = resolved;
        session.exitCode = 0;
      } else {
        appendToSession(session, `cd: no such file or directory: ${nextPath}\r\n`);
        session.exitCode = 1;
      }

      session.status = "ready";
      appendToSession(session, getPrompt(session.cwd));
      writeSession(session);
      return buildSnapshot(session, 0);
    }

    session.status = "running";
    writeSession(session);

    const { output, exitCode } = await runShellCommand(session.shell, session.cwd, normalized);
    if (output) {
      appendToSession(session, output.replace(/\n/g, "\r\n"));
    }
    session.exitCode = exitCode;
    session.status = "ready";
    appendToSession(session, getPrompt(session.cwd));
    writeSession(session);
    return buildSnapshot(session, 0);
  }

  closeSession(id: string) {
    const filePath = getSessionPath(id);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private cleanup() {
    ensureSessionDir();
    const now = Date.now();
    for (const fileName of fs.readdirSync(SESSION_DIR)) {
      if (!fileName.endsWith(".json")) continue;
      const filePath = path.join(SESSION_DIR, fileName);
      try {
        const session = JSON.parse(fs.readFileSync(filePath, "utf8")) as TerminalSession;
        if (now - session.updatedAt > STALE_SESSION_MS) {
          fs.unlinkSync(filePath);
        }
      } catch {
        fs.unlinkSync(filePath);
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
