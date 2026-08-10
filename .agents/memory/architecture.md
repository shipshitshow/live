# Ship Shit Show — Monorepo Architecture

last_verified: 2026-07-13

## Layout

Turborepo monorepo with Bun workspaces.

### Apps
- `apps/app` (@shipshitshow/app) — Producer dashboard. Next.js 16, port 3001. Deployed to live.shipshit.dev via Vercel.
- `apps/web` (@shipshitshow/web) — Public marketing site. Next.js 16, port 3000. Deployed to show.shipshit.dev via Vercel.
- `apps/desktop` (@shipshitshow/desktop) — Local show management. Electron + Vite + React 19. Local-only, no deployment.

### Packages
- `packages/types` (@shipshitshow/types) — Shared TypeScript types. Zero runtime deps. No build step.
- `packages/ui` (@shipshitshow/ui) — Shared React components (Button, Select, Textarea) + Tailwind v4 theme tokens + cn() utility.

### Skills
- `skills/` (root) — Show-specific runtime skills: talking points, YouTube metadata/chapters, clip extraction, intro hooks, LinkedIn pipeline.
- `.agents/skills/` — Dev workflow skills. Symlinked from `.claude/skills` and `.codex/skills`.

### Data
- `apps/app/data/livestream/` — Topic markdown files per date. Local filesystem for dev, Vercel Blob for production.
- `apps/app/data/transcripts/` — YouTube video transcripts (VTT + cleaned text).

### Key env vars
- `DATA_DIR` — Override for livestream data directory (fallback: `process.cwd()/data/livestream`)
- `TOKEN_FILE_PATH` — Override for YouTube token file path
- `ANALYTICS_API_URL` — External analytics service (default: localhost:8000)
- `PIPELINE_API_URL` — External pipeline service (default: localhost:8001)
