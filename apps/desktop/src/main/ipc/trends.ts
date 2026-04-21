import {
  buildTrendsResponse,
  buildTrendsSearchResponse,
} from '@shipshitshow/talking-points';
import type { TrendsResponse, TrendsSearchResponse } from '@shipshitshow/types';
import { ipcMain } from 'electron';
import {
  fetchDesktopHNTrending,
  fetchDesktopRedditTrending,
  fetchDesktopYouTubeTrending,
  searchDesktopHN,
  searchDesktopReddit,
  searchDesktopX,
  searchDesktopYouTube,
} from '../lib/talking-points-sources';

export function registerTrendsHandlers() {
  ipcMain.handle('trends:fetch', async (): Promise<TrendsResponse> => {
    const response = await buildTrendsResponse([
      ['hackernews', fetchDesktopHNTrending],
      ['reddit', fetchDesktopRedditTrending],
      ['youtube', fetchDesktopYouTubeTrending],
    ] as const);

    return {
      ...response,
      sources: {
        ...response.sources,
        x: 'manual',
      },
    };
  });

  ipcMain.handle(
    'trends:search',
    async (_event, query: string): Promise<TrendsSearchResponse> => {
      return buildTrendsSearchResponse(query, [
        () => searchDesktopHN(query),
        () => searchDesktopReddit(query),
        () => searchDesktopYouTube(query),
      ]);
    },
  );

  ipcMain.handle(
    'trends:search-x',
    async (_event, query: string): Promise<TrendsSearchResponse> =>
      buildTrendsSearchResponse(query, [() => searchDesktopX(query)]),
  );
}
