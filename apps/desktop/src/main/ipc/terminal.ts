import os from 'node:os';
import { ipcMain } from 'electron';
import type { IPty } from 'node-pty';

let ptyProcess: IPty | null = null;

export function registerTerminalHandlers() {
  ipcMain.handle(
    'terminal:spawn',
    (_event, { cols, rows }: { cols: number; rows: number }) => {
      if (ptyProcess) {
        ptyProcess.kill();
      }

      // Dynamic import because node-pty is a native module
      const pty = require('node-pty') as typeof import('node-pty');
      const shell =
        process.env.SHELL ||
        (process.platform === 'win32' ? 'powershell.exe' : 'bash');

      ptyProcess = pty.spawn(shell, [], {
        cols,
        cwd: os.homedir(),
        env: process.env as Record<string, string>,
        name: 'xterm-256color',
        rows,
      });

      return { pid: ptyProcess.pid };
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
