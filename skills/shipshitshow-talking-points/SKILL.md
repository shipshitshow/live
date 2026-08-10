---
name: shipshitshow-talking-points
description: Build Ship Shit Show brand voice, hooks, episode segments, talking points, cold opens, transitions, show prep, live-build rundowns, source-attached reaction decks, and host-ready commentary from transcripts, topic files, business-problem briefs, and AI/dev-tool research. Use when defining the show's tone, rewriting livestream/topic prep, structuring a build episode, creating segment structure, sharpening openings, attaching links/clips/hot takes to topics, or turning raw sources into Ship Shit Show talking points.
---

# Ship Shit Show Talking Points

Use this skill to turn a business problem — plus whatever research and tooling it takes to solve it — into a host-ready Ship Shit Show build episode that sounds like Vincent live, not like vendor-analysis markdown.

## Quick Start

1. Load the current topic file, usually `apps/app/data/livestream/YYYY-MM-DD/topic-*.md`.
2. Fill the four **Episode Spine** beats below before writing any segment. If the brief is a model launch, convert it first — see "Model News Is Never The Spine".
3. Run `scripts/show-context.sh <topic-file>` from this skill to inspect transcript coverage and nearby prep.
4. Run `scripts/extract-live-voice.sh` to sample recent transcript lines before writing tone-sensitive sections.
5. Read `references/live-voice-extraction.md` when the user asks for Vincent's voice, less robotic copy, better talking points, or more natural live phrasing.
6. Read `references/brand-voice.md` when the task involves tone, brand, cold opens, or rewrites.
7. Read `references/segment-playbook.md` when building an episode arc, segment order, transitions, or talking points.
8. Read `references/content-quality-gate.md` when judging whether a transcript, topic, or episode is worth publishing.
9. Write output in paste-ready markdown, preserving existing topic frontmatter and source URLs.

The **build episode is the default**. When the user says they will react live, wants links attached to the topic, or says they will not read a script, use **Live Reaction Prep Mode** below — but a reaction episode still opens on a problem and still owes an artifact wherever one is possible. In that mode, the topic file is a pull-up deck: each segment carries its own links, clip cues, hot takes, demo targets, and host prompts directly in the visible talking points.

## Source Priority

Prefer local context in this order:

1. Current topic markdown: title, summary, sources, notes, claims, links.
2. Clean transcripts: `apps/app/data/transcripts/clean/*.txt`.
3. Recent topic prep: `apps/app/data/livestream/YYYY-MM-DD/topic-*.md`.
4. Raw VTT captions: `apps/app/data/transcripts/*.vtt` when clean text is missing.
5. External sources only when a claim needs verification or fresh facts.

Do not invent dates, metrics, benchmarks, quotes, launches, outages, or money numbers. If the source is weak, label the claim as an angle, not a fact.

## Brand Thesis

Ship Shit Show is not AI news. It is two builders taking a real business problem and solving it live, then publishing the thing they built.

Core point of view:

- AI is not a feature wave. It is a labor, cost, and software-production reset.
- The useful question is not "is this impressive?" It is "what business problem does this now solve, and what does it cost to run?"
- Models matter less than the problem, the workflow around them, and whether the result survives contact with a real operator.
- The proof is the artifact. An episode that ends without something publishable is an episode that did not happen.
- The audience wants operator truth: what broke, what worked, what costs money, what ships.

### Who is watching

The viewer is a professional who runs or works in a normal business — agency owner, operations lead, founder, technical decision-maker. They want AI outcomes and do not follow AI news. They will hire whoever demonstrates competence in language they understand.

They are **not** the AI-native developer who can already build everything on the stream. That viewer is welcome, but the episode is not designed for them, and topics chosen for their approval are the failure mode this format exists to prevent.

## Episode Spine

Every episode runs on the same four beats. If a prep doc cannot fill all four, the topic is not ready.

1. **Problem** — a business problem stated the way the person with the problem would state it. "Calls go unanswered and the business loses the job", not "voice agent orchestration".
2. **Build** — the thing gets built live, in the open, including the parts that fail. The failure is content, not an embarrassment to edit around.
3. **Demo** — it runs. Show the working result and say plainly what is rough and what it would take to run for real.
4. **Artifact + CTA** — something publishable exists at the end (repo, template, playbook, deployed demo) and the close points at it plus "reach out if this is your problem".

Map the spine onto capsules: usually one capsule for problem framing, two to three for the build, one for the demo and what it would cost to run.

### Model News Is Never The Spine

A model release, benchmark, price change, or timeline drama is **never** the episode topic. It can be:

- the **tool** the build uses ("we built this with Anthropic's newest model, Claude Fable 5"), or
- a contained **reaction segment** of roughly five minutes, one capsule maximum, placed after the build.

It can never be the problem, the thesis, or the title. If a brief arrives that is only a model launch, convert it: find the business problem that release now makes solvable, and build that. If no such problem exists, the release is a reaction segment inside an episode about something else.

This rule exists because model-launch episodes select for an audience that will never become a customer. Prior episodes titled after model versions are the pattern being replaced — do not reproduce them.

## Say It In Plain Language

The show is clipped and distributed to people outside the AI bubble. A clip full of insider shorthand is unusable no matter how good the take is.

On air:

- **Spell out every name on first mention, then simplify.** "Claude Fable 5, Anthropic's newest model" → afterwards just "the model". Never open with a bare version number: "4.8", "4.6", "K2", "Sol".
- **Translate the vocabulary** the first time it appears: a connector that lets the AI drive our tools (not "MCP"), the AI running multi-step work on its own (not "agentic"), we took the open-source code and built on top of it (not "we forked it"), usage costs (not "token spend").
- Once a term has been introduced properly, use it freely — the rule is about first contact, not permanent avoidance.
- Write `### Host Notes` reminders where a segment is likely to drift into shorthand.

Swearing stays as-is for the show itself. The LinkedIn register is different and is owned by a separate skill — see below.

## Distribution Copy Is A Separate Skill

This skill owns the spoken show: segments, talking points, cold opens, hot takes, closes.

LinkedIn post sets, the buyer-register rewrite, and the UTM link convention are owned by the `linkedin-pipeline` skill. Do not draft LinkedIn copy from here — invoke that skill after the episode. Announcement tweets and paste-live tweets stay here as production artifacts in Ressources sections.

## Thumbnails Are a Separate Skill

Thumbnail prompts, art direction, image output paths, and the topic file's `thumbnail_prompt`
field are owned by the `thumbnails` skill. Do not write thumbnail prompts from here — invoke that
skill instead. It covers livestream, recap, and surgical re-prompt modes.

## Capsule Format (default since #24)

The show is distributed as Shorts and standalone cuts, not just one long VOD. Build every episode as
**4–6 standalone capsules of 10–15 minutes**, each of which survives being cut as its own video.

Per capsule:

- One thesis it proves. If a capsule needs the previous capsule to make sense, it is not a capsule.
- Its own cold context: name the tool/company/number inside the capsule, never "as we said earlier".
- **At least one designed shorts moment** — 30–60 seconds, self-contained, with a stated hook and
  payoff. Write it as a shorts moment in the prep, do not hope the editor finds one.
- Its own receipt on screen: link, bill, benchmark, diff, or demo.

Capsules map onto `## Talking Points — <Capsule Name>` sections. Put the shorts moment in
`### Host Notes` as `Shorts moment:` so the editor can grep for it.

## Two Passes Over the Topic File

The topic markdown gets written twice, by two different jobs. Know which one you are doing.

1. **Research pass** — sources, permalinks, angles, freshness sweeps, verification flags. Prose
   headings are fine here; this pass is for Vincent's reading, not the dashboard.
2. **Talking-points pass** — this skill. Turns that research into host-ready segments using the
   dashboard-safe headings below.

When Vincent says "just links and sources, no talking points", stop after pass 1 and do not invent
on-camera lines. When he asks for talking points on an existing prep doc, read the whole file first
and convert its research sections into capsules — do not restart the research.

## Default Output Contract

CRITICAL: The producer dashboard (`apps/app`) filters topic sections via `isUsefulSection` in [markdown-render.tsx](apps/app/src/lib/markdown-render.tsx). Only `## ` headings starting with **summary**, **hot take**, **cold open**, **talking points**, **close**, **tweets**, or **sources** render. Any other top-level heading is dropped silently. Match the exact section names below or your prep will not show up on the dashboard.

### Required top-level (`##`) section names

| Section | Allowed heading forms | Renders in |
|---|---|---|
| Episode thesis | `## Summary` | Talking Points |
| Cold open script | `## Cold Open — Read This` (or `## Cold Open - READ THIS`) | Talking Points |
| Each segment | `## Talking Points — <Segment Name>`, `## Segment <N> — <Headline>`, `## Capsule <N> — <Name>` | Talking Points |
| Closing take | `## Closing Take` | Talking Points |
| Hot take / debate side | `## Hot Take` | Talking Points |
| Demo prompts | any heading containing `/goal`, `goal prompt`, or `copy paste` | Prompts |
| Everything else | `## Sources — <Group>`, `## Tweets — Paste Live`, `## YouTube Description — Paste This`, `## Announcement Tweet`, `## Verify Live Before Quoting`, … | Ressources |

**One card per news story.** Each segment heading becomes exactly one card in the
Talking Points tab, and that card carries the *whole* section — thesis, points,
sources, angles, host notes. Do not split a story's receipts into a separate
top-level section; nest them under `### Sources` inside the segment so the host
reads one card per story instead of cross-referencing tabs.

**Keep publishing artifacts out of segments.** The YouTube description, announcement
tweet, thumbnail prompts, trend checks and verification checklists are production
material, not talking points. Give them their own top-level heading (they land in
Ressources automatically) — never bury them inside a segment.

`## Segment <N> — Headline: <text>` is accepted; the `Segment <N>` half renders as the
card's label and the `Headline:` prefix is stripped from the title.

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

1. **Problem:** Name the business problem in the viewer's own words.
2. **Receipt:** Give one concrete proof it is real and expensive — a number, a market signal, a first-hand story.
3. **Stakes:** Say what it costs the business to keep living with it.
4. **Promise:** Say what gets built on this stream and that it ships publicly by the end.
5. **Turn:** Bridge cleanly into the first segment.

Default shape:

```text
[Business problem stated plainly].
[Receipt: number, cost, or first-hand story].
Every week that stays broken, it costs [stake].
So today we're building [the thing], live, and publishing it before we log off.
Let's go.
```

Reaction-heavy episodes may still use the older claim-first hook shapes in `references/segment-playbook.md`, but the build episode is the default and its hook opens on the problem, never on a launch.

## Editing Rules

- Move the strongest transcript line into the first sentence.
- Cut stream logistics, greetings, audio checks, retweeting, and "are we live?"
- Keep banter as seasoning after the hook, not before it.
- Make every segment prove one thing.
- Prefer hard nouns over hype adjectives: bill, queue, missed call, invoice, headcount, outage, margin, hourly rate.
- Translate insider shorthand on first mention (see "Say It In Plain Language"). If a bullet only makes sense to someone who reads AI Twitter, rewrite it for the operator.
- Use swearing rarely and only when it releases real tension.
- Keep the French/Dutch/European roughness as rhythm, but remove filler that blocks the point.
- Do a final Vincent voice pass: shorter sentences, more "okay, so", more "what are you doing?", more "it works until it doesn't", fewer polished consulting phrases.
- Keep `Claim / Receipt / Operator take` as backstage structure, but write the actual bullets like host notes Vincent can riff from.
- If a line sounds like a SaaS blog, rewrite it from the live-host point of view: "I tried this", "the bill hits", "the loop failed", "you can't trust that yet".
- Write for live viewers and replay viewers at the same time.

## Verification

Before finalizing:

- The business problem is named in the first 10 seconds, in the viewer's language.
- The cold open contains one receipt and one stake.
- All four spine beats are present: problem, build, demo, artifact + CTA.
- The prep names the artifact that will exist at the end and where it gets published.
- The close contains a CTA — the artifact link plus a reason to reach out.
- No model release is carrying the episode thesis or title.
- Every insider term has a spelled-out first mention; no bare version numbers anywhere in the spoken lines.
- Every segment has a claim, receipt, operator take, and transition.
- There is at least one clip line per segment.
- The output sounds like two builders who actually use the tools, not a news recap.
- The episode passes the minimum publish gate in `references/content-quality-gate.md`.
- **Dashboard render check:** Every `## ` heading starts with one of `Summary`, `Cold Open`, `Talking Points —`, `Sources —`, `Tweets`, `Hot Take`, or `Closing`. Anything else will be filtered out by `isUsefulSection` and never appear in the producer UI. Cross-check by skimming a prior topic file (e.g. `apps/app/data/livestream/2026-05-12/topic-01-html-new-markdown.md`) — copy its header structure, do not invent new top-level names.

After changing this skill, run:

```bash
uv run --with pyyaml python /Users/decod3rs/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/shipshitshow-talking-points
```
