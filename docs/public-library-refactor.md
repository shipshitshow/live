# Public library and producer refactor

Owner scope, October 2, 2026: a public library with transcripts, episode notes, resources, a landing page for `shipshitshow/skills`, and the show's brand kit. Production controls remain behind login. Viewer accounts/saved collections are outside this first refactor.

## Current evidence

- Trunk PRs #49/#50 now serve the public channel home and producer routes from `apps/app` at `show.shipshit.dev`; `apps/web` is a retired marketing stub. `/` is public, `/login` hosts Clerk and legacy `live.shipshit.dev` redirects to `show.shipshit.dev`. The owner has moved the producer entry point to `send.shipshit.dev`; verify actual host/Clerk/OAuth configuration before splitting route responsibilities.
- Producer pages are grouped under `(protected)` and depend on Clerk proxy protection. Its layout itself does not check a session.
- Public pages currently include the root channel home with a cached latest-video feed, `/login`, sign-in/sign-up, social/YouTube connection flows and `/talking-points/[slug]`. The public talking-points page shares producer topic loaders and displays source/prompt/rundown content.
- `/api/public/schedule` projects a small public topic DTO and excludes backlog entries. This is a useful boundary to extend, not a reason to expose full producer records.
- `/api/topics` mutations have no handler-level authorization; access currently depends on proxy authentication. There is no producer-role/owner check in the inspected handlers. Public signup is present, so authentication and permission must be treated separately during the refactor.
- Singular/plural livestream routes and old talking-points names overlap. Consolidation needs compatibility redirects and route/data tests.
- Current trunk uses `show.shipshit.dev` as the public metadata/OG fallback. Preserve that existing public behavior in this foundation; the next refactor must distinguish public canonical URLs from configured producer/OAuth origins.

Do not revive `apps/web` or create a second frontend as part of this scope. Keep the current application and introduce deliberate public/producer shells and read/write boundaries. Host separation requires verified deployment/auth configuration, not just a string replacement.

## Target responsibilities

Public `show.shipshit.dev` within the current application: browse episodes/derivatives, read transcripts and notes, open resources/examples, discover podcast-production skills and download the approved brand kit. No login should be needed to read public published material.

Producer `send.shipshit.dev` as the intended entry point: authenticated preparation, source-board editing, packaging, transcript handoff, integrations and publishing. Public navigation can link here with clear login semantics; producer state and integration tokens are not public-library data.

Use the vault catalog/coverage contract for public episode identity, status, provenance and derivative relationships. Public skills stay canonical in their own repository; the landing page explains outputs/install/use and links to source instructions. Brand assets include provenance and usage terms. Keep drafted/unreviewed/missing states honest.

## Route and access contract

| Visitor | Public library | Producer pages | Production writes |
| --- | --- | --- | --- |
| Logged out | Published public content, skills and brand kit | Sign-in redirect with safe return URL | JSON unauthorized response, no HTML redirect |
| Logged in without producer permission | Same public content | Clear access-denied/appropriate public destination | Forbidden, no mutation |
| Authorized producer | Same public content plus deliberate producer navigation | Production shell | Handler-level permission checks |

Producer membership/role must be resolved from the actual Clerk configuration before implementation. Do not infer that every authenticated signup is a host; do not invent account IDs or lock out an existing host. OAuth callbacks need verified state/session binding even when the callback URL is publicly routable. Public API DTOs exclude drafts, private notes, credentials and integration state.

## Implementation order and acceptance

1. Settle producer permissions against configured accounts, then centralize page/handler authorization. Verify anonymous, signed-in nonproducer and producer behavior, including OAuth callbacks.
2. Introduce public read-only catalog/detail APIs or static ingestion from a pinned/revalidated public vault snapshot. Validate identity, publication states, empty/missing transcripts and source/derivative links.
3. Build public library and episode pages with notes, transcript navigation, resources and examples. Stable YouTube-ID URLs, sensible empty states and existing-link redirects.
4. Add the skills landing page and brand-kit page, linking maintained source repositories and approved assets. Preserve separate live/recap/Short clocks and responsive media.
5. Refactor producer navigation around prepare → live → edit → package → archive. Replace talking-points naming with source-board/show-prep concepts and preserve compatibility for old links.
6. Verify responsive layouts, keyboard/screen-reader access, auth transitions, return URLs, draft exclusion, write authorization and cache isolation. Run focused route tests, affected typechecks/builds and independent review; required CI remains the merge gate.

This is the prepared scope for the next application phase. It does not claim the public-library UI or authorization refactor is already implemented.
