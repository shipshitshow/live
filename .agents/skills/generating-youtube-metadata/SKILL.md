---
name: generating-youtube-metadata
description: Use when the user wants YouTube titles, descriptions, or youtube_tags generated from a Ship Sh!t Show style vault, or when they want topic-fit metadata guided by historical performance instead of generic SEO copy.
---

# Generating YouTube Metadata

Determine the skill directory from the path of this `SKILL.md` and use that as `$SKILL_DIR` in any commands below.

This skill generates long-form or shorts metadata from a vault that follows the `shipshitshow/vault` structure. Prefer a local vault path when it exists. Fall back to a GitHub repo URL or `owner/repo`.

## Inputs

Use any combination of:

- `vault_path`
- `vault_repo_url`
- `episode_path`
- a pasted topic brief
- transcript excerpts
- format constraints such as `long-form only` or `shorts only`

If the user gives both a local path and a remote repo, use the local path.

## Workflow

1. Resolve the vault source.
   - Local path first.
   - Remote GitHub repo second.
   - If neither is provided, default to `shipshitshow/vault`.

2. Run the bundled analysis first.

```bash
node "$SKILL_DIR/scripts/analyze-vault-performance.js" --vault /path/to/vault --channel all --format pretty
```

Remote examples:

```bash
node "$SKILL_DIR/scripts/analyze-vault-performance.js" --vault https://github.com/shipshitshow/vault --channel videos --format pretty
node "$SKILL_DIR/scripts/analyze-vault-performance.js" --vault shipshitshow/vault --channel shorts --format json
```

3. Read the nearest comparable entries from the vault.
   - Always read `overview.md`.
   - Read `description.md` when present.
   - Read `transcript.md` when present.
   - Separate comparison sets by format:
     - `shipshitshow/Videos`
     - `shipshitshowclips/Shorts`

4. Pick the target format.
   - If `episode_path` is inside `Videos`, generate long-form output.
   - If `episode_path` is inside `Shorts`, generate shorts output.
   - If only a topic brief is provided, infer format from user wording or ask only if it materially changes the result.

5. Generate metadata from winner patterns, not from blank-page SEO habits.
   - Start from the top third by `view_count`.
   - Compare against median performers.
   - Avoid weak-pattern phrasing from the bottom third.
   - Use transcript and summary language to preserve the channel voice.

## Output Contract

Return this exact structure:

### Recommended Title

- One title only.

### Title Candidates

- 8-12 candidates.
- Keep each candidate format-appropriate:
  - Long-form can be punchier, more claim-driven, more conflict-heavy.
  - Shorts should be faster, simpler, and hook-first.

### Description Draft

- One full YouTube description.
- Match the existing channel voice: direct, punchy, specific.
- Avoid generic subscribe spam and bland keyword stuffing.

### youtube_tags

- 15-25 tags.
- Always call them `youtube_tags`.
- Never rename them to Obsidian `tags`.
- Prefer phrase tags that match the vault convention.

### Why This Should Work

- 3-5 bullets.
- Tie the recommendation to real historical winners or pattern families.
- Mention any risk, such as recency bias or sparse comparables.

## Guardrails

- Never output `tags:` when the task is vault-facing. Use `youtube_tags`.
- Do not merge long-form and shorts winner sets into one ranking pool.
- Do not give generic "Top 10 AI tips" style metadata unless the vault history actually supports it.
- If performance data is sparse for the exact topic, borrow from the nearest proven topic cluster.
- If a fresh upload has low `view_count`, treat recency as a possible confounder before calling it a loser.

## Reading Order

- Read [references/vault-input-shape.md](references/vault-input-shape.md) for the vault schema.
- Read [references/title-patterns-by-channel.md](references/title-patterns-by-channel.md) for proven title families.
- Read [references/performance-ranking-rules.md](references/performance-ranking-rules.md) before making winner-versus-weak claims.

