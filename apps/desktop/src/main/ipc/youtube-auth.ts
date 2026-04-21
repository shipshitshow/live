import { BrowserWindow, ipcMain } from 'electron';
import type { YouTubeAuthStatus } from '../lib/youtube/types';
import {
  getYouTubeAuthStatus,
  saveRefreshToken,
} from '../lib/youtube/token';

const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
].join(' ');

async function exchangeCodeForTokens(
  code: string,
  redirectUri: string,
): Promise<{ refreshToken: string }> {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Missing YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${body}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
  };

  if (!data.refresh_token) {
    throw new Error(
      'No refresh_token returned. Revoke app access in Google Account settings and try again.',
    );
  }

  return { refreshToken: data.refresh_token };
}

export function registerYouTubeAuthHandlers() {
  ipcMain.handle(
    'youtube-auth:get-status',
    async (): Promise<YouTubeAuthStatus> => {
      return getYouTubeAuthStatus();
    },
  );

  ipcMain.handle(
    'youtube-auth:start',
    async (_event, channelLabel: string): Promise<{ success: boolean }> => {
      const clientId = process.env.YOUTUBE_CLIENT_ID;
      if (!clientId) {
        throw new Error('YOUTUBE_CLIENT_ID not configured');
      }

      const redirectUri = 'http://localhost:19876/callback';

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', OAUTH_SCOPES);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('state', channelLabel);

      return new Promise((resolve, reject) => {
        const authWindow = new BrowserWindow({
          height: 700,
          title: `YouTube Auth — ${channelLabel}`,
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
          },
          width: 500,
        });

        let resolved = false;

        authWindow.webContents.on('will-redirect', async (_e, url) => {
          if (resolved) return;
          if (!url.startsWith(redirectUri)) return;

          resolved = true;
          authWindow.close();

          try {
            const parsed = new URL(url);
            const code = parsed.searchParams.get('code');
            const error = parsed.searchParams.get('error');

            if (error) throw new Error(`OAuth error: ${error}`);
            if (!code) throw new Error('No authorization code received');

            const { refreshToken } = await exchangeCodeForTokens(
              code,
              redirectUri,
            );
            await saveRefreshToken(channelLabel, refreshToken);
            resolve({ success: true });
          } catch (err) {
            reject(err);
          }
        });

        authWindow.on('closed', () => {
          if (!resolved) {
            resolved = true;
            resolve({ success: false });
          }
        });

        authWindow.loadURL(authUrl.toString());
      });
    },
  );
}
