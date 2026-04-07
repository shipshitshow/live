---
name: show-rundown
description: "Convert selected livestream topics into a timed 1-hour show rundown with cold open"
version: 1.0.0
tags:
  - livestream
  - shipshitshow
---

# Show Rundown

Build a timed 1-hour show rundown from selected topics. Structures the stream as a cold open straight into content — no filler intros.

## When to Use
- "build show rundown", "prep the stream", "create rundown", "structure tonight's show"
- After topics have been moved to "In Progress" on the kanban board
- When you need a teleprompter-style guide for the live stream

## When NOT to Use
- Researching topics (use `trend-scout`)
- Generating thumbnails/tweets (use `stream-content`)

## Workflow

### Step 1: Read Selected Topics

Read all topic markdown files from `data/livestream/YYYY-MM-DD/` where `status: "in_progress"` in frontmatter. Use today's date unless specified otherwise.

### Step 2: Determine Show Structure

**Total runtime: 60 minutes**

| Segment | Duration | Purpose |
|---------|----------|---------|
| Cold Open | 2 min | Hook — straight into the biggest story. NO "welcome to Ship Shit Show." |
| Topic Segments | ~45 min total | Split evenly across selected topics |
| Hot Take | 5 min | Opinionated synthesis of all topics |
| Wrap Up & Q&A | 5-8 min | Recap, chat questions, next stream teaser |

### Step 3: Write the Cold Open

The cold open is the MOST IMPORTANT part. Rules:
- First person, spoken out loud
- Start with a question or shocking statement
- Reference the biggest story of the week
- Tease what's coming ("I'm gonna show you everything")
- Maximum 3 sentences
- NO show introduction, NO "what's up chat"

**Template:**
> "[Shocking question or statement about the week's biggest story]? Apparently yes. [One-line context]. I'm gonna show you [what they'll see] — [the tweets/the code/the drama]."

### Step 4: Structure Topic Segments

For each selected topic:

1. **Calculate time allocation** — divide 45 minutes evenly, give the biggest topic +5 extra minutes
2. **Extract talking points** — pull directly from the topic's `## Talking Points` sections
3. **Keep inline sources** — every tweet/link stays attached to its talking point
4. **Add time markers** — `0:00`, `2:00`, `17:00`, etc.

If a topic has multiple `## Talking Points — [Sub-section]` headings, each becomes a sub-segment with its own time marker.

### Step 5: Write the Hot Take Segment

Synthesize all topics into ONE hot take:
- "What does all of this mean for indie devs?"
- Connect the dots between seemingly unrelated stories
- Be provocative but not mean
- End with a question to throw to chat

### Step 6: Write Wrap Up

Standard structure:
- 2-3 sentence recap of key takeaways
- "What does this mean for indie devs this week?"
- Open floor for chat questions
- Tease next stream if known
- "Like, subscribe, share" (keep it brief, 1 sentence)

### Step 7: Output Format

The rundown is rendered by the dashboard's `[slug]/page.tsx` detail page. Each segment becomes a card with:
- Time marker badge (color-coded by type)
- Segment title
- Duration
- Bullet points with inline source links

**Segment types and colors:**
- `intro` (blue) — Cold Open
- `segment` (red) — Topic segments
- `hottake` (yellow) — Hot Take
- `conclusion` (green) — Wrap Up

## Quality Checklist
- [ ] Cold open has NO "welcome" or show introduction
- [ ] Every segment has a time marker
- [ ] Total adds up to ~60 minutes
- [ ] Inline tweet links preserved from topic files
- [ ] Hot take connects all topics, not just the last one
- [ ] Biggest story gets the most time
