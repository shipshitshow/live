# Ship Shit Show — Topic File Format

last_verified: 2026-05-19

## File Location

`apps/app/data/livestream/YYYY-MM-DD/topic-NN-slug.md`

One file per topic. NN is zero-padded order (01, 02, …). Slug is kebab-case topic name.

## Frontmatter

```yaml
---
title: "Display title"
slug: "kebab-case-slug"
source: "Comma-separated attribution names"
status: "backlog" | "draft" | "in_progress" | "done"
date: "YYYY-MM-DD"
thumbnail_prompt: null | "prompt string"
---
```

## Section Structure

Sections are delimited by `## Section Title` (h2). The parser (`parseSections` in `apps/app/src/lib/markdown-render.tsx`) splits on `## ` headers and passes each section body to `MarkdownBody` for rendering.

### Sections shown in the talking points panel (`isUsefulSection`)

| Section title (case-insensitive) | Match rule |
|---|---|
| `## Cold Open - READ THIS` | starts with `cold open` |
| `## Talking Points — …` | starts with `talking points` |
| `## Sources - Pull These Up` | starts with `sources` |
| `## Summary` | exact match `summary` |
| `## Hot Take` | exact match `hot take` |
| `## Close` / `## Closing …` | starts with `close` |
| `## Tweets — …` | starts with `tweets` |

All other `## …` sections are parsed but not displayed in the panel (internal notes only).

### Sections NOT shown (internal use only)

Examples: `## Livestream Notes`, `## Episode Thesis`, `## Segment N - …`, `## Personal Takes`, `## Discussion Questions`, `## Clickbait Title Bank`, `## Host Notes`, `## The Live Build`, `## The Build Prompt`.

## Body Markdown Syntax

Within a section body, the renderer (`MarkdownBody`) handles these patterns line-by-line:

| Pattern | Syntax | Rendered as |
|---|---|---|
| Sub-heading h3 | `### Text` | Bold, `text-base`, `text-text-primary` |
| Sub-heading h4 | `#### Text` | Bold, `text-sm`, `text-text-secondary` |
| Sub-heading h5+ | `##### Text` | Medium weight, `text-sm`, `text-text-muted` |
| Blockquote | `> Text` | Red left border, `text-text-primary` |
| Bare separator | `>` (alone) | Silently dropped |
| Bullet | `- Text` or `-- Text` | Red dash prefix |
| Bold | `**text**` | `<strong>` |
| Inline code | `` `code` `` | Styled `<code>` |
| Markdown link | `[label](url)` | Red underline anchor |
| Plain URL | `https://…` | Auto-linked, red |
| Plain text | anything else | `<p>` |
| Blank line | (empty) | Silently dropped |

**`##` is NEVER used inside a section body** — it would be parsed as a new section boundary. Use `###` for sub-headings within a section body.

## Example: Sources Section

```markdown
## Sources - Pull These Up

### Primary Incident Sources

- Socket report: https://socket.dev/blog/…
- SafeDep deep dive: https://safedep.io/…

### YouTube Creator Signals

- Theo - "title": https://www.youtube.com/watch?v=…
```

## Example: Cold Open Section

```markdown
## Cold Open - READ THIS

> "First quote line."
>
> "Second quote line — separate blockquote."
```

Note: `>` alone on a line is a visual separator in source editors but is silently dropped in the rendered panel.
