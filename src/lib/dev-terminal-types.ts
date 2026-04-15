export type TerminalSessionStatus = "ready" | "running" | "closed";

export interface TerminalSnapshot {
  output: string;
  cursor: number;
  mode: "append" | "reset";
  status: TerminalSessionStatus;
  exitCode: number | null;
}

export interface TerminalSessionCreateResponse extends TerminalSnapshot {
  id: string;
  shell: string;
  cwd: string;
}
