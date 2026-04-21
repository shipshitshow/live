import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import type { ChannelConfig, YouTubeAuthStatus } from './types';

const TOKEN_TTL_MS = 3000 * 1000; // 50 min

interface StoredTokenFile {
  refreshTokens?: Record<string, string>;
}

interface CachedAccessToken {
  token: string;
  expiresAt: number;
}

const accessTokenCache = new Map<string, CachedAccessToken>();

function getTokenFilePath(): string {
  return (
    process.env.TOKEN_FILE_PATH ||
    path.join(app.getPath('userData'), 'youtube-tokens.json')
  );
}

function readTokenFile(): StoredTokenFile {
  try {
    const filePath = getTokenFilePath();
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as StoredTokenFile;
  } catch {
    return {};
  }
}

function writeTokenFile(data: StoredTokenFile) {
  const filePath = getTokenFilePath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getConfiguredChannelMeta(): Array<{
  id: string;
  label: string;
  envRefreshToken?: string;
}> {
  const channels: Array<{
    id: string;
    label: string;
    envRefreshToken?: string;
  }> = [];

  if (process.env.YOUTUBE_CHANNEL_ID_MAIN) {
    channels.push({
      envRefreshToken: process.env.YOUTUBE_REFRESH_TOKEN_MAIN,
      id: process.env.YOUTUBE_CHANNEL_ID_MAIN,
      label: 'main',
    });
  }

  if (process.env.YOUTUBE_CHANNEL_ID_CLIPS) {
    channels.push({
      envRefreshToken: process.env.YOUTUBE_REFRESH_TOKEN_CLIPS,
      id: process.env.YOUTUBE_CHANNEL_ID_CLIPS,
      label: 'clips',
    });
  }

  return channels;
}

export function hasYouTubeCredentials(): boolean {
  return getConfiguredChannelMeta().length > 0;
}

export async function getChannelConfigs(): Promise<ChannelConfig[]> {
  const channels: ChannelConfig[] = [];

  for (const meta of getConfiguredChannelMeta()) {
    const fileData = readTokenFile();
    const storedRefreshToken = fileData.refreshTokens?.[meta.label] ?? null;
    const refreshToken = storedRefreshToken || meta.envRefreshToken;
    if (!refreshToken) continue;

    channels.push({
      id: meta.id,
      label: meta.label,
      refreshToken,
    });
  }

  return channels;
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${body}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function getAccessToken(
  channelConfig: ChannelConfig,
): Promise<string> {
  const cached = accessTokenCache.get(channelConfig.id);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.token;
  }

  const token = await refreshAccessToken(channelConfig.refreshToken);
  accessTokenCache.set(channelConfig.id, {
    expiresAt: Date.now() + TOKEN_TTL_MS,
    token,
  });

  return token;
}

export async function saveRefreshToken(label: string, refreshToken: string) {
  const current = readTokenFile();
  writeTokenFile({
    ...current,
    refreshTokens: {
      ...(current.refreshTokens ?? {}),
      [label]: refreshToken,
    },
  });
  // Clear cached access token for this channel
  const meta = getConfiguredChannelMeta().find((ch) => ch.label === label);
  if (meta) accessTokenCache.delete(meta.id);
}

export async function getYouTubeAuthStatus(): Promise<YouTubeAuthStatus> {
  const configuredChannels = getConfiguredChannelMeta();
  if (configuredChannels.length === 0) {
    return {
      channelLabelsNeedingAuth: [],
      connected: false,
      status: 'missing_credentials',
    };
  }

  const channels = await getChannelConfigs();
  const labelsWithTokens = new Set(channels.map((ch) => ch.label));
  const missingTokenLabels = configuredChannels
    .map((ch) => ch.label)
    .filter((label) => !labelsWithTokens.has(label));

  if (missingTokenLabels.length > 0) {
    return {
      channelLabelsNeedingAuth: missingTokenLabels,
      connected: false,
      status: 'reauth_required',
    };
  }

  const invalidLabels: string[] = [];
  for (const channel of channels) {
    try {
      await getAccessToken(channel);
    } catch {
      invalidLabels.push(channel.label);
    }
  }

  if (invalidLabels.length > 0) {
    return {
      channelLabelsNeedingAuth: invalidLabels,
      connected: false,
      status: 'reauth_required',
    };
  }

  return {
    channelLabelsNeedingAuth: [],
    connected: true,
    status: 'connected',
  };
}
