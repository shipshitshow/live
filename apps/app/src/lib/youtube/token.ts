import fs from 'node:fs';
import path from 'node:path';
import { kv } from '@vercel/kv';

function isYouTubeAuthEnabled(): boolean {
  return !process.env.VERCEL;
}

import type { ChannelConfig, YouTubeAuthStatus } from '@/lib/youtube/types';

const TOKEN_TTL_SECONDS = 3000; // 50 min (tokens last 60 min)
const TOKEN_FILE_PATH =
  process.env.TOKEN_FILE_PATH ||
  path.join(process.cwd(), 'data', 'youtube-tokens.json');
const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
].join(' ');

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
}

interface StoredTokenFile {
  refreshTokens?: Record<string, string>;
}

class YouTubeAuthError extends Error {
  code: 'reauth_required' | 'missing_credentials';
  channelLabel?: string;
  channelId?: string;

  constructor(
    code: 'reauth_required' | 'missing_credentials',
    message: string,
    options?: { channelLabel?: string; channelId?: string },
  ) {
    super(message);
    this.name = 'YouTubeAuthError';
    this.code = code;
    this.channelLabel = options?.channelLabel;
    this.channelId = options?.channelId;
  }
}

function readTokenFile(): StoredTokenFile {
  try {
    if (!fs.existsSync(TOKEN_FILE_PATH)) return {};
    const raw = fs.readFileSync(TOKEN_FILE_PATH, 'utf8');
    return JSON.parse(raw) as StoredTokenFile;
  } catch {
    return {};
  }
}

function writeTokenFile(data: StoredTokenFile) {
  fs.mkdirSync(path.dirname(TOKEN_FILE_PATH), { recursive: true });
  fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

async function getStoredRefreshToken(label: string): Promise<string | null> {
  try {
    const kvToken = await kv.get<string>(`youtube:refresh_token:${label}`);
    if (kvToken) return kvToken;
  } catch {
    // KV not available locally
  }

  const fileData = readTokenFile();
  return fileData.refreshTokens?.[label] ?? null;
}

async function persistRefreshToken(label: string, refreshToken: string) {
  try {
    await kv.set(`youtube:refresh_token:${label}`, refreshToken);
  } catch {
    // KV not available locally
  }

  const current = readTokenFile();
  writeTokenFile({
    ...current,
    refreshTokens: {
      ...(current.refreshTokens ?? {}),
      [label]: refreshToken,
    },
  });
}

async function clearCachedAccessToken(channelId: string) {
  try {
    await kv.del(`youtube:access_token:${channelId}`);
  } catch {
    // KV not available locally
  }
}

/** Get configured channels with their refresh tokens */
export function getConfiguredChannelMeta(): Array<{
  id: string;
  label: string;
  envRefreshToken?: string;
}> {
  if (!isYouTubeAuthEnabled()) {
    return [];
  }

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

export async function getChannelConfigs(): Promise<ChannelConfig[]> {
  const channels: ChannelConfig[] = [];

  for (const meta of getConfiguredChannelMeta()) {
    const storedRefreshToken = await getStoredRefreshToken(meta.label);
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
    throw new YouTubeAuthError(
      'missing_credentials',
      'Missing YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET',
    );
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
    if (res.status === 400 && body.includes('invalid_grant')) {
      throw new YouTubeAuthError(
        'reauth_required',
        `Token refresh failed: ${res.status} ${body}`,
      );
    }
    throw new Error(`Token refresh failed: ${res.status} ${body}`);
  }

  const data: TokenResponse = await res.json();
  return data.access_token;
}

/** Get a valid access token for a specific channel's brand account */
export async function getAccessToken(
  channelConfig: ChannelConfig,
): Promise<string> {
  const cacheKey = `youtube:access_token:${channelConfig.id}`;

  // Try KV cache first
  try {
    const cached = await kv.get<string>(cacheKey);
    if (cached) return cached;
  } catch {
    // KV not available (local dev without KV)
  }

  let token: string;
  try {
    token = await refreshAccessToken(channelConfig.refreshToken);
  } catch (error) {
    if (error instanceof YouTubeAuthError && error.code === 'reauth_required') {
      await clearCachedAccessToken(channelConfig.id);
      throw new YouTubeAuthError(error.code, error.message, {
        channelId: channelConfig.id,
        channelLabel: channelConfig.label,
      });
    }
    throw error;
  }

  // Cache in KV
  try {
    await kv.set(cacheKey, token, { ex: TOKEN_TTL_SECONDS });
  } catch {
    // KV not available
  }

  return token;
}

export function hasYouTubeCredentials(): boolean {
  return getConfiguredChannelMeta().length > 0;
}

export function isYouTubeReauthError(error: unknown): error is Error & {
  code: 'reauth_required';
  channelLabel?: string;
  channelId?: string;
} {
  return error instanceof YouTubeAuthError && error.code === 'reauth_required';
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
  const labelsWithTokens = new Set(channels.map((channel) => channel.label));
  const missingTokenLabels: string[] = [];
  for (const channel of configuredChannels) {
    if (!labelsWithTokens.has(channel.label)) {
      missingTokenLabels.push(channel.label);
    }
  }

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
    } catch (error) {
      if (isYouTubeReauthError(error)) {
        invalidLabels.push(error.channelLabel || channel.label);
        continue;
      }
      throw error;
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

export async function saveRefreshToken(label: string, refreshToken: string) {
  await persistRefreshToken(label, refreshToken);
  const meta = getConfiguredChannelMeta().find(
    (channel) => channel.label === label,
  );
  if (meta) {
    await clearCachedAccessToken(meta.id);
  }
}

export function getYouTubeOAuthConfig() {
  if (!isYouTubeAuthEnabled()) {
    throw new YouTubeAuthError(
      'missing_credentials',
      'YouTube auth is disabled on Vercel',
    );
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new YouTubeAuthError(
      'missing_credentials',
      'Missing YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET',
    );
  }

  return { clientId, clientSecret, scopes: OAUTH_SCOPES };
}

export function getYouTubeOAuthRedirectUri(origin?: string) {
  if (!isYouTubeAuthEnabled()) {
    throw new YouTubeAuthError(
      'missing_credentials',
      'YouTube auth is disabled on Vercel',
    );
  }

  const configured = process.env.YOUTUBE_OAUTH_REDIRECT_URI?.trim();
  if (configured) {
    return configured;
  }

  if (!origin) {
    throw new YouTubeAuthError(
      'missing_credentials',
      'Missing YOUTUBE_OAUTH_REDIRECT_URI and no request origin was provided',
    );
  }

  return `${origin}/api/auth/youtube/callback`;
}
