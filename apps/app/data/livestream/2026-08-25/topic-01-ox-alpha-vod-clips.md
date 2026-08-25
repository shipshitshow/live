---
title: "[LIVE] Ox Alpha Cuts Our Show. Free Until Thursday."
slug: "ox-alpha-vod-clips"
source: "OpenRouter stealth/ox-alpha listing, OpenCode 1.18.23, genfeed.ai clip-analyze pipeline, Ship Shit Show public VOD archive"
status: "in_progress"
date: "2026-08-25"
announcement_tweet: null
thumbnail_prompt: "16:9 YouTube livestream thumbnail, 1920x1080, photoreal cinematic render, ultra sharp, soft editorial lighting. PALETTE: warm parchment cream, muted beige, ivory, soft brown shadows, natural skin tones, brushed silver, restrained navy and black; no neon, no cyberpunk, no red warning stamp. COMPOSITION: two identity-locked hosts large chest-up and cropped by the left and right edges, each roughly 32-35% of frame, framing a centered film-strip-to-clip workflow. CENTER ASSET: an oversized horizontal 16:9 film strip in three-quarter view with four visible sparse frames, one clean dark-brown arrow flowing downward from it into two tall vertical 9:16 clip cards standing side by side, each card carrying a simple subtitle bar and a small timestamp block; a soft unlabeled silhouette of an ox head is faintly embossed into the parchment behind the film strip like a watermark; all UI is symbolic with no readable copy. HOST LEFT: preserve Vincent from the injected reference photo, bald with light tan olive skin, stubble, green-hazel eyes, black hoodie, skeptical evaluating expression, arms lightly folded. HOST RIGHT: preserve Mitchell from the injected reference photo, dark slicked-back hair, fair skin, blue eyes, navy polo, surprised it-found-that expression, subtle pointing gesture toward the vertical clip cards. BACKGROUND: warm parchment editorial texture with soft beige vignette and faint natural-history film and optics sketches. CONTRAST RULE: hosts, film strip, and the two vertical clip cards are large and instantly readable at mobile size. LIGHTING: warm frontal studio key light, natural skin, gentle silver rim light along the film strip edge. BRANDING: top-right episode number '#27' in muted dark brown with safe margin. TEXT: no title, captions, product slogans, model names, app names, tiny UI labels, or text except '#27'. STYLE: premium natural-history tech poster, clean Ship Shit Show live-thumbnail composition. NEGATIVE: no extra devices, invented hardware, fake logos, generic robots, dark terminal walls, clutter, distorted hands, watermarks, no literal live ox or cattle photography, no readable model name anywhere in frame."
---

## Sources — Livestream Notes

- Title: **[LIVE] Ox Alpha Cuts Our Show. Free Until Thursday.**
- Build: add a vision pass to the genfeed `clip-analyze` pipeline using `stealth/ox-alpha`
- Start: **4:00 PM**
- Format: live build, English only, 60–90 minutes
- Artifact: vision-augmented highlight detection in `genfeed.ai`, scored against a hand-cut episode
- Harness: **plain OpenCode 1.18.23 in the terminal.** Not T3 Code — see the harness segment.
- Test subject: `https://www.youtube.com/watch?v=QoQjddWCnKA` — Composer 2.5 livestream, 47:20
- Ground truth: `https://www.youtube.com/watch?v=bc6WbJJNWPU` — the cutdown we made from it by hand
- OpenRouter model listing: https://openrouter.ai/stealth/ox-alpha
- Privacy rule: **public Ship Shit Show VODs only.** Ox Alpha is an anonymous provider that reportedly retains prompts. Nothing from Mantella, no client work, no private repo, no `_private/` directory.
- Never show `.env` values, `~/.local/share/opencode/auth.json` contents, the OpenRouter key, or any private repository path on camera.

## Cold Open — Read This

> "There is a free model on OpenRouter right now with no name on it. A million tokens of context, and it takes video. Nobody knows who made it, it is free until roughly Thursday, and the terms say it keeps your prompts. So here is the question I actually care about: is it good enough to change something I ship? Our clip pipeline picks moments by reading the transcript. Text only. Which means it has never once seen a reaction, a screen share, or the face someone makes right before the good line. Today we give it eyes. Then we put its picks next to the clips I cut by hand in June and let you score it. If it wins, the feature ships. If it loses, you get to watch a free stealth model faceplant on live television. Let's go."

## Summary

genfeed already has a clip pipeline. `analyze_clip_project` downloads audio, transcribes it, and detects highlights from the text. It is blind — every visual moment in a 47-minute livestream is invisible to it. Today we add a vision pass: sparse frame extraction at candidate moments, sent with the full transcript to `stealth/ox-alpha` in one 1M-token window, merged back into the existing highlight ranking. The receipt is a three-way scoreboard against a livestream we already cut by hand. The trust segment is the part that matters commercially: why a free anonymous model that retains prompts is fine for a public VOD and disqualified for client work.

## Talking Points — The Pipeline Has Never Seen The Show

### Segment Thesis

Clip selection from a transcript is guessing with the lights off, and everybody shipping clip tooling is doing exactly that.

### Talking Points

- Pull up `packages/tools/src/registry/source/mcp-only/clips.tools.ts`. Read the description out loud: downloads audio, transcribes, LLM-detects highlights. Audio and text. That is the whole input.
- A livestream is not a podcast. The moment worth clipping is often the thing nobody says: the terminal going red, the benchmark number landing, the pause before somebody admits it did not work.
- Every one of those is a flat line in a transcript. The pipeline cannot rank what it cannot perceive.
- This is not a genfeed problem, it is an industry default. Audio-only is what almost every clip tool ships because vision was too expensive to spray across an hour of video.
- Clip line: **"Our clip picker has never watched a single second of our show."**
- Transition: the reason nobody fixed this is cost, and this week the cost is zero.

### Host Notes

- Ask Mitchell: when you scrub a stream looking for a clip, what are you actually looking at — the words, or the screen?
- Pull up: the Composer 2.5 stream scrubbed to a moment with strong visual payoff and near-zero dialogue.
- Don't pretend: transcript-only ranking is useless. It is decent at quotes. It is blind to proof.

## Talking Points — What "Video Input" Actually Means

### Segment Thesis

It does not watch the file. It reads frames you choose, and the honest version of that is more impressive than the marketing version.

### Talking Points

- Show the listing live: `stealth/ox-alpha`, context `1,048,576`, modality `text+image+video -> text`, prompt `$0`, completion `$0`. Verified this morning.
- Correct the hype on air: you extract frames with ffmpeg and send them as images. Nobody is streaming an MP4 into a context window.
- Pass 1 is pure ffmpeg and costs zero tokens: `scdet` for scene cuts, `ebur128` for audio energy, `silencedetect` for dead air. That pass alone narrows 47 minutes to a few hundred candidate moments.
- Pass 2 is the expensive one and it is still cheap: roughly 300 frames at about 1.5K tokens each is ~450K, plus a ~15K transcript. Call it under half the window. It fits with room to spare.
- The trick is not the model. The trick is that ffmpeg does the boring 95% for free so the model only looks where looking is worth it.
- Clip line: **"You do not need a model that watches everything. You need one that looks where ffmpeg tells it to."**
- Transition: capability is settled, so the only real question left is whether you are allowed to point it at your code.

### Host Notes

- Pull up: the OpenRouter listing JSON, then the ffmpeg filter list.
- Say plainly: sparse sampling means it can miss a moment between frames. That is a real limitation, not a footnote.
- Don't pretend: 1M context means it read everything carefully. Long-context recall degrades and we are not benchmarking that today.

## Talking Points — Free, Anonymous, And It Keeps Your Prompts

### Segment Thesis

The correct response to a free frontier-class model is not "use it everywhere" and not "never touch it" — it is knowing exactly which of your repositories it is allowed to see.

### Talking Points

- Three facts, stated flat: nobody has confirmed who built it, the free window traces to a one-week note around 20 August so it likely ends around Thursday, and the listing terms report that prompts are retained.
- That combination is disqualifying for a lot of work and completely fine for this work. Both halves of that sentence matter.
- Why this build is safe: `genfeedai/genfeed.ai` is a public repository and the test video is already published on our own YouTube channel. There is nothing here that is not already public. Retention of public data is not a leak.
- Why I will not do the obvious next thing: I run Mantella, and I do client work. Neither of those goes anywhere near an anonymous endpoint with retention terms, free or not, ever, regardless of how good the output is today.
- The operator rule worth stealing: sort your repositories into public and not-public before you sort your models into good and bad. The model question is downstream of the data question.
- For anyone in the EU watching: an unnamed processor with an unknown data location is not a provider you can put in a processing agreement. That is not a vibe, that is the paperwork.
- Clip line: **"Free is not the risk. Anonymous plus retention is the risk, and it is only a risk if you point it at something private."**
- Transition: rules are set, repository is public, so the only thing left is whether the thing can actually build.

### Host Notes

- Ask Mitchell: where would you personally draw the line on pointing an unnamed provider at a codebase?
- Pull up: the genfeed GitHub repository page showing it is public. That is the whole permission slip.
- Don't show: `_private/`, the `auth.json` file, any client repository, or the OpenRouter key in any form.
- Don't pretend: this is a settled question. Say it is our rule and let people argue in chat.

## Talking Points — Why We Are Not Using The GUI Everyone Is Tweeting About

### Segment Thesis

The tool with the best demo video this week is not the tool that survives contact with this model, and showing the receipts is more useful than showing a working GUI.

### Talking Points

- T3 Code is the harness in everyone's timeline right now. I tried it with Grok and Ox and it did not hold up, so I went and read the tracker instead of guessing.
- Open issue: the OpenCode adapter wants `provider/model` while the OpenCode Go runtime rejects that shape and wants a bare model id. Ox Alpha ships through OpenCode Go. Open since June.
- Open issue: OpenCode skills return zero in the provider cache because a pipe buffer truncates the skill listing. Skills are the standard workaround for this model looping on long chains, so the fix for the failure mode is itself broken.
- Six open Grok issues on top of that, including a turn that stalls mid-reasoning for over an hour while the UI still says Working.
- Fair credit where it is due: the three issues named specifically for Ox Alpha were all closed between 21 and 23 August, so a recent build fixed part of this. The adapter and skills issues underneath are still open.
- So we run plain OpenCode in the terminal. Less pretty, fewer moving parts, and every failure tonight belongs to the model instead of the wrapper.
- Clip line: **"I am not running the tool with the best demo video. I am running the one with the fewest open issues between me and the model."**
- Transition: harness picked, rules set, now it either builds or it does not.

### Host Notes

- Pull up: the t3code issue list filtered to open, sorted by recent. Do not editorialize past what is on screen.
- Say plainly: this is not a T3 Code hit piece. It moves fast and this is a stealth model that landed five days ago.
- Keep this to 4 minutes. If the build is running late, cut this segment entirely.

## Talking Points — The Scoreboard Is A Video We Already Made

### Segment Thesis

Two robot lists side by side prove nothing; the only honest scoreboard is the cut a human already published.

### Talking Points

- In June we took the Composer 2.5 livestream, 47 minutes, and cut it by hand into a published video. Those human choices are the answer key.
- Three columns on screen: what genfeed picks today from audio only, what genfeed picks with the vision pass, and what I actually chose in June.
- Score it live on one question per clip: did it find the moment I found. Not "is it a good clip" — that is unfalsifiable and everybody cheats at it.
- The interesting result is not agreement. It is a moment the vision pass finds that I missed, or a moment it ranks first that is visually loud and completely hollow.
- Say the failure mode before it happens: this model is documented to loop on long tool chains. If it loops, we watch it loop, and that is the review.
- Clip line: **"The answer key is a video we already published. It cannot argue with us afterwards."**
- Transition: whatever the score is, there is a bill attached to it on Thursday.

### Host Notes

- Pull up: the June cutdown timeline next to the new ranked list.
- Ask Mitchell to score independently and out loud before I say my number.
- Don't pretend: a 5-clip sample is statistically meaningful. Call it a smoke test, because it is one.

## Closing Take

The pipeline was blind and it was blind for a good reason — until this week, spraying vision across an hour of video cost real money. A free stealth model with a million tokens of context made the experiment cost nothing, so we ran it in public, against an answer key we could not move afterwards. The feature either earned its place in genfeed tonight or it did not, and either way you watched the whole thing. On Thursday the free window closes and the same run starts costing something. If it wins tonight, the honest follow-up is what it is worth paying for. If you are trying to work out which of your own repositories an unnamed provider is allowed to see, that is a conversation worth having — reach out.

## Operator Card

### Live Build Order

- **1 · Vincent:** show the OpenRouter listing and the ffmpeg-full receipt. Set the public-repo-only rule on camera.
- **2 · Ox Alpha:** read `clip-analyze`, `clip-orchestrator`, and `clip-reference-frame.helper.ts`, then produce a plan. Read-only.
- **3 · Ox Alpha:** build Pass 1 — the zero-token ffmpeg fingerprint.
- **4 · Ox Alpha:** build Pass 2 — sparse frame sampling into an OpenRouter vision call, merged into the existing highlight ranking.
- **5 · Fable:** review security, correctness, and whether the free stealth model wrote anything unsafe.
- **6 · Ox Alpha:** fix blocking findings only.
- **7 · Vincent:** run against `QoQjddWCnKA` and build the three-way scoreboard.
- **8 · Ox Alpha:** stretch only if the scoreboard is green — local karaoke render of the top clip.
- **9 · Everyone:** no `.env`, no keys, no private repositories, no client work on camera.

### Live Progress

- [ ] Listing and ffmpeg-full shown
- [ ] O1 plan done
- [ ] O2 fingerprint pass works
- [ ] O3 vision pass returns ranked moments
- [ ] F1 reviewed
- [ ] O4 blocking fixes applied
- [ ] Scoreboard built against the June cut
- [ ] Stretch render works

## Pre-show Checklist

### Blocking — Do This First

The stock homebrew ffmpeg has no `libass`, no `freetype`, and no `drawtext`. Burned-in subtitles cannot render. Install the full build before the stream:

```bash
brew install ffmpeg-full
```

Then confirm the filters exist. This must print matches or the stretch render is dead:

```bash
ffmpeg -hide_banner -filters | grep -E "subtitles|^ .. ass "
```

### Verified Green As Of This Morning

- `opencode 1.18.23` installed, `openrouter/stealth/ox-alpha` visible in `opencode models`
- OpenRouter authenticated in OpenCode as an API provider
- `yt-dlp 2026.08.19` working against our own channel
- `ffmpeg 9.0.1` has `scdet`, `silencedetect`, `ebur128`, `cropdetect`, `h264_videotoolbox`
- Word-level caption timings confirmed present in YouTube `json3` auto-captions — **whisper is not needed**

### Secrets — Never Paste Values On Stream

- `OPENROUTER_API_KEY`: needed by the pipeline as an environment variable, separate from OpenCode's stored auth. Say: "The OpenRouter key is already exported in the shell."
- Never open `~/.local/share/opencode/auth.json` on camera.

Confirm it is set without revealing it:

```bash
[ -n "$OPENROUTER_API_KEY" ] && echo "OPENROUTER_API_KEY set (${#OPENROUTER_API_KEY} chars)" || echo "NOT SET"
```

### Hard Privacy Rule

- Public Ship Shit Show VODs only. Public genfeed repository only.
- Nothing from Mantella, no client repository, no `_private/`.
- If a private path appears in a file tree on camera, stop and close it before continuing.

### Repository State

- genfeed is currently on `qa/260825`. Start the build from a clean branch off `master`.
- Confirm the working tree is clean before the first prompt so the review diff is honest.

### Open Before The Stream

- Terminal with OpenCode ready and the genfeed repository open.
- The OpenRouter `stealth/ox-alpha` listing page.
- The t3code open-issues list, filtered and ready.
- The June cutdown `bc6WbJJNWPU` and the source livestream `QoQjddWCnKA` in tabs.
- Fable session ready for the review beat.
- This producer page on the second screen.

## Definition Of Done

### Minimum Viable Build

- A branch off `master` in the public genfeed repository, working tree clean at start.
- Pass 1 runs entirely in ffmpeg and consumes zero model tokens.
- Pass 1 emits candidate timestamps from scene cuts, audio energy, and silence.
- Sparse frames are extracted only at candidate timestamps, capped at a fixed frame budget.
- Frames plus the full transcript go to `stealth/ox-alpha` in a single request.
- The response is merged into the existing highlight ranking rather than replacing it.
- The frame budget and model id are configuration, not hardcoded constants.
- No key is ever logged, printed, or committed.
- Three-way scoreboard is on screen against the June hand-cut.
- All user-facing strings English.

### Stretch

- Local render of the top clip: 9:16 static crop, burned karaoke subtitles from `json3` word timings via `ffmpeg-full`.
- Half-second precision on clip in and out points.
- A written cost estimate for the same run at real pricing after the free window closes.

## Architecture Reference

### Existing Patterns To Copy

- Analyze queue: `apps/server/api/src/queues/clip-analyze`
- Orchestration: `apps/server/api/src/services/clip-orchestrator`
- Collections: `apps/server/api/src/collections/clip-projects`, `clip-results`
- **Frame extraction already exists** — do not rebuild it: `packages/helpers/src/media/clip-reference-frame.helper.ts` and `apps/server/files/src/services/clip-reference-frames`
- Node definition style: `packages/workflows/src/nodes/definitions/video-qa.ts`
- Executor style: `packages/workflows/src/engine/executors/saas/video-qa-executor.ts`
- ffmpeg configuration: `packages/config/src/schemas/ffmpeg.schema.ts`
- Provider and model registries: `packages/types/src/nodes/providers.ts`, `packages/constants/src/model-catalog.constant.ts`
- Job contracts: `packages/queue-contracts/src/job-data/clip-factory-job.interface.ts`
- MCP surface: `packages/tools/src/registry/source/mcp-only/clips.tools.ts`

### Note On Scope

`generate_clips` advertises a `raw-cut` mode that is still in flight, so rendering through the genfeed API is not a dependency tonight. The MVP ends at better ranking. The stretch render runs locally through `ffmpeg-full`.

## 60–90 Minute Run Of Show

- **0 · Intro · Vincent · 4 min:** the listing, the ffmpeg-full receipt, the public-repo-only rule.
- **1 · Blind pipeline · Vincent · 5 min:** show that clip selection is audio and text only.
- **2 · Plan · Ox Alpha · 10–12 min:** read the existing pipeline, produce the insertion plan.
- **3 · Build Pass 1 · Ox Alpha · 12–15 min:** ffmpeg fingerprint, zero tokens.
- **4 · Build Pass 2 · Ox Alpha · 20–25 min:** frame sampling and the vision call.
- **5 · Review · Fable · 6–8 min:** security and correctness findings.
- **6 · Fix · Ox Alpha · 5–8 min:** blocking only.
- **7 · Scoreboard · Vincent and Mitchell · 12–15 min:** three-way comparison against the June cut.
- **8 · Harness aside · Vincent · 4 min:** why not T3 Code. **Cut this first if time is short.**
- **9 · Stretch · Ox Alpha · remaining:** local karaoke render.

## Copy Paste Prompt — O1 Plan The Vision Pass

```text
You are working in the public genfeedai/genfeed.ai repository. READ-ONLY. Do not write code yet.

Context:
This repo already has a clip pipeline that selects highlights from a source video using audio + transcript only. It is blind to everything visual. We are adding a vision pass.

Read these before planning:
- apps/server/api/src/queues/clip-analyze
- apps/server/api/src/services/clip-orchestrator
- packages/helpers/src/media/clip-reference-frame.helper.ts
- apps/server/files/src/services/clip-reference-frames
- packages/tools/src/registry/source/mcp-only/clips.tools.ts
- packages/workflows/src/engine/executors/saas/video-qa-executor.ts
- packages/config/src/schemas/ffmpeg.schema.ts
- packages/queue-contracts/src/job-data/clip-factory-job.interface.ts

Goal:
Insert a two-pass visual scoring step into the existing highlight ranking.

Pass 1 (zero model tokens, pure ffmpeg):
- scene cuts via scdet
- audio energy via ebur128
- dead air via silencedetect
- output: candidate timestamps with a cheap salience score

Pass 2 (single model call):
- extract sparse frames ONLY at Pass 1 candidates, hard-capped at a configurable frame budget (default 300)
- send frames + the full transcript to OpenRouter model id: stealth/ox-alpha
- model takes text+image+video input, 1,048,576 token context
- return ranked moments with start/end timestamps and a short reason per moment
- MERGE into the existing highlight ranking; do not replace it

Hard constraints:
- Frame budget and model id must be configuration, following the existing config schema patterns. No magic numbers.
- Read the OpenRouter key from process.env.OPENROUTER_API_KEY. Never log it, never print it, never write it to a file.
- Follow the existing executor and node-definition patterns. Do not invent a new architecture.
- Reuse clip-reference-frame.helper.ts for frame extraction. Do NOT write a new frame extractor.
- Strict TypeScript: no any, no @ts-ignore without an explanatory comment, no console.log — use the repo logger.
- All user-facing strings English.
- Bun, not npm.

Produce a plan containing:
A) What the current audio-only path does, in specifics, with file references.
B) The exact insertion point for the vision pass.
C) Files to add and files to change.
D) Config keys to add and where they belong.
E) The merge strategy between text-derived and vision-derived scores.
F) Failure handling: model timeout, malformed response, frame budget exceeded, missing key.
G) A strict MVP cut line for a 90-minute live build, and what is explicitly deferred.
H) Test plan.

Output structured markdown. No code files yet. End with a numbered build checklist you will execute next.
```

## Copy Paste Prompt — O2 Build Pass 1

```text
Implement Pass 1 only. Do not start Pass 2.

Pass 1 is pure ffmpeg and must consume ZERO model tokens.

Requirements:
1) Given a local video file, produce candidate timestamps from:
   - scene changes (scdet)
   - audio loudness peaks (ebur128)
   - silence boundaries (silencedetect)
2) Combine into a single ranked list of candidate moments with a cheap numeric salience score.
3) Cap output at a configurable candidate limit.
4) Follow the existing ffmpeg config patterns in packages/config/src/schemas/ffmpeg.schema.ts.
5) Strict TypeScript. Repo logger, never console.log. No any.
6) Unit test with a short fixture clip.

When done, print:
- files changed
- the exact command to run Pass 1 against a local mp4
- the candidate count and the top 10 timestamps

Stop after this. Do not proceed to Pass 2 until I say go.
```

## Copy Paste Prompt — O3 Build Pass 2

```text
Implement Pass 2 now that Pass 1 is green.

1) Extract frames ONLY at Pass 1 candidate timestamps.
   - Reuse packages/helpers/src/media/clip-reference-frame.helper.ts. Do not write a new extractor.
   - Hard cap at the configured frame budget (default 300). If candidates exceed the budget, downsample by salience score, never by truncation.
   - Downscale frames before encoding. Full 1080p frames are wasted tokens.

2) Build a single OpenRouter request:
   - model: stealth/ox-alpha
   - content: the sparse frames as images + the full transcript text
   - ask for ranked moments with startSeconds, endSeconds, hookTitle, and reason
   - request a strict JSON response and validate it before use

3) Merge the returned moments into the existing highlight ranking. Do not replace the audio-only path — it stays as a fallback when the vision call fails.

4) Failure handling, all of it required:
   - missing OPENROUTER_API_KEY: fail fast with a clear error, never a stack trace containing config
   - model timeout: fall back to the audio-only ranking and log a warning
   - malformed or non-JSON response: fall back, log, do not crash the job
   - never retry more than twice

5) Never log the key, the raw frames, or the full transcript at info level.

6) Strict TypeScript. No any. No @ts-ignore without an explanatory comment. Repo logger only.

7) Tests: frame budget enforcement, malformed response fallback, missing key, happy path merge.

When done, print:
- files changed
- the command to run the full two-pass analysis on a local mp4
- the estimated token count actually sent
```

## Copy Paste Prompt — F1 Review

```text
You are Fable, code reviewer. Review the uncommitted vision-pass changes in the genfeed repository.

Important context for this review: this code was written by an anonymous stealth model whose provenance is unknown. Weight the security pass accordingly.

Check for:
1) Secret handling. Is OPENROUTER_API_KEY ever logged, printed, serialized, written to disk, or included in an error message or stack trace?
2) Any network call to a host other than openrouter.ai. Flag every outbound destination you find.
3) Any filesystem write outside the expected temp and output directories.
4) Any new dependency added. Name each one and whether it was necessary.
5) Correctness: frame budget actually enforced, downsampling by salience not truncation, merge logic does not silently drop the audio-only path.
6) Failure handling: timeout, malformed response, missing key — all present and all non-crashing.
7) Repo conventions: strict TypeScript, no any, no console.log, existing executor and config patterns followed, no reinvented frame extractor.
8) Tests present and meaningful.

Output in English:
- Summary, 2-3 sentences
- Blocking issues, must fix before the live run
- Non-blocking improvements
- Explicit GO / NO-GO for running this against the real video

Prefer a short prioritized fix list over rewriting the feature.
```

## Copy Paste Prompt — O4 Apply Review Fixes

```text
Apply Fable's blocking findings only. Do not expand scope, do not refactor anything not named in a P0 or P1 finding.

Re-run the relevant tests. Confirm the two-pass command still works end to end.

When done, give a short English "ready for live run" checklist.
```

## Copy Paste Prompt — O5 Stretch Render

```text
Stretch only. Run this only if the scoreboard is green and there is time left.

Render the single top-ranked clip locally:
1) Cut from the source mp4 at the ranked start/end, to half-second precision.
2) 9:16 vertical, static crop. Choose the crop window from the sampled frames. Do NOT fake face tracking.
3) Subtitles: build a styled .ass with karaoke word-pop timing.
   - Word timings come from the YouTube json3 auto-captions, NOT from whisper.
   - json3 gives per-event tStartMs plus per-segment tOffsetMs; absolute word time is tStartMs + tOffsetMs.
4) Burn subtitles with ffmpeg-full (the stock homebrew ffmpeg has no libass and will fail).
5) Encode with h264_videotoolbox.

Print the exact ffmpeg command before running it so it is visible on stream.
```

## Live Test Script

### A · Fetch The Subject

```bash
yt-dlp -f "bv*[height<=1080]+ba/b[height<=1080]" \
  --write-auto-subs --sub-langs en --sub-format json3 \
  -o "composer25.%(ext)s" \
  "https://www.youtube.com/watch?v=QoQjddWCnKA"
```

### B · Pass 1, Live On Screen

- Run the fingerprint pass. Narrate that this costs zero tokens.
- Show the candidate count dropping 47 minutes to a few hundred moments.

### C · Pass 2, The Actual Test

- Run the vision pass. Show the frame count and the token estimate before it sends.
- Read the returned moments out loud with their reasons.

### D · The Scoreboard

- Column 1: audio-only ranking from the existing pipeline.
- Column 2: vision-augmented ranking.
- Column 3: the moments in the June cutdown `bc6WbJJNWPU`.
- Score per clip on one question: did it find the moment we found.
- Mitchell scores out loud first. Vincent second.

### E · Optional Cost Segment

- State the token count actually sent.
- Do the arithmetic on screen for what that costs at real pricing once the free window closes.

## On-stream Recovery

- **`subtitles` filter not found:** `ffmpeg-full` did not install or is not first on PATH. Skip the render, keep the ranking. The MVP does not depend on it.
- **Ox Alpha loops on a long tool chain:** this is its documented failure mode. Let it run for 60 seconds on camera, name it, then stop it and split the task into smaller steps. The loop is content.
- **Model returns prose instead of JSON:** show the fallback firing to audio-only ranking. That is the failure handling working.
- **OpenRouter 429 or the free window closed early:** switch to a paid vision model, keep the pipeline, and say the honest thing — the architecture was never about the model.
- **`OPENROUTER_API_KEY` not set:** export it off camera, do not open `auth.json` on stream.
- **yt-dlp fails:** the transcript already exists at `apps/app/data/transcripts/`. Use the local VTT and pull frames from a local copy.
- **Token budget blows past the window:** cut the frame budget in half and rerun. Say the number out loud both times.
- **A private path appears in a file tree:** stop, close it, move on. Do not narrate what was in it.

## Success Criteria

### Must Have

- [ ] Ox Alpha planned and built the vision pass in plain OpenCode.
- [ ] Pass 1 ran on zero model tokens.
- [ ] A single vision call returned ranked moments with timestamps and reasons.
- [ ] The audio-only path survived as a fallback.
- [ ] Fable reviewed the stealth model's code for secret handling and outbound calls.
- [ ] The three-way scoreboard was built on screen against the June hand-cut.
- [ ] No key, no private repository, and no client work appeared on camera.

### Stretch

- [ ] Top clip rendered locally, 9:16, with burned karaoke subtitles.
- [ ] Cost-after-free-window stated with real arithmetic.

## Tweets — Paste Live

> "Our clip pipeline has never watched a single second of our own show. It reads the transcript. Today we give it eyes, using a free stealth model that expires Thursday."

> "You do not need a model that watches everything. You need one that looks where ffmpeg tells it to. 47 minutes down to 300 frames, and the narrowing costs zero tokens."

> "Free is not the risk. Anonymous plus prompt retention is the risk — and it is only a risk if you point it at something private. Public repo, public VOD, no problem. My client work? Never."

> "Scoreboard: what our pipeline picks from audio, what it picks with vision, and the cut I made by hand in June. The answer key was published two months ago and cannot argue with us."
