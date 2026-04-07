import { kv } from "@vercel/kv";

const TOKEN_TTL_SECONDS = 3000; // 50 min (tokens last 60 min)

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface ChannelConfig {
  id: string;
  label: string;
  refreshToken: string;
}

/** Get configured channels with their refresh tokens */
export function getChannelConfigs(): ChannelConfig[] {
  const channels: ChannelConfig[] = [];

  if (process.env.YOUTUBE_CHANNEL_ID_MAIN && process.env.YOUTUBE_REFRESH_TOKEN_MAIN) {
    channels.push({
      id: process.env.YOUTUBE_CHANNEL_ID_MAIN,
      label: "main",
      refreshToken: process.env.YOUTUBE_REFRESH_TOKEN_MAIN,
    });
  }

  if (process.env.YOUTUBE_CHANNEL_ID_CLIPS && process.env.YOUTUBE_REFRESH_TOKEN_CLIPS) {
    channels.push({
      id: process.env.YOUTUBE_CHANNEL_ID_CLIPS,
      label: "clips",
      refreshToken: process.env.YOUTUBE_REFRESH_TOKEN_CLIPS,
    });
  }

  return channels;
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${body}`);
  }

  const data: TokenResponse = await res.json();
  return data.access_token;
}

/** Get a valid access token for a specific channel's brand account */
export async function getAccessToken(channelConfig: ChannelConfig): Promise<string> {
  const cacheKey = `youtube:access_token:${channelConfig.id}`;

  // Try KV cache first
  try {
    const cached = await kv.get<string>(cacheKey);
    if (cached) return cached;
  } catch {
    // KV not available (local dev without KV)
  }

  const token = await refreshAccessToken(channelConfig.refreshToken);

  // Cache in KV
  try {
    await kv.set(cacheKey, token, { ex: TOKEN_TTL_SECONDS });
  } catch {
    // KV not available
  }

  return token;
}

export function hasYouTubeCredentials(): boolean {
  return getChannelConfigs().length > 0;
}
