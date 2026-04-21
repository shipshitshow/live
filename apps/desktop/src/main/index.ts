import path from 'node:path';
import { app, BrowserWindow } from 'electron';
import { registerCommentsHandlers } from './ipc/comments';
import { registerPipelineHandlers } from './ipc/pipeline';
import { registerReviewHandlers } from './ipc/review';
import { registerTerminalHandlers } from './ipc/terminal';
import { registerTopicsHandlers } from './ipc/topics';
import { registerTrendsHandlers } from './ipc/trends';
import { registerYouTubeAuthHandlers } from './ipc/youtube-auth';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    height: 800,
    title: 'Ship Shit Show',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, '../preload/index.js'),
    },
    width: 1400,
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerTerminalHandlers();
  registerTopicsHandlers();
  registerTrendsHandlers();
  registerPipelineHandlers();
  registerReviewHandlers();
  registerCommentsHandlers();
  registerYouTubeAuthHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
