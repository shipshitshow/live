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
    create: (data: {
      title: string;
      slug: string;
      source: string;
      date: string;
      content: string;
    }) => ipcRenderer.invoke('topics:create', data),
    list: (date: string) => ipcRenderer.invoke('topics:list', date),
    listDates: () => ipcRenderer.invoke('topics:list-dates'),
    read: (date: string, fileName: string) =>
      ipcRenderer.invoke('topics:read', { date, fileName }),
    updateGenerated: (
      date: string,
      slug: string,
      generated: Record<string, string>,
    ) => ipcRenderer.invoke('topics:update-generated', { date, slug, generated }),
    updateStatus: (date: string, slug: string, status: string) =>
      ipcRenderer.invoke('topics:update-status', { date, slug, status }),
  },
  trends: {
    fetch: () => ipcRenderer.invoke('trends:fetch'),
    search: (query: string) => ipcRenderer.invoke('trends:search', query),
    searchX: (query: string) => ipcRenderer.invoke('trends:search-x', query),
  },
  pipeline: {
    getJob: (jobId: string) => ipcRenderer.invoke('pipeline:get-job', jobId),
    listJobs: (status?: string) =>
      ipcRenderer.invoke('pipeline:list-jobs', status),
    reviewJob: (jobId: string, action: string, reason?: string) =>
      ipcRenderer.invoke('pipeline:review-job', { jobId, action, reason }),
  },
  review: {
    generateContent: (input: {
      title: string;
      videoType: 'video' | 'short';
      channelLabel: string;
      duration: number;
    }) => ipcRenderer.invoke('review:generate-content', input),
    listVideos: () => ipcRenderer.invoke('review:list-videos'),
    regenerateField: (
      input: {
        title: string;
        videoType: 'video' | 'short';
        channelLabel: string;
        duration: number;
      },
      field: string,
    ) => ipcRenderer.invoke('review:regenerate-field', { input, field }),
  },
  comments: {
    draftReply: (input: {
      videoTitle: string;
      commentText: string;
      channelLabel: string;
      authorDisplayName: string;
    }) => ipcRenderer.invoke('comments:draft-reply', input),
    list: (options?: { maxResults?: number; videoId?: string }) =>
      ipcRenderer.invoke('comments:list', options),
    reply: (parentCommentId: string, channelId: string, text: string) =>
      ipcRenderer.invoke('comments:reply', {
        parentCommentId,
        channelId,
        text,
      }),
  },
  youtubeAuth: {
    getStatus: () => ipcRenderer.invoke('youtube-auth:get-status'),
    start: (channelLabel: string) =>
      ipcRenderer.invoke('youtube-auth:start', channelLabel),
  },
});
