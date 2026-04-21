import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  terminal: {
    kill: () => ipcRenderer.invoke('terminal:kill'),
    onData: (callback: (data: string) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, data: string) =>
        callback(data);
      ipcRenderer.on('terminal:data', handler);
      return () => ipcRenderer.removeListener('terminal:data', handler);
    },
    onExit: (callback: (exitCode: number) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, exitCode: number) =>
        callback(exitCode);
      ipcRenderer.on('terminal:exit', handler);
      return () => ipcRenderer.removeListener('terminal:exit', handler);
    },
    resize: (cols: number, rows: number) =>
      ipcRenderer.invoke('terminal:resize', { cols, rows }),
    spawn: (cols: number, rows: number) =>
      ipcRenderer.invoke('terminal:spawn', { cols, rows }),
    subscribe: () => ipcRenderer.send('terminal:subscribe'),
    write: (data: string) => ipcRenderer.invoke('terminal:write', data),
  },
  topics: {
    list: (date: string) => ipcRenderer.invoke('topics:list', date),
    listDates: () => ipcRenderer.invoke('topics:list-dates'),
    read: (date: string, fileName: string) =>
      ipcRenderer.invoke('topics:read', { date, fileName }),
  },
});
