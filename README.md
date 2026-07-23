# Ship Shit Show — Monorepo

Turborepo (Bun workspaces) for the Ship Shit Show — a YouTube livestream/channel
about AI tools for indie devs. Producer dashboard, public marketing site, and a
local Electron control app, plus shared packages and show-runtime skills.

## Apps

| App | Package | Stack | Port | Deploy |
| --- | --- | --- | --- | --- |
| `apps/app` | `@shipshitshow/app` | Next.js 16 | 3001 | live.shipshit.dev (Vercel) |
| `apps/web` | `@shipshitshow/web` | Next.js 16 | 3000 | show.shipshit.dev (Vercel) |
| `apps/desktop` | `@shipshitshow/desktop` | Electron + Vite + React 19 | — | local only |

`apps/app` is the producer dashboard: YouTube analytics (Data + Analytics APIs),
comment triage with AI-drafted replies, livestream topic prep/kanban, and trend
discovery. Auth is Clerk; caching/token storage is Vercel KV; livestream data is
the local filesystem in dev and Vercel Blob in production.

## Packages

- `packages/types` (`@shipshitshow/types`) — shared TypeScript types, no runtime deps.
- `packages/ui` (`@shipshitshow/ui`) — shared React components + Tailwind v4 theme tokens + `cn()`.
- `packages/talking-points` (`@shipshitshow/talking-points`) — trend/topic discovery used by the dashboard and desktop app.

## Setup

```bash
bun install
cp apps/app/.env.example apps/app/.env.local   # fill in the values you need
bun run dev            # all apps via turbo
bun run dev:app        # producer dashboard only (http://localhost:3001)
bun run dev:web        # marketing site only (http://localhost:3000)
bun run dev:desktop    # electron app only
```

Common checks:

```bash
bun run lint           # biome check
bun run check:types    # tsc across workspaces
bun run build          # turbo build
```

CI (`.github/workflows/ci.yml`) runs lint + typecheck + build on every push/PR;
`secret-scan.yml` runs gitleaks.

## YouTube auth

The dashboard uses OAuth (scopes `youtube.force-ssl` + `yt-analytics.readonly`)
per channel (`main`, `clips`). Reconnect in-app at `/auth/youtube`, or mint a
refresh token locally with `bun scripts/youtube-auth.ts` and store it as
`YOUTUBE_REFRESH_TOKEN_MAIN` / `_CLIPS`.

Production reauth requires the prod callback
(`https://live.shipshit.dev/api/auth/youtube/callback`) to be registered as an
Authorized redirect URI in the Google Cloud Console OAuth client, and
`YOUTUBE_CLIENT_ID`/`YOUTUBE_CLIENT_SECRET` (plus `OAUTH_STATE_SECRET`) set in
Vercel. See `apps/app/.env.example` for the full variable list.

## Data & content

- `apps/app/data/livestream/YYYY-MM-DD/` — per-date topic markdown (stream prep).
- `apps/app/data/transcripts/` — VTT + cleaned transcripts.
- `apps/app/data/youtube/channel-inventory.json` — cached channel video inventory.
- Refresh inventory + backfill transcripts: `bun scripts/refresh-youtube-inventory.ts` (see `--help`).

## Skills

- `skills/` — show-runtime skills (talking points, YouTube metadata/chapters, clip extraction, intro hooks).
- `.agents/skills/` — dev-workflow skills, managed by `./scripts/skills.sh` against `github.com/shipshitshow/skills`.
