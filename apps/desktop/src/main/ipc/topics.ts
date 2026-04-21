import fs from 'node:fs';
import path from 'node:path';
import { ipcMain } from 'electron';

const APP_DATA_DIR = process.env.APP_DATA_DIR || path.resolve(__dirname, '../../../../app/data');
const LIVESTREAM_DIR = path.join(APP_DATA_DIR, 'livestream');

export function registerTopicsHandlers() {
  ipcMain.handle('topics:list-dates', () => {
    if (!fs.existsSync(LIVESTREAM_DIR)) return [];

    return fs
      .readdirSync(LIVESTREAM_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(d.name))
      .map((d) => d.name)
      .sort()
      .reverse();
  });

  ipcMain.handle('topics:list', (_event, date: string) => {
    const dir = path.join(LIVESTREAM_DIR, date);
    if (!fs.existsSync(dir)) return [];

    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
        const titleMatch = raw.match(/^title:\s*"(.+)"/m);
        const slugMatch = raw.match(/^slug:\s*"(.+)"/m);
        const statusMatch = raw.match(/^status:\s*"(.+)"/m);

        return {
          fileName: f,
          slug: slugMatch?.[1] ?? f.replace('.md', ''),
          status: statusMatch?.[1] ?? 'backlog',
          title: titleMatch?.[1] ?? f.replace('.md', ''),
        };
      });
  });

  ipcMain.handle('topics:read', (_event, { date, fileName }: { date: string; fileName: string }) => {
    const filePath = path.join(LIVESTREAM_DIR, date, fileName);
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf-8');
  });
}
