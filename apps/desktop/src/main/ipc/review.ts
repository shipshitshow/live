import { ipcMain } from 'electron';
import type { UnlistedVideo } from '@shipshitshow/types';
import { listReviewQueueVideos } from '../lib/review-queue';
import {
  generateVideoContent,
  regenerateField,
  type VideoGeneratedContent,
} from '../lib/video-content-generator';

export function registerReviewHandlers() {
  ipcMain.handle(
    'review:list-videos',
    async (): Promise<UnlistedVideo[]> => {
      return listReviewQueueVideos();
    },
  );

  ipcMain.handle(
    'review:generate-content',
    (
      _event,
      input: {
        title: string;
        videoType: 'video' | 'short';
        channelLabel: string;
        duration: number;
      },
    ): VideoGeneratedContent => {
      return generateVideoContent(input);
    },
  );

  ipcMain.handle(
    'review:regenerate-field',
    (
      _event,
      {
        input,
        field,
      }: {
        input: {
          title: string;
          videoType: 'video' | 'short';
          channelLabel: string;
          duration: number;
        };
        field: keyof VideoGeneratedContent;
      },
    ): string | string[] => {
      return regenerateField(input, field);
    },
  );
}
