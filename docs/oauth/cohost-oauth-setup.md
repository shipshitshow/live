# Cohost OAuth setup

Use this as the handoff checklist for connecting a cohost and the short-form
platform accounts.

## App login: Clerk

The app is wired for Clerk on Next.js:

- Auth middleware: `apps/app/src/proxy.ts`
- Provider: `apps/app/src/app/layout.tsx`
- Sign-in URL: `/sign-in`
- Sign-up URL: `/sign-up`

Create or use a Clerk application, enable the OAuth/social providers you want
the cohost to use, then set:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/analytics
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/analytics
```

Invite the cohost from Clerk, or allow sign-up for the configured OAuth
provider. The dashboard routes are protected; the OAuth callback routes stay
public so provider redirects can complete.

Reference: https://clerk.com/docs/nextjs/getting-started/quickstart

## Short-form analytics

Analytics now reads:

- YouTube Shorts from the existing YouTube Analytics/Data API flow.
- Instagram Reels from an Instagram access token.
- TikTok videos from TikTok Display API access.

The cohost can open `/auth/social` after Clerk sign-in to see redirect URIs and
connection status for Instagram and TikTok.

## Instagram

Use Instagram API with Instagram Login for professional accounts. Required
scopes for this app:

```text
instagram_business_basic
instagram_business_manage_insights
```

Set the redirect URI in Meta/Instagram exactly:

```text
https://YOUR_DOMAIN/api/auth/social/instagram/callback
```

Then set:

```env
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=
INSTAGRAM_OAUTH_REDIRECT_URI=https://YOUR_DOMAIN/api/auth/social/instagram/callback
```

If Meta review blocks the insight scope during setup, a temporary token can be
stored directly:

```env
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_ACCOUNT_ID=
```

References:

- https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/
- https://www.postman.com/meta/instagram/folder/w5jo9vk/insights

## TikTok

Use TikTok Login Kit + Display API. Required scopes:

```text
user.info.basic
video.list
```

Set the redirect URI in TikTok exactly:

```text
https://YOUR_DOMAIN/api/auth/social/tiktok/callback
```

Then set:

```env
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_OAUTH_REDIRECT_URI=https://YOUR_DOMAIN/api/auth/social/tiktok/callback
```

Temporary direct-token fallback:

```env
TIKTOK_ACCESS_TOKEN=
TIKTOK_REFRESH_TOKEN=
TIKTOK_OPEN_ID=
```

References:

- https://developers.tiktok.com/doc/login-kit-web
- https://developers.tiktok.com/doc/display-api-get-started
- https://developers.tiktok.com/doc/oauth-user-access-token-management

## Existing YouTube

The YouTube reconnect flow still lives at `/auth/youtube`, with callback:

```text
https://YOUR_DOMAIN/api/auth/youtube/callback
```

Required scopes are already in code:

```text
https://www.googleapis.com/auth/youtube.force-ssl
https://www.googleapis.com/auth/yt-analytics.readonly
```
