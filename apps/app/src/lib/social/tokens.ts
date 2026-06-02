import fs from 'node:fs';
import path from 'node:path';
import type { PerformancePlatform } from '@shipshitshow/types';
import { kv } from '@vercel/kv';

export type SocialTokenPlatform = Exclude<PerformancePlatform, 'youtube'>;

export interface SocialTokenSet {
  accessToken: string;
  accountId?: string;
  expiresAt?: string;
  refreshToken?: string;
  scope?: string;
}

interface StoredSocialTokenFile {
  tokens?: Partial<Record<SocialTokenPlatform, SocialTokenSet>>;
}

const TOKEN_FILE_PATH =
  process.env.SOCIAL_TOKEN_FILE_PATH ||
  path.join(
    /* turbopackIgnore: true */ process.cwd(),
    'data',
    'social-tokens.json',
  );

const ENV_KEYS: Record<
  SocialTokenPlatform,
  { accessToken: string; refreshToken: string; accountId: string }
> = {
  instagram: {
    accessToken: 'INSTAGRAM_ACCESS_TOKEN',
    accountId: 'INSTAGRAM_ACCOUNT_ID',
    refreshToken: 'INSTAGRAM_REFRESH_TOKEN',
  },
  tiktok: {
    accessToken: 'TIKTOK_ACCESS_TOKEN',
    accountId: 'TIKTOK_OPEN_ID',
    refreshToken: 'TIKTOK_REFRESH_TOKEN',
  },
};

function readTokenFile(): StoredSocialTokenFile {
  try {
    if (!fs.existsSync(TOKEN_FILE_PATH)) return {};
    return JSON.parse(fs.readFileSync(TOKEN_FILE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function writeTokenFile(data: StoredSocialTokenFile) {
  fs.mkdirSync(path.dirname(TOKEN_FILE_PATH), { recursive: true });
  fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function getEnvToken(platform: SocialTokenPlatform): SocialTokenSet | null {
  const keys = ENV_KEYS[platform];
  const accessToken = process.env[keys.accessToken]?.trim();
  if (!accessToken) return null;

  const refreshToken = process.env[keys.refreshToken]?.trim();
  const accountId = process.env[keys.accountId]?.trim();
  return {
    accessToken,
    ...(accountId ? { accountId } : {}),
    ...(refreshToken ? { refreshToken } : {}),
  };
}

export async function getSocialToken(
  platform: SocialTokenPlatform,
): Promise<SocialTokenSet | null> {
  try {
    const token = await kv.get<SocialTokenSet>(`social:${platform}:token`);
    if (token?.accessToken) return token;
  } catch {
    // KV is optional in local development.
  }

  const fileToken = readTokenFile().tokens?.[platform];
  if (fileToken?.accessToken) return fileToken;

  return getEnvToken(platform);
}

export async function saveSocialToken(
  platform: SocialTokenPlatform,
  token: SocialTokenSet,
) {
  try {
    await kv.set(`social:${platform}:token`, token);
  } catch {
    // KV is optional in local development.
  }

  try {
    const current = readTokenFile();
    writeTokenFile({
      ...current,
      tokens: {
        ...(current.tokens ?? {}),
        [platform]: token,
      },
    });
  } catch {
    // Filesystem can be read-only in deployment.
  }
}
