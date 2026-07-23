import crypto from 'node:crypto';

/**
 * Signed OAuth state to defend the public YouTube callback against CSRF /
 * token-injection. State is an HMAC-signed payload carrying a random nonce; the
 * same nonce is stored in an httpOnly cookie and re-checked on callback, so a
 * code obtained by a third party cannot be replayed against our callback to
 * overwrite a channel's stored refresh token.
 */

export const OAUTH_STATE_COOKIE = 'yt_oauth_state';
export const OAUTH_STATE_MAX_AGE_SECONDS = 600; // 10 min to complete consent

interface OAuthStatePayload {
  channel: string;
  next: string;
  nonce: string;
}

function getStateSecret(): string {
  const secret =
    process.env.OAUTH_STATE_SECRET?.trim() ||
    process.env.YOUTUBE_CLIENT_SECRET?.trim();
  if (!secret) {
    throw new Error(
      'Missing OAUTH_STATE_SECRET (or YOUTUBE_CLIENT_SECRET) for OAuth state signing',
    );
  }
  return secret;
}

function sign(payloadB64: string): string {
  return crypto
    .createHmac('sha256', getStateSecret())
    .update(payloadB64)
    .digest('base64url');
}

export function createOAuthState(input: { channel: string; next: string }): {
  state: string;
  nonce: string;
} {
  const nonce = crypto.randomBytes(16).toString('base64url');
  const payload: OAuthStatePayload = {
    channel: input.channel,
    next: input.next,
    nonce,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString(
    'base64url',
  );
  return { nonce, state: `${payloadB64}.${sign(payloadB64)}` };
}

/**
 * Verify the signed state and bind it to the initiating browser via the nonce
 * cookie. Returns null on any tampering, signature mismatch, or nonce mismatch.
 */
export function verifyOAuthState(
  rawState: string | null,
  cookieNonce: string | undefined,
): { channel: string; next: string } | null {
  if (!rawState || !cookieNonce) return null;

  const [payloadB64, signature] = rawState.split('.');
  if (!payloadB64 || !signature) return null;

  const expected = sign(payloadB64);
  const provided = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (
    provided.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(provided, expectedBuf)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8'),
    ) as Partial<OAuthStatePayload>;
    if (
      typeof parsed.channel !== 'string' ||
      typeof parsed.next !== 'string' ||
      typeof parsed.nonce !== 'string'
    ) {
      return null;
    }
    const nonceBuf = Buffer.from(parsed.nonce);
    const cookieBuf = Buffer.from(cookieNonce);
    if (
      nonceBuf.length !== cookieBuf.length ||
      !crypto.timingSafeEqual(nonceBuf, cookieBuf)
    ) {
      return null;
    }
    return { channel: parsed.channel, next: parsed.next };
  } catch {
    return null;
  }
}
