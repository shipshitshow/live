# Ship Shit Show — Monorepo

@.agents/memory/product-marketing-context.md
@.agents/memory/architecture.md

## Apps
- `apps/app` — producer dashboard (Next.js 16, port 3001, deployed to live.shipshit.dev)
- `apps/web` — public marketing site (Next.js 16, port 3000, deployed to show.shipshit.dev)
- `apps/desktop` — local show management (Electron + Vite, local-only, no deployment)

## Packages
- `packages/types` (@shipshitshow/types) — shared TypeScript types, no runtime deps
- `packages/ui` (@shipshitshow/ui) — shared React components + Tailwind theme tokens + cn()

## Dev Commands
```bash
bun run dev           # all apps via turbo
bun run dev:app       # producer dashboard only
bun run dev:web       # landing page only
bun run dev:desktop   # electron app only
bun run check:types   # typecheck all packages
bun run lint          # biome check
```

## Skills
- `skills/` — show-specific runtime skills (talking-points, yt-analytics, thumbnails)
- `.agents/skills/` — dev workflow skills (symlinked to .claude/skills, .codex/skills)
- `scripts/skills.sh` — skill installer (pulls from github.com/shipshitshow/skills)

---

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
