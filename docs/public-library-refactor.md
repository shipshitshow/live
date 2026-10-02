# Public library and producer refactor

Owner scope, October 2, 2026: a public library with transcripts, episode notes, resources, a landing page for `shipshitshow/skills`, and the show's brand kit. Production controls remain behind login. Viewer accounts/saved collections are outside this first refactor.

## Current evidence

- `apps/web` is the public marketing site; `apps/app` is the producer application at `send.shipshit.dev`.
- Producer pages are grouped under `(protected)` and depend on Clerk proxy protection. Its layout itself does not check a session.
- Public pages currently include sign-in/sign-up, social/YouTube connection flows and `/talking-points/[slug]`. The public talking-points page shares producer topic loaders and displays source/prompt/rundown content.
- `/api/public/schedule` projects a small public topic DTO and excludes backlog entries. This is a useful boundary to extend, not a reason to expose full producer records.
- `/api/topics` mutations have no handler-level authorization; access currently depends on proxy authentication. There is no producer-role/owner check in the inspected handlers. Public signup is present, so authentication and permission must be treated separately during the refactor.
- Singular/plural livestream routes and old talking-points names overlap. Consolidation needs compatibility redirects and route/data tests.
- Canonical URL and OG labels still used the former domain; this foundation change updates those to `send.shipshit.dev`.

## Target responsibilities

Public `show.shipshit.dev`: browse episodes/derivatives, read transcripts and notes, open resources/examples, discover podcast-production skills and download the approved brand kit. No login should be needed to read public published material.

Producer `send.shipshit.dev`: authenticated preparation, source-board editing, packaging, transcript handoff, integrations and publishing. Public navigation can link here with clear login semantics; producer state and integration tokens are not public-library data.

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
