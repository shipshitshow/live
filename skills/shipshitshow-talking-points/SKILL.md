---
name: shipshitshow-talking-points
description: Build Ship Shit Show brand voice, hooks, episode segments, talking points, cold opens, transitions, show prep, and host-ready commentary from transcripts, topic files, and AI/dev-tool research. Use when defining the show's tone, rewriting livestream/topic prep, creating segment structure, sharpening openings, or turning raw sources into Ship Shit Show talking points.
---

# Ship Shit Show Talking Points

Use this skill to turn AI/dev-tool research into host-ready Ship Shit Show segments.

## Quick Start

1. Load the current topic file, usually `apps/app/data/livestream/YYYY-MM-DD/topic-*.md`.
2. Run `scripts/show-context.sh <topic-file>` from this skill to inspect transcript coverage and nearby prep.
3. Read `references/brand-voice.md` when the task involves tone, brand, cold opens, or rewrites.
4. Read `references/segment-playbook.md` when building an episode arc, segment order, transitions, or talking points.
5. Read `references/content-quality-gate.md` when judging whether a transcript, topic, or episode is worth publishing.
6. Write output in paste-ready markdown, preserving existing topic frontmatter and source URLs.

## Source Priority

Prefer local context in this order:

1. Current topic markdown: title, summary, sources, notes, claims, links.
2. Clean transcripts: `apps/app/data/transcripts/clean/*.txt`.
3. Recent topic prep: `apps/app/data/livestream/YYYY-MM-DD/topic-*.md`.
4. Raw VTT captions: `apps/app/data/transcripts/*.vtt` when clean text is missing.
5. External sources only when a claim needs verification or fresh facts.

Do not invent dates, metrics, benchmarks, quotes, launches, outages, or money numbers. If the source is weak, label the claim as an angle, not a fact.

## Brand Thesis

Ship Shit Show is not generic AI news. It is two builders stress-testing the new software economy in public.

Core point of view:

- AI is not a feature wave. It is a labor, cost, and software-production reset.
- The useful question is not "is this impressive?" It is "what does this change in the workflow?"
- Models matter less than harnesses, routing, agents, context, cost, and trust.
- Legacy software does not vanish overnight. It becomes a rewrite target.
- The audience wants operator truth: what broke, what worked, what costs money, what ships.

## Default Output Contract

CRITICAL: The producer dashboard (`apps/app`) filters topic sections via `isUsefulSection` in [markdown-render.tsx](apps/app/src/lib/markdown-render.tsx). Only `## ` headings starting with **summary**, **hot take**, **cold open**, **talking points**, **close**, **tweets**, or **sources** render. Any other top-level heading is dropped silently. Match the exact section names below or your prep will not show up on the dashboard.

### Required top-level (`##`) section names

| Section | Allowed heading forms |
|---|---|
| Episode thesis | `## Summary` |
| Cold open script | `## Cold Open — Read This` (or `## Cold Open - READ THIS`) |
| Each segment | `## Talking Points — <Segment Name>` |
| Sources to pull up live | `## Sources — <Group Name>` |
| Tweets to paste live | `## Tweets — Paste Live` |
| Closing take | `## Closing Take` |
| Hot take / debate side | `## Hot Take` |

Anything else (e.g. `## Episode Thesis`, `## Segment 1 — X`, `## Demo Videos`, `## Verification Checklist`) WILL NOT RENDER. Either rename to a useful section or accept it stays prep-only metadata.

### Sub-section (`###`) format inside each `## Talking Points — X`

Each segment card splits sub-sections on `### ` headings (via `parseSubSections`). Use exactly these three:

```markdown
## Talking Points — <Segment Name>

### Segment Thesis

One sentence that says what this segment proves.

### Talking Points

- **Claim:** …
- **Receipt:** …
  - [Source link](https://…)
- **Why it matters:** …
- **Operator take:** …
- **Clip line:** …
- **Transition:** …

### Host Notes

- Push on:
- Avoid:
- Pull up:
```

### Full episode skeleton

```markdown
## Livestream Notes

- Title: **[LIVE] …**
- [YouTube livestream](https://…)
- [Restream studio](https://…)
- Format / angle notes

## Cold Open — Read This

> "60-120 spoken words."

## Summary

One-paragraph episode thesis.

## Talking Points — <Segment 1 Name>

### Segment Thesis
### Talking Points
### Host Notes

## Talking Points — <Segment 2 Name>

### Segment Thesis
### Talking Points
### Host Notes

## Talking Points — <Segment 3 Name>

### Segment Thesis
### Talking Points
### Host Notes

## Closing Take

## Sources — <Group Name>

## Tweets — Paste Live
```

## Hook Formula

Use this first-45-seconds structure:

1. **Claim:** Say the uncomfortable thesis immediately.
2. **Receipt:** Give one concrete proof point.
3. **Stakes:** Explain what changes for builders, devs, founders, or agent workflows.
4. **Promise:** Say what the stream will prove, build, compare, or tear down.
5. **Turn:** Bridge cleanly into the first segment.

Default shape:

```text
Everyone thinks [lazy take].
But [specific receipt] means [sharper interpretation].
If you build software, this changes [workflow/cost/trust].
So today we're going to [stream promise].
Let's go.
```

## Editing Rules

- Move the strongest transcript line into the first sentence.
- Cut stream logistics, greetings, audio checks, retweeting, and "are we live?"
- Keep banter as seasoning after the hook, not before it.
- Make every segment prove one thing.
- Prefer hard nouns over hype adjectives: bill, queue, harness, PR, outage, benchmark, token, agent, margin.
- Use swearing rarely and only when it releases real tension.
- Keep the French/Dutch/European roughness as rhythm, but remove filler that blocks the point.
- Write for live viewers and replay viewers at the same time.

## Verification

Before finalizing:

- Topic is named in the first 10 seconds.
- The cold open contains one receipt and one stake.
- Every segment has a claim, receipt, operator take, and transition.
- There is at least one clip line per segment.
- The output sounds like two builders who actually use the tools, not a news recap.
- The episode passes the minimum publish gate in `references/content-quality-gate.md`.
- **Dashboard render check:** Every `## ` heading starts with one of `Summary`, `Cold Open`, `Talking Points —`, `Sources —`, `Tweets`, `Hot Take`, or `Closing`. Anything else will be filtered out by `isUsefulSection` and never appear in the producer UI. Cross-check by skimming a prior topic file (e.g. `apps/app/data/livestream/2026-05-12/topic-01-html-new-markdown.md`) — copy its header structure, do not invent new top-level names.

After changing this skill, run:

```bash
uv run --with pyyaml python /Users/decod3rs/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/shipshitshow-talking-points
```
