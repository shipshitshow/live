---
name: youtube-metadata
description: Generate Ship Shit Show YouTube titles, descriptions, chapters, and youtube_tags from transcripts, VTT captions, episode notes, topic files, vault entries, or rough briefs. Use when the user wants YouTube metadata, descriptions, upload copy, title candidates, tags, or metadata informed by transcript-backed 3-word-max chapters.
---

# YouTube Metadata

Use this skill to generate upload-ready metadata in the Ship Shit Show voice. Metadata should preserve the real episode thesis, avoid generic SEO filler, and include transcript-backed chapters whenever a transcript or VTT is available.

## Quick Start

1. Load the episode context: transcript, VTT, topic file, existing description, or rough brief.
2. In this repo, run `bun scripts/generate-youtube-metadata.ts <video-id-or-query>` when a YouTube inventory entry, transcript, or topic file exists; use its orchestration packet as the working context.
3. If a vault path is provided, compare nearby entries before writing titles.
4. If VTT or timestamped transcript exists, use `$youtube-chapters` to generate chapter lines for the description.
5. Draft one recommended title, title candidates, one description, chapters, and `youtube_tags`.
6. Keep claims grounded in provided sources.

## Source Priority

Prefer sources in this order:

1. Raw VTT transcript when chapters or exact timestamps are needed.
2. Clean transcript for voice, thesis, and wording.
3. Existing episode description or topic markdown.
4. Local vault entries, when provided.
5. Public channel patterns or external research only when explicitly requested.

Do not invent dates, metrics, benchmark numbers, source claims, or timestamps.

## Required Chapter Integration

When generating a YouTube description and any transcript/VTT is available:

1. Invoke or follow `$youtube-chapters`.
2. Include a `CHAPTERS:` block in the description.
3. Enforce **3 words max per chapter title**.
4. Prefer exact timestamps from VTT.
5. If only clean transcript text is available, either omit exact chapters or label them `approx`.

Chapter block format:

```text
CHAPTERS:
0:00 Cold Open
0:42 Opus Test
2:06 First Build
```

## Output Contract

Return this exact structure:

```markdown
### Recommended Title

- One title only.

### Title Candidates

- 8-12 candidates.

### Description Draft

One full YouTube description. Include `CHAPTERS:` when transcript-backed chapters are available.

### youtube_tags

tag one, tag two, tag three

### Why This Should Work

- 3-5 bullets tied to the episode thesis, channel pattern, or source material.
```

## Description Rules

- Open with the concrete hook or operator thesis.
- Name the model, tool, company, package, repo, or game early.
- Keep the voice direct and builder-native.
- Use short paragraphs.
- Include links only when provided or already known from the episode context.
- Add a call to action only if it fits naturally.
- Never call YouTube tags `tags`; use `youtube_tags`.

## Title Rules

- Prefer conflict, proof, or operator consequence.
- Avoid vague hype: `insane`, `crazy`, `game-changing`, unless the source earns it.
- Do not stuff every AI lab into one title.
- Long-form target: 45-75 characters.
- Shorts target: 35-60 characters.

## Verification

Before finalizing:

- The description includes chapters when VTT/timestamped transcript exists.
- Every chapter title is 3 words max.
- The first chapter starts at `0:00`.
- `youtube_tags` contains 15-25 relevant phrase tags unless the user asks for fewer.
- Claims and timestamps are backed by supplied context.
