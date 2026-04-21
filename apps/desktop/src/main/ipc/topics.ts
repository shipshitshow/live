import type { TopicStatus } from '@shipshitshow/types';
import { ipcMain } from 'electron';
import {
  createTopic,
  getTopicsForDate,
  listDates,
  readTopicRaw,
  saveTopicUpdate,
} from '../lib/livestreams';

export function registerTopicsHandlers() {
  ipcMain.handle('topics:list-dates', () => listDates());

  ipcMain.handle('topics:list', (_event, date: string) =>
    getTopicsForDate(date),
  );

  ipcMain.handle(
    'topics:read',
    (_event, { date, fileName }: { date: string; fileName: string }) =>
      readTopicRaw(date, fileName),
  );

  ipcMain.handle(
    'topics:create',
    (
      _event,
      data: {
        title: string;
        slug: string;
        source: string;
        date: string;
        content: string;
      },
    ) => createTopic(data),
  );

  ipcMain.handle(
    'topics:update-status',
    (
      _event,
      {
        date,
        slug,
        status,
      }: { date: string; slug: string; status: TopicStatus },
    ) => saveTopicUpdate(date, slug, { status }),
  );

  ipcMain.handle(
    'topics:update-generated',
    (
      _event,
      {
        date,
        slug,
        generated,
      }: { date: string; slug: string; generated: Record<string, string> },
    ) => saveTopicUpdate(date, slug, { generated }),
  );
}
