---
title: "[LIVE] Episode #24 — The Quota Endgame, the 272K Tripwire, and Free Max for OSS"
slug: "quota-endgame-and-the-272k-tripwire"
source: "Anthropic newsroom, OpenAI, GitHub issues (openai/codex), Sophos, The New Stack, TechTimes, AI Weekly, Hacker News"
status: "in_progress"
date: "2026-08-04"
announcement_tweet: null
thumbnail_prompt: null
---

## Format Note

This file is sources + angles only. No scripted talking points — the talking-points skill is
being redone. Segments below are ordered by suggested rundown, but reorder freely.

- Episode number: **#24**
- Date: August 4, 2026. Time slot TBC (last episode ran 14:00 CEST).
- Callback debt from #22/#23: the on-air Fable-cutoff predictions (Vincent + Mitchell + chat vote)
  must be settled on stream — receipts are in Segment 1.

## Segment 1 — Scoreboard: The Fable Cutoff Prediction, Settled

**What happened:** On July 20 the "will they pull Fable" question resolved as a split — exactly
the middle-path option we flagged. Max and Team Premium keep Fable 5 included at 50% of weekly
limits permanently; Pro and Team Standard got a one-time $100 usage credit and then fall to API
billing at $10/$50 per MTok. The credit claim window ran July 20 – August 2 (credits expire
September 17).

**Sources:**
- [TechTimes: Fable 5 ends subscription limbo — permanent for Max, credits-only for Pro](https://www.techtimes.com/articles/320905/20260718/claude-fable-5-ends-subscription-limbo-permanent-max-credits-only-pro.htm)
- [Neoteo: Fable 5 stays, Pro users move to credits](https://www.neoteo.com/en/claude-fable-5-pro-credits-max-limits)
- [webvise: what the usage credits cost now](https://www.webvise.io/blog/fable-5-leaves-subscriptions-usage-credits)
- [Anthropic: Redeploying Fable 5](https://www.anthropic.com/news/redeploying-fable-5) — pull up live for current language

**Angles:**
- Score the predictions honestly. The "vendors love a third option that lets both sides claim
  they won" call from #22 aged perfectly — say so, and say what we got wrong too.
- The claim window closed **two days ago** (Aug 2). Anyone on Pro who didn't claim the $100 is
  now paying $10/$50 metered. Practical segment: what Fable is still worth paying for per-token
  (planning/review verdicts) vs what should have moved to Opus 5 / Sol already.
- Ties directly into our routing table: this outcome is the argument for it.

## Segment 2 — The War of Resets: August Front

**What happened:** The quota-as-marketing war continues with three dated moves on the board:
the Claude Code +50% weekly boost is extended through **August 19**; Sonnet 5 promo pricing
($2/$10) ends **August 31**, standard $3/$15 from September 1; Cowork expanded to mobile + web
with doubled limits through **August 5** (Max beta first). Meanwhile Anthropic signed an AMD
capacity deal — up to 2 GW of MI450/Helios compute, up to $5B in AMD equity — which is the
"capacity story" tell we said to watch.

**Sources:**
- [Anthropic newsroom](https://www.anthropic.com/news) — verify boost/promo dates live on stream
- [explainx: Claude usage limits 2026, every change dated](https://www.explainx.ai/blog/claude-usage-limits-2026-timeline-explained)
- [Releasebot: Claude updates July 2026](https://releasebot.io/updates/anthropic/claude)
- [Anthropic Sonnet 5 announcement](https://www.anthropic.com/news/claude-sonnet-5) — promo pricing terms
- [HN: Claude Code May–July weekly limits promotion](https://news.ycombinator.com/item?id=48883064)
- [llm-stats AI news](https://llm-stats.com/ai-news) — AMD 2 GW deal summary; find primary source before quoting numbers

**Angles:**
- Calendar segment: put the three deadlines on screen. Viewers on the fence about plans should
  decide before Aug 19 / Aug 31 — that's genuinely useful, not filler.
- The AMD deal is the payoff of #22's "watch for a big infra announcement" tell. Capacity math
  drove the Fable split; 2 GW is Anthropic buying its way out of that constraint. Prediction
  hook: does Fable return to Pro plans "once capacity allows," and when?
- Live bit that worked last time: both hosts open their real usage panels on stream.

## Segment 3 — The 272K Tripwire: Codex Silently Doubles Your Bill

**What happened:** On July 18–19 OpenAI cut Codex's effective GPT-5.6 context window from 372K
to 272K. The reason: 272K is a **billing tier**, not a hard cap — the raw model spec is still
1.05M context. Prompts past 272K input are billed at 2× input / 1.5× output **for the full
request**. Under the old 372K figure, ~81K tokens sat silently in the premium band before any
warning. Harnesses built assuming 372K now compact earlier or bill double.

**Sources:**
- [openai/codex issue #32486: default context can cross the 272K higher-usage threshold](https://github.com/openai/codex/issues/32486)
- [openai/codex issue #32806: Sol context cut again, 353K → 258K](https://github.com/openai/codex/issues/32806)
- [oh-my-pi issue #6371: the silent 2× billing writeup](https://github.com/can1357/oh-my-pi/issues/6371)
- [Medium: The 272K Tripwire](https://medium.com/@sebuzdugan/the-272k-tripwire-how-gpt-5-6-codex-silently-doubles-your-bill-6b506bf7dd80)
- [AI Weekly: context window cut 372K → 272K](https://aiweekly.co/alerts/openai-codex-cuts-gpt-56-context-window-from-372k-to-272k)
- [Daniel Vaughan: why the cap is sensible engineering](https://codex.danielvaughan.com/2026/07/20/context-window-gap-codex-cli-gpt56-advertised-vs-effective-budget-compaction-strategy/) — the steelman
- [sakutto: OpenAI's explanation](https://sakutto.ai/en/articles/openai-codex-context-cut)

**Angles:**
- This is the money segment for our audience: we run Sol as the execution lane daily. Show our
  own session token counts and whether we ever crossed 272K without knowing.
- "1M context window" marketing vs 272K billing reality — the gap between the spec sheet and
  the invoice. Fair to both sides: include the steelman that capping was the honest fix.
- Practical takeaway: how to keep agent sessions under the tier (compaction, worktrees, smaller
  scopes) — connects to our existing loop-engineering material.

## Segment 4 — Anthropic Is Giving OSS Maintainers $1,200 of Free Max

**What happened:** Claude for Open Source: 6 months of free Claude Max 20x (~$1,200) for
open-source maintainers. Eligibility: public repo with 5,000+ GitHub stars OR 1M+ monthly npm
downloads, active contributions in the last 3 months; a second "Ecosystem Impact Track" covers
critical-but-less-visible packages by written application. Capped at 10,000 recipients, rolling
review, individual-only, no API credits, no auto-renew.

**Sources:**
- [Claude for Open Source — official page](https://claude.com/contact-sales/claude-for-oss)
- [AlphaSignal: 10,000 maintainers, $1,200 of free Max](https://alphasignal.ai/news/anthropic-gives-10-000-open-source-maintainers-1-200-of-free-claude-max)
- [Verdent guide: Max 20x for open source](https://www.verdent.ai/guides/claude-max-20x-open-source)
- [explainx: program breakdown](https://www.explainx.ai/blog/claude-for-open-source-expanded-max-20x-july-2026)

**Angles:**
- Straight service journalism: who in the audience qualifies, and the Ecosystem Impact Track is
  the underrated door — you don't need 5K stars if your package matters.
- The cynical read is worth one beat: this is Anthropic buying the OSS ecosystem's default
  tooling habit for $12M of compute, right after metering its flagship. Both reads are true.
- 10K cap + rolling review = apply this week, not eventually.

## Segment 5 — Your Coding Agent Looks Like a Hacker (Because It Acts Like One)

**What happened:** Sophos analyzed a week of its own endpoint telemetry: Claude Code, Cursor,
and Codex are tripping detection rules written for human intruders — DPAPI browser-credential
decryption, Windows Credential Manager enumeration, LOLBin downloads, startup-folder writes,
obfuscation-looking PowerShell. Sophos's guidance: scope rules by agent parent process and
workspace path, but keep credential-access rules firing regardless of who initiated.

**Sources:**
- [Sophos: when AI agents look like attackers](https://www.sophos.com/en-us/blog/2607_agents_vs_telemetry) — primary
- [The Hacker News writeup](https://thehackernews.com/2026/07/ai-coding-agents-found-triggering.html)
- [Technadu summary](https://www.technadu.com/ai-coding-agents-trigger-security-detection-says-sophos/)

**Angles:**
- The uncomfortable half: the detections aren't false positives in spirit — agents really do
  read credential stores and pull down binaries. The question isn't "why is the EDR wrong,"
  it's "why did my agent need my browser passwords."
- Practical: what we actually sandbox in our own setup (worktrees, permission modes, no-secrets
  rules) and where we're honestly lax. Callback to Matt Shumer's "Sol deleted my files" from #22.
- For viewers employed at real companies: expect your security team to notice your agent soon;
  better to bring them the Sophos piece first.

## Segment 6 — Open Weights Went Heavyweight: Kimi K3, DeepSeek V4-Pro, Qwen 3.6

**What happened:** The open-model lane escalated hard. Moonshot's Kimi K3 is the biggest
open-weights release ever at 2.8T parameters; Thinking Machines shipped Inkling at 975B.
DeepSeek V4-Pro (1.6T MoE / 49B active, MIT) leads open coding at 80.6% SWE-bench Verified.
Qwen 3.6-27B is the sleeper: a 27B dense model at 77.2% SWE-bench that beats Alibaba's own
397B flagship and runs on 22GB VRAM, Apache 2.0.

**Sources:**
- [llm-stats AI news](https://llm-stats.com/ai-news) — K3 / Inkling summaries; chase primary announcements before quoting param counts
- [SpectrumAILab: best open models ranked](https://spectrumailab.com/blog/best-open-source-ai-models-ranked-2026)
- [HuggingFace blog: open-source LLMs 2026](https://huggingface.co/blog/daya-shankar/open-source-llms)
- [MindStudio: best OSS LLMs for agentic coding](https://www.mindstudio.ai/blog/best-open-source-llms-agentic-coding-2026)

**Angles:**
- Direct callback to the #21 "Fable 5 is gone, what are the alternatives" episode — the escape
  hatch got materially better in one month. Update the verdict, don't rehash it.
- Qwen 3.6-27B on 22GB VRAM is the first "actually runs on hardware you own" model with
  near-frontier SWE-bench — revisit our local-hardware cost receipts from the June episode.
- Frame against Segment 1–3: as the closed vendors meter and tier, the open lane's pitch stops
  being ideology and starts being invoice math.

## Segment 7 (Flex/Short) — The Stack Nobody Planned

**What happened:** The New Stack argues Cursor, Claude Code, and Codex are converging into one
composable stack (orchestration / execution / review layers) rather than winner-take-all.
Codex hit 8M users within days of Sol GA. Cursor v3.11 added Side Chats for parallel agent
conversations.

**Sources:**
- [The New Stack: the AI coding stack nobody planned](https://thenewstack.io/ai-coding-tool-stack/)
- [The New Stack: Codex hits 8 million users](https://thenewstack.io/gpt-5-6-codex-user-surge/)

**Angles:**
- Press catching up to what we've run on-air for a month — the two-brain/routing-table thesis
  is now the industry's framing. One victory-lap beat, then what composability breaks (billing
  visibility across three vendors — links back to Segment 3).
- Cut this segment first if running long.

## Verify Live Before Quoting

Dates and prices moved twice a month all summer. On-stream, pull up the primary page before
quoting any of these:

- Boost expiry (Aug 19) and Sonnet promo end (Aug 31) — [Anthropic newsroom](https://www.anthropic.com/news)
- Fable metered rates $10/$50 and Max 50% cap — [Redeploying Fable 5](https://www.anthropic.com/news/redeploying-fable-5)
- 272K tier language — [OpenAI pricing docs](https://openai.com/api/pricing/) and the open Codex issues
- Kimi K3 / Inkling parameter counts — secondary-source only so far; find the primary release posts
- OSS program cap and eligibility — [official page](https://claude.com/contact-sales/claude-for-oss)
