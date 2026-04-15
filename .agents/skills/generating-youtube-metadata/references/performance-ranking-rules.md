# Performance Ranking Rules

This skill uses `view_count` as the only reliable current numeric signal in the public vault.

## Default rule

For each format pool separately:

- sort by `view_count`, descending
- top third = winner set
- middle third = median set
- bottom third = weak set

## Current snapshot baselines

Long-form videos:

- count: 9
- average views: 445.9
- median views: 166

Current top long-form entries:

- `GPT 5.4 vs Claude Opus 4.6: It's Not Even Close` - 1555
- `Claude Code Channels Just Killed OpenClaw.` - 1240
- `1 Million AI Agents Built a Social Network. It Was a Disaster` - 443

Shorts:

- count: 29
- average views: 604.4
- median views: 382

Current top shorts entries:

- `OpenClaw Controls My Computer?! (AGI is Here!)` - 1778
- `GPT 5.4 vs Opus 4.6: The Verdict #shorts` - 1686
- `Jack just fired 4,000 people. AI changed everything. #shorts` - 1351
- `OpenClaw & GPT 5.4: The Ultimate Combo #shorts` - 1311

## Tag guidance

Use `youtube_tags` as phrase tags.

Prefer:

- named tools or models
- high-intent use cases
- conflict pairs
- category phrases like `ai developer tools` when they already appear in winning entries

Avoid:

- stuffing tags that do not match the summary or transcript
- inventing broad SEO phrases with no archive support

## Recency caution

Do not blindly treat low-view recent uploads as failed concepts.

When a weak example is also recent:

- note the recency risk
- rely more heavily on pattern families than on the raw number alone

## Recommendation standard

A good recommendation should:

- borrow a proven pattern family
- stay aligned with the actual topic
- avoid weak-pattern wording when a stronger nearby frame exists
- explain the choice in plain language tied to comparable entries

