#!/usr/bin/env bun
/**
 * One-time OAuth2 script to get a YouTube refresh token.
 *
 * Usage:
 *   bun scripts/youtube-auth.ts
 *
 * 1. Opens Google consent in your browser
 * 2. After you approve, captures the auth code via local callback
 * 3. Exchanges for tokens and prints the refresh token
 * 4. Paste the refresh token into your .env / Vercel env vars
 */

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:9876/callback';
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
].join(' ');

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    '❌ Set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in .env first',
  );
  process.exit(1);
}

const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth?` +
  new URLSearchParams({
    access_type: 'offline',
    client_id: CLIENT_ID,
    prompt: 'select_account consent',
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
  }).toString();

console.log('\n🔗 Opening Google consent page...\n');
console.log(authUrl, '\n');

// Open in browser
Bun.spawn(['open', authUrl]);

// Start local server to receive callback
const server = Bun.serve({
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname !== '/callback') {
      return new Response('Not found', { status: 404 });
    }

    const code = url.searchParams.get('code');
    if (!code) {
      return new Response('Missing code parameter', { status: 400 });
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      body: new URLSearchParams({
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
    });

    const tokens = await tokenRes.json();

    if (tokens.error) {
      console.error(
        '\n❌ Token exchange failed:',
        tokens.error_description || tokens.error,
      );
      server.stop();
      process.exit(1);
    }

    console.log('\n✅ Got tokens!\n');
    console.log('────────────────────────────────────────');
    console.log('YOUTUBE_REFRESH_TOKEN=' + tokens.refresh_token);
    console.log('────────────────────────────────────────');
    console.log(
      '\n📋 Add the line above to your .env file and Vercel env vars.\n',
    );

    // Shutdown after response
    setTimeout(() => {
      server.stop();
      process.exit(0);
    }, 500);

    return new Response(
      "<html><body style='font-family:system-ui;padding:40px;text-align:center'>" +
        '<h1>✅ YouTube Connected</h1>' +
        '<p>Refresh token printed to your terminal. You can close this tab.</p>' +
        '</body></html>',
      { headers: { 'Content-Type': 'text/html' } },
    );
  },
  port: 9876,
});

console.log(
  '⏳ Waiting for OAuth callback on http://localhost:9876/callback ...\n',
);
