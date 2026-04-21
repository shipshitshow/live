import type {
  YouTubeCommentReply,
  YouTubeCommentThread,
} from '@shipshitshow/types';
import { ipcMain } from 'electron';
import { generateCommentReplyDrafts } from '../lib/ai/comment-reply-drafts';
import { fetchCommentThreads, replyToComment } from '../lib/youtube/comments';
import { getAccessToken, getChannelConfigs } from '../lib/youtube/token';

export function registerCommentsHandlers() {
  ipcMain.handle(
    'comments:list',
    async (
      _event,
      options?: { maxResults?: number; videoId?: string },
    ): Promise<{
      items: YouTubeCommentThread[];
      fetchedAt: string;
    }> => {
      const channels = await getChannelConfigs();
      const allItems: YouTubeCommentThread[] = [];

      for (const channel of channels) {
        const token = await getAccessToken(channel);
        const threads = await fetchCommentThreads(token, channel, {
          maxResults: options?.maxResults,
          videoId: options?.videoId,
        });
        allItems.push(...threads);
      }

      allItems.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );

      return {
        fetchedAt: new Date().toISOString(),
        items: allItems,
      };
    },
  );

  ipcMain.handle(
    'comments:draft-reply',
    async (
      _event,
      input: {
        videoTitle: string;
        commentText: string;
        channelLabel: string;
        authorDisplayName: string;
      },
    ): Promise<{ drafts: string[] }> => {
      const drafts = await generateCommentReplyDrafts(input);
      return { drafts };
    },
  );

  ipcMain.handle(
    'comments:reply',
    async (
      _event,
      {
        parentCommentId,
        channelId,
        text,
      }: { parentCommentId: string; channelId: string; text: string },
    ): Promise<YouTubeCommentReply> => {
      const channels = await getChannelConfigs();
      const channel = channels.find((ch) => ch.id === channelId);
      if (!channel) throw new Error(`Channel ${channelId} not configured`);
      const token = await getAccessToken(channel);
      return replyToComment(token, parentCommentId, text);
    },
  );
}
