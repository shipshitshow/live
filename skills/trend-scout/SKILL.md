---
name: trend-scout
description: "Research trending AI/indie dev topics from YouTube, X, Reddit, and Hacker News for livestream prep"
version: 1.0.0
tags:
  - livestream
  - research
  - shipshitshow
---

# Trend Scout

Research trending topics across YouTube, X, Reddit, and Hacker News. Creates structured topic files with inline tweet sources for Ship Shit Show livestream prep.

## When to Use
- "find trending topics", "what's hot", "research for tonight's stream", "scout trends"
- Before every livestream to populate the topic backlog
- When you need fresh AI/indie dev content to talk about

## When NOT to Use
- Writing code or fixing bugs
- Generating content assets (use `stream-content` instead)
- Building the show rundown (use `show-rundown` instead)

## Configuration
- **Topic folder:** `data/livestream/YYYY-MM-DD/` (relative to dashboard root)
- **Niche:** AI, indie dev, developer tools, vibe coding, open source
- **Output:** One markdown file per topic

## Workflow

### Step 1: Search All Platforms (parallel)

Run 4+ WebSearch queries in parallel:

```
1. "AI developer tools news this week [current month] [current year]"
2. "site:x.com AI coding tools [current month] [current year]" (for tweets)
3. Fetch HN front page: https://news.ycombinator.com/front
4. "site:reddit.com LocalLLaMA artificial intelligence trending [current month] [current year]"
5. "YouTube AI coding vibe coding news [current month] [current year]"
```

### Step 2: Filter for Relevance

Filter results using these keywords (case-insensitive):
`ai, llm, gpt, claude, openai, anthropic, gemini, indie, saas, startup, solo dev, dev tool, open source, agent, mcp, cursor, vibe coding, copilot, codex, windsurf, vercel, supabase, firebase, nextjs, react, typescript`

Discard anything that doesn't match at least one keyword.

### Step 3: Find Tweets (CRITICAL)

For each identified topic, run additional searches:
```
site:x.com "[topic keyword]" [current year]
```

**Prioritize tweets over articles.** The host opens tweets live during the stream. Every talking point should have at least one tweet link. Look for:
- Original discovery/announcement tweets
- Hot takes from known dev influencers (@theo, @fireship, @mattpocockuk, @levelsio, etc.)
- Official company announcements
- Viral reaction tweets with high engagement

### Step 4: Group & Merge Related Topics

If multiple stories share a theme (e.g., 3 stories about the same company in one week), merge them into ONE topic with sub-sections. Use the pattern:
```
## Talking Points — [Sub-topic 1]
## Talking Points — [Sub-topic 2]
```

### Step 5: Create Topic Files

For each topic, create a file in `data/livestream/YYYY-MM-DD/`:

**Filename:** `topic-NN-[slug].md` (zero-padded, alphabetical by importance)

**Format:**
```markdown
---
title: "Topic Title — Punchy Subtitle"
slug: "topic-slug"
source: "HN, X, YouTube, Reddit"
status: "backlog"
date: "YYYY-MM-DD"
thumbnail_prompt: null
---

## Summary
2-3 sentence cold-open hook. No "welcome to the show." Straight into the drama. Written in first person as if the host is saying it.

## Talking Points — [Section Name]
- Main talking point here
  - [TWEET: @username — "quoted tweet text"](https://x.com/...)
  - [Source: Article title](https://url)
- Another talking point
  - [TWEET: @username — "quoted tweet text"](https://x.com/...)

## Hot Take
One paragraph. Opinionated. Provocative but not mean. The "what does this REALLY mean for indie devs" angle.
```

**Rules for inline sources:**
- Indent sources under their talking point with `  - ` (2 spaces)
- Prefix tweets with `TWEET:` for visual distinction
- Include the tweet author and a short quote
- Every talking point with a factual claim MUST have at least one source

### Step 6: Output Summary

After creating all files, output a summary:
```
## Topics Found for [date]
1. [Topic Title] — X sources (Y tweets, Z articles)
2. [Topic Title] — X sources (Y tweets, Z articles)
...
Total: N topics, M sources, K tweets
```

## Quality Checklist
- [ ] Every topic has at least 3 tweet links
- [ ] Summary is a hookable cold-open (no "welcome" language)
- [ ] Hot take is opinionated and specific to indie devs
- [ ] Related stories are merged, not separate
- [ ] Talking points have inline sources indented underneath
- [ ] Filenames are numbered by importance (01 = biggest story)
