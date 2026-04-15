---
name: finding-channel-fit-trends
description: Use when the user wants live trend research from Reddit, Hacker News, YouTube, and X filtered through Ship Sh!t Show channel fit, with ranked content briefs, title hooks, and thumbnail seeds instead of a raw trend dump.
---

# Finding Channel-Fit Trends

Determine the skill directory from the path of this `SKILL.md` and use that as `$SKILL_DIR` when reading bundled references.

This skill researches live trends and converts them into ranked content briefs for Ship Sh!t Show.

## Inputs

Use any combination of:

- `vault_path`
- `vault_repo_url`
- explicit topic constraints
- format constraints such as `livestream only`
- a time window such as `last 7 days`

If no vault source is provided, default to the public `shipshitshow/vault`.

## Core rule

Rank by channel fit first, momentum second.

Do not act like a generic trend bot. Use the vault to decide what matters.

## Workflow

1. Ground in the vault before browsing.
   - Read the channel-fit scoring reference.
   - Use the vault history to refresh proven themes, especially:
     - model comparisons
     - agent tooling
     - security, leaks, dangerous capability
     - product conflict framing
     - existential or industry-change framing

2. Research all four sources live.
   - Reddit
   - Hacker News
   - YouTube
   - X

3. Use direct source pages whenever possible.
   - Include links.
   - Use absolute dates when discussing recency.
   - If one source is weak or unavailable, continue and state that clearly.

4. Deduplicate before scoring.
   - If Reddit, HN, X, and YouTube are all reacting to the same event, merge them into one brief.
   - Keep the strongest links from each platform inside the same brief.

5. Score each candidate with the bundled rubric.
   - Channel-fit score first.
   - Urgency score second.
   - Momentum is supporting evidence, not the final boss.

6. Convert the ranked shortlist into content briefs.

## Output Contract

Return ranked briefs only. Each brief must include:

- `Trend`
- `Source Links`
- `Why It Is Moving`
- `Why It Fits the Channel`
- `Recommended Angle`
- `Recommended Format`
- `Title Hooks`
- `Thumbnail Idea Seed`
- `Urgency Score`
- `Channel-Fit Score`

Recommended format must choose one primary path:

- `livestream`
- `long-form video`
- `short`

Title hooks:

- 2-3 per brief
- keep them channel-native, not generic headlines

## Guardrails

- Always browse for the live trend pass.
- Do not rank by hype alone.
- Do not return raw platform dumps without synthesis.
- Do not bury source links.
- If the story is hot but off-brand, score it honestly and keep it below channel-fit opportunities.

## Reading Order

- Read [references/channel-fit-scoring.md](references/channel-fit-scoring.md) first.
- Read [references/source-search-playbook.md](references/source-search-playbook.md) before browsing.
- Read [references/brief-output-template.md](references/brief-output-template.md) before formatting the final result.

