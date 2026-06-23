---
name: shipshitshow-talking-points
description: Build Ship Shit Show brand voice, hooks, episode segments, talking points, cold opens, transitions, show prep, source-attached reaction decks, and host-ready commentary from transcripts, topic files, and AI/dev-tool research. Use when defining the show's tone, rewriting livestream/topic prep, creating segment structure, sharpening openings, attaching links/clips/hot takes to topics, or turning raw sources into Ship Shit Show talking points.
---

# Ship Shit Show Talking Points

Use this skill to turn AI/dev-tool research into host-ready Ship Shit Show segments that sound like Vincent live, not like vendor-analysis markdown.

## Quick Start

1. Load the current topic file, usually `apps/app/data/livestream/YYYY-MM-DD/topic-*.md`.
2. Run `scripts/show-context.sh <topic-file>` from this skill to inspect transcript coverage and nearby prep.
3. Run `scripts/extract-live-voice.sh` to sample recent transcript lines before writing tone-sensitive sections.
4. Read `references/live-voice-extraction.md` when the user asks for Vincent's voice, less robotic copy, better talking points, or more natural live phrasing.
5. Read `references/brand-voice.md` when the task involves tone, brand, cold opens, or rewrites.
6. Read `references/segment-playbook.md` when building an episode arc, segment order, transitions, or talking points.
7. Read `references/content-quality-gate.md` when judging whether a transcript, topic, or episode is worth publishing.
8. Write output in paste-ready markdown, preserving existing topic frontmatter and source URLs.

When the user says they will react live, wants links attached to the topic, or says they will not read a script, use **Live Reaction Prep Mode** below. In that mode, the topic file is a pull-up deck: each segment carries its own links, clip cues, hot takes, demo targets, and host prompts directly in the visible talking points.

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

## Thumbnail Prompt Modes

Ship Shit Show has two different thumbnail styles. Do not mix them.

### Mode 1: Livestream Thumbnail

Use for upcoming livestream topic frontmatter: `apps/app/data/livestream/YYYY-MM-DD/topic-*.md`.

Default `thumbnail_prompt` to the documented two-host editorial style unless the user explicitly asks for a different art direction.

Required livestream shape:

- Start with `16:9 YouTube livestream thumbnail, 1920x1080, photoreal cinematic render, ultra sharp, soft editorial lighting.`
- Use structured blocks in this order: `PALETTE`, `COMPOSITION`, optional `LOGO LOCK` or `CENTER ASSET`, `HOST LEFT`, `HOST RIGHT`, `BACKGROUND`, `CONTRAST RULE`, `LIGHTING`, `BRANDING`, `TEXT`, `STYLE`.
- Two hosts are large chest-up/upper-torso, cropped by left and right edges, roughly 35% of frame each, heads readable at mobile size.
- Host left is: bald man, light tan olive skin, stubble, green-hazel eyes, black hoodie, curious disbelief, one palm-up presenting hand.
- Host right is: dark wavy brown hair slicked back, navy blue polo, confused wonder, subtle "wait, what?" gesture.
- Default palette is warm parchment cream, muted beige, ivory, soft brown shadows, natural skin tones. Avoid one-note dark tech palettes.
- For model/logo episodes, if a provided logo/image asset exists, use a `LOGO LOCK` block and explicitly preserve it exactly as a flat raster asset.
- For non-logo episodes, use a centered simple editorial object/emblem in the same parchment/natural-history style. Do not replace the hosts with UI screenshots.
- Top-right episode number must be present when known, e.g. `#19`, muted dark brown/grey.
- Text rule: use no text except the episode number unless the user explicitly asks for thumbnail title text.
- Negative rule: no neon, cyberpunk, red warning stamps, generic robot faces, cluttered terminal walls, fake logos, tiny UI text, punctuation added to locked logos, or extra symbols over a provided logo.

Bad livestream thumbnail direction:

```text
Dark charcoal UI, cyan terminal glow, red warning badges, big title text, generic AI dev-tool command center.
```

Good livestream thumbnail direction:

```text
Warm parchment editorial composition, two large host portraits framing one centered asset/emblem, no title text except episode number, premium natural-history poster vibe.
```

### Mode 2: Recap Video Thumbnail

Use for edited videos or main-channel recaps made from a livestream after the stream has a clear result, failure, or thesis.

Recap thumbnails are discovery packaging, not live-show branding. They should sell the strongest viewer promise from the edited video.

Required recap shape:

- Start with `16:9 YouTube video thumbnail, 1920x1080, high-contrast editorial tech thumbnail, ultra sharp, readable at mobile size.`
- Use one dominant visual receipt from the video: the app/result, source page, benchmark/table, terminal failure, model/tool logo, or before/after state.
- Use big readable title text, usually 2-5 words, tied to the edited-video title: `CRON WRITES CODE`, `BAD CODE + CONFIDENCE`, `CAN IT CAD?`, `AI LOOP STACK`.
- Do not use the livestream episode number.
- Hosts are optional. If included, use one host reaction crop as supporting emotion, not the two-host parchment composition.
- Palette may be high-contrast tech/editorial and can use dark UI, cyan, red/yellow warning, or product colors when the topic calls for it.
- The thumbnail must communicate the video outcome or conflict cold, without needing the livestream context.
- Do not use the calm parchment two-host "live" composition unless the recap is explicitly branded as a livestream archive.

Good recap thumbnail direction:

```text
One dominant proof visual, large 2-5 word text, strong contrast, edited-video promise, no episode number.
```

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

Each segment card splits sub-sections on `### ` headings (via `parseSubSections`). Use these three headings. Keep `Claim / Receipt / Operator take` as mental scaffolding, but do not force those labels into every visible bullet when they make the prep sound robotic.

```markdown
## Talking Points — <Segment Name>

### Segment Thesis

One sentence that says what this segment proves.

### Talking Points

- Start with the uncomfortable version of the take.
- Put the receipt next: number, date, link, screenshot, bill, demo result.
- Say what changed in the workflow.
- Say what Vincent would do with it tomorrow.
- End with one clip line and a transition.

### Host Notes

- Ask Mitchell:
- Pull up:
- Don't pretend:
```

### Full episode skeleton

```markdown
## Sources — Livestream Notes

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

### Live Reaction Prep Mode

Use this mode when the host wants to react to articles, clips, docs, repos, or demos live instead of reading a polished essay. The output must still use the dashboard-safe `## ` headings above.

Rules:

- Put the source link directly beside the point it supports. Do not bury all receipts in the final Sources section.
- Every `## Talking Points — <Segment Name>` should contain at least 3 pull-up links, clip cues, repo paths, or demo artifacts inside `### Talking Points` or `### Host Notes`.
- Use source-first bullets that are easy to scan live:

```markdown
- Pull up [Source Title](https://example.com). Receipt: [date/number/clip cue/claim]. Take: [operator interpretation].
```

- For videos, include a clip cue when known: `Clip cue: around 7:50`.
- For repo demos, include the exact file or template link and the line/field to point at: `rrule`, `execution_environment`, `status = "PAUSED"`, baseline state, forbidden actions, verification.
- Include a visible `## Hot Take` section when the stream is debate/reaction-heavy.
- End each segment with one clip line and one transition, so the host can move without rereading the whole file.
- Keep `## Sources — <Group Name>` sections as the backup bibliography, grouped by how they will be used live: clips, docs, repos, demo targets, prior context.
- Avoid long quotations. Use short paraphrases and pull the original source up on screen.

Preferred reaction segment shape:

```markdown
## Talking Points — <Claim-Based Segment Name>

### Segment Thesis

One sentence that says what this source cluster proves.

### Talking Points

- Pull up [source](https://example.com). Receipt: concrete fact. Take: operator meaning.
- Pull up [clip](https://youtube.com/...). Clip cue: around 7:50. Take: what changed in the workflow.
- Show [repo/template](https://github.com/...). Point at: specific file, config key, command, or guardrail.
- Hot take: one uncomfortable sentence.
- Clip line: **"Standalone sentence."**
- Transition: why the next segment follows.

### Host Notes

- Ask Mitchell:
- Pull up:
- Don't pretend:
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
- Do a final Vincent voice pass: shorter sentences, more "okay, so", more "what are you doing?", more "it works until it doesn't", fewer polished consulting phrases.
- Keep `Claim / Receipt / Operator take` as backstage structure, but write the actual bullets like host notes Vincent can riff from.
- If a line sounds like a SaaS blog, rewrite it from the live-host point of view: "I tried this", "the bill hits", "the loop failed", "you can't trust that yet".
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
