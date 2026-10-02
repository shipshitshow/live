# Production consolidation audit

Audited October 2, 2026, before shell cleanup. App baseline: `b140a58`.
Canonical backlog: [Show Production](https://github.com/orgs/shipshitshow/projects/2), public and open. The older FPS Arena Roadmap is private and closed.

## Product structure

The public website and the producer workspace share `show.shipshit.dev`.
Public `/` remains the episode library. Producer sign-in is `/sign-in`.

| App | URL | Responsibility |
| --- | --- | --- |
| Home | `/studio` | Channel overview and next production actions |
| Show prep | `/livestreams` | Episode preparation, rundown, sources and production assets; edited videos remain `/videos` |
| Channel analytics | `/analytics` | YouTube periods and episode performance |
| Socials | `/socials` | Cross-platform coverage, account health and performance |
| Partnerships | `/partnerships` | Sponsor opportunities, follow-ups and deliverables; audience attribution remains `/leads` |
| Research | `/research` | Source scanner and idea backlog; `/topics` remains reachable |

Partnerships and Research sit under More. An app switch changes the URL and contextual navigation. Production controls must eventually check producer permissions, independently of public community sign-in.

## Findings and sequence

| Priority | Finding | Evidence | Issue |
| --- | --- | --- | --- |
| P1 | Navigation mixes unrelated jobs and has no production Home | `components/AppSidebar.tsx`, protected layout | [#53](https://github.com/shipshitshow/show.shipshit.dev/issues/53) |
| P1 | Routing checks authentication; producer authorization needs an explicit policy | `src/proxy.ts`, public sign-up and channel connection routes | [#54](https://github.com/shipshitshow/show.shipshit.dev/issues/54) |
| P1 | Social metrics conflate missing data, video duration, reach and views; history is absent | `lib/social/performance.ts`, `SocialPerformance.tsx` | [#55](https://github.com/shipshitshow/show.shipshit.dev/issues/55) |
| P1 | Scheduling, source-led prep and live cues are not one operational flow | protected livestream list; `StreamRundownPanel.tsx`, `StreamPromptsPanel.tsx` | [#57](https://github.com/shipshitshow/show.shipshit.dev/issues/57) |
| P1 | Vault transcript completeness is not reflected by the app archive | Production list reports no transcript for recent streams; `lib/livestreams-store.ts` | [#59](https://github.com/shipshitshow/show.shipshit.dev/issues/59) |
| P2 | Lead attribution is not a partnership CRM | `packages/types/src/leads.ts`, `lib/leads-store.ts` | [#56](https://github.com/shipshitshow/show.shipshit.dev/issues/56) |
| P2 | Trends and date-based topics are fragmented; failed PATCH can leave optimistic state wrong | `TrendsView.tsx`, `KanbanBoard.tsx` | [#58](https://github.com/shipshitshow/show.shipshit.dev/issues/58) |
| P2 | Old workspaces, aliases and documentation obscure the deployed architecture | `apps/web`, `apps/desktop`, route aliases, architecture memory | [#60](https://github.com/shipshitshow/show.shipshit.dev/issues/60) |

First establish the shell and route ownership. Then resolve producer access and metric correctness before expanding private data. Connect episode records, scheduling and prep next. Add the dedicated partnership model after those boundaries are clear. Research should promote verified sources into a selected episode. Retire workspaces and duplicate code only after an inventory, compatibility check and CI evidence.

The older epics remain useful: #8 stabilization, #9 historical social reporting, #10 cohost experience, #11 scheduling, #13 consolidation and #14 desktop decision. Their August audit text is historical. In particular, #8's zero-test/no-test-CI claim is obsolete; CI now runs lint, types, workspace tests and builds. The proposed EC2 storage in #9 is not approval to provision infrastructure.

## Frontend baseline

Source inspection and signed-in Brave review covered Analytics, Livestreams and Trends. This is a focused production audit, not a complete penetration test, WCAG certification or performance benchmark.

| Dimension | Baseline score / 4 | Evidence |
| --- | --- | --- |
| Accessibility | 2 | Icon-only analytics refresh lacks a name; sidebar selection lacks `aria-current`; shared muted `#606060` text has weak contrast on dark surfaces |
| Performance | 2 | Parallel provider reads and client snapshots exist, but snapshots have no expiry; Instagram can fan out into 25 insight requests. No runtime benchmark taken |
| Responsive | 1 | Fixed 240px sidebar has no mobile drawer; nested `h-screen` wrappers exceed available shell height |
| Theming | 2 | Shared theme exists, but hierarchy is inconsistent and operational controls compete with card decoration |
| Anti-patterns | 2 | Flat navigation, duplicate aliases, monolithic dashboard and separate research workflows obscure ownership |

Baseline: 9/20. Scores describe the inspected baseline, not a post-cleanup certification. Focused improvements in #53 include an app rail, contextual sidebar, mobile drawer, keyboard focus, more readable production text and a dedicated social surface. Data contracts remain separately tracked.

## Genfeed reference audit

Read-only reference: `/Users/decod3rs/www/genfeedai/genfeed.ai`.
The inspected local branch is `codex/local-review-integration-20261001` at `28bbfc1c38adbf80fe34ddbe4178ba489ef79573`; it is not assumed deployed. GitHub `master` was independently checked at `122dbe0ac2514f9e1981bd46a82eab3ebbc00916`. The rail registry matches the fetched trunk source, and trunk AppLayout contains the same Codex chrome structure.

Relevant public source:

- `packages/ui/src/components/shell/app-rail/app-rail.registry.ts`: one app registry; daily apps versus More; route-based active ownership.
- `packages/ui/src/components/shell/app-rail/AppRail.tsx`: compact accessible icon links, More disclosure and optional pins.
- `packages/ui/src/components/layouts/app/AppLayout.tsx`: rail/topbar on the window plane, contextual sidebar and page inside one inset block, explicit mobile navigation.
- `packages/ui/src/components/constants/shell-chrome.constant.ts`: two consistent icon/control sizes.
- Recent shell commits include `fd2c91d6fe` (rail edges/pins) and `53b18f0807` (topbar plane).

Reuse the hierarchy, geometry, URL ownership and accessibility behavior. Do not copy tenant routing, feature flags, billing gates, provider dependencies or unneeded pin/inspector machinery into this smaller app. Genfeed was not edited or given a full application audit in this pass.

## Better production execution

The show needs a clear audience promise, a small selected source set, bounded segments and a closing decision. Hosts should see source evidence and conversational cues rather than paragraphs to read. Model comparison should separate chronology, capability evidence and workflow implications. A demo earns a slot only after rehearsal; a recorded result or source walkthrough is a valid fallback.

The same episode record should own scheduling, rundown, transcript, examples and distribution. Publishing and partner outreach need visible human actions. Analytics should answer which topic, opening, format and distribution path worked, using measured data rather than heuristic transcript grades presented as viewer retention.

The community offer is a paid workshop pilot supported by the free public skills. Demand, pricing and delivery effort need validation before subscription software or a paid membership is built. See the vault's production workshop proposal.

## Verification limits

The code graph was queried first, but its baseline was stale and contained old checkout paths; direct source inspection supplied missing coverage. Zero affected flows in that graph is not verification. Required CI and Studio checks are delivery evidence for each implementation PR. Independent Claude review is waived by the user's explicit instruction for this session.
