---
name: thumbnails
description: Generate Ship Shit Show thumbnail prompts and images for livestreams, recap videos, and Shorts, and write them back to the topic file. Use when Vincent asks for a thumbnail, a live thumbnail, a recap/video thumbnail, a topic-file thumbnail_prompt, or is iterating an already-generated thumbnail ("keep everything but…", "same but Claude orange", "remove the title").
---

# Ship Shit Show Thumbnails

Owns everything thumbnail: prompt authoring, art direction, image output location, and writing
`thumbnail_prompt` back into the livestream topic file.

Talking points, segments, and show prep live in `shipshitshow-talking-points`. This skill does not
write show copy.

## Output Location — Read This First

**Generated images NEVER go inside the repo.** The repo tracks zero images and `assets/` is
gitignored, so anything written there is invisible to the app and dead weight in the working tree.

Write images to the dated thumbnail library on the Desktop:

```
~/Desktop/thumbnails/<YYMM>/<YYMMDD>/<descriptive-slug>.jpg
```

- `YYMM` is the **month of the stream date**, `YYMMDD` is the stream date. An August 4 2026 stream
  is `~/Desktop/thumbnails/2608/260804/`. Do not put a July-dated folder under `2608`.
- Save both `.jpg` (upload) and `.png` (lossless) with the same basename when both are produced.
- Name files after the **locked title slug**, not an early title candidate — a folder full of
  `ai-is-getting-cheaper-*` for a stream titled "AI Is Now Cheaper Than Hiring Engineers" costs
  time at upload.
- Intermediates (cutouts, "original pixels" layers, background plates) go in a `sources/`
  subfolder of the same dated directory.

The app never reads these files. Every thumbnail the producer dashboard displays is fetched from
YouTube by video ID via `buildYouTubeThumbnailUrl` in
[livestreams-youtube.ts](apps/app/src/lib/livestreams-youtube.ts) — `img.youtube.com/vi/<id>/maxresdefault.jpg`,
falling back to `hqdefault.jpg`, then `/icon.svg`. The local library is a working archive for
Vincent, nothing more. Once the thumbnail is uploaded to YouTube, the dashboard picks it up on its own.

## Quick Start

1. Identify the stream: `apps/app/data/livestream/YYYY-MM-DD/topic-*.md`. Read its frontmatter
   `title`, `date`, and the `## Sources — Livestream Notes` section for the episode number.
2. Pick the mode from the table below. Do not ask which mode when the wording matches.
3. Write the prompt using that mode's required shape.
4. Write the prompt into the topic file's `thumbnail_prompt` frontmatter field (Mode 1 only).
5. If generating an image, save it to the dated Desktop path above.

## Mode Selection

| Vincent says | Mode |
|---|---|
| `new thumbnail for my livestream`, `live thumbnail`, `scheduled live`, `today's live`, or asks for a topic-file `thumbnail_prompt` | **Mode 1: Livestream** |
| `video recap`, `recap`, `edited video`, `main video`, `video version`, `clip`, `cutdown`, `Short` | **Mode 2: Recap** |
| `keep everything`, `same thumbnail`, `only change`, `remove the title`, `change the color`, `redo the prompt`, `workflow app`, or is iterating a generated image | **Mode 3: Surgical Re-Prompt** |

Never mix Mode 1 and Mode 2 art direction. They are different products: Mode 1 is show branding,
Mode 2 is discovery packaging.

## Host Locks

Both hosts are real people. Preserve their identities from the injected reference photos; never
invent a face.

- Vincent: `~/Desktop/thumbnails/pfps/vincentshipsit/vincentshipsit.jpg`
- Mitchell: `~/Desktop/thumbnails/pfps/mntll_nl/mntll_nl.jpg`

Written descriptions, for prompts that cannot take an injected asset:

- **Host left (Vincent):** bald man, light tan olive skin, stubble, green-hazel eyes, black hoodie,
  curious disbelief, one palm-up presenting hand.
- **Host right (Mitchell):** dark wavy brown hair slicked back, fair skin, blue eyes, navy blue polo,
  confused wonder, subtle "wait, what?" gesture.

## Mode 1: Livestream Thumbnail

For upcoming livestream topic frontmatter. Default to the two-host editorial style unless Vincent
explicitly asks for different art direction.

Required shape:

- Open with `16:9 YouTube livestream thumbnail, 1920x1080, photoreal cinematic render, ultra sharp, soft editorial lighting.`
- Blocks in this order: `PALETTE`, `COMPOSITION`, optional `LOGO LOCK` or `CENTER ASSET`,
  `HOST LEFT`, `HOST RIGHT`, `BACKGROUND`, `CONTRAST RULE`, `LIGHTING`, `BRANDING`, `TEXT`, `STYLE`.
- Two hosts large chest-up, cropped by the left and right edges, ~35% of frame each, heads readable
  at mobile size.
- Default palette: warm parchment cream, muted beige, ivory, soft brown shadows, natural skin tones.
  Avoid one-note dark tech palettes.
- Model/logo episodes: if a logo asset is provided, use a `LOGO LOCK` block and preserve it exactly
  as a flat raster asset.
- Non-logo episodes: one centered simple editorial object/emblem in the same parchment
  natural-history style. Do not replace the hosts with UI screenshots.
- `BRANDING`: top-right episode number when known, e.g. `#24`, muted dark brown/grey.
- `TEXT`: no text except the episode number, unless Vincent explicitly asks for title text.
- `NEGATIVE`: no neon, cyberpunk, red warning stamps, generic robot faces, cluttered terminal walls,
  fake logos, tiny UI text, punctuation added to locked logos, extra symbols over a provided logo.

Bad direction:

```text
Dark charcoal UI, cyan terminal glow, red warning badges, big title text, generic AI dev-tool command center.
```

Good direction:

```text
Warm parchment editorial composition, two large host portraits framing one centered asset/emblem,
no title text except episode number, premium natural-history poster vibe.
```

Seasonal or concept variants (e.g. the #23 Mediterranean beach direction) are allowed when the
episode thesis justifies them, but they must keep the two-host framing, the centered payoff object,
the top-right episode number, and the no-text rule.

### Write it back to the topic file

Mode 1 output belongs in the topic file's frontmatter as a single-line double-quoted string:

```yaml
thumbnail_prompt: "16:9 YouTube livestream thumbnail, 1920x1080, …"
```

Escape any inner double quotes. Leave every other frontmatter field untouched. A stream that ships
with `thumbnail_prompt: null` has no reproducible art direction — backfill it even when the image
was generated elsewhere.

## Mode 2: Recap Video Thumbnail

For edited videos and main-channel recaps, after the stream has a clear result, failure, or thesis.
This is discovery packaging: it sells the strongest viewer promise from the edited video.

Required shape:

- Open with `16:9 YouTube video thumbnail, 1920x1080, high-contrast editorial tech thumbnail, ultra sharp, readable at mobile size.`
- One dominant visual receipt: the app/result, source page, benchmark table, terminal failure,
  model/tool logo, or before/after state.
- Big readable title text, usually 2–5 words, tied to the edited-video title: `CRON WRITES CODE`,
  `BAD CODE + CONFIDENCE`, `CAN IT CAD?`, `AI LOOP STACK`.
- **No episode number.**
- Hosts optional. If included, one host reaction crop as supporting emotion — not the two-host
  parchment composition.
- Palette may be high-contrast tech/editorial: dark UI, cyan, red/yellow warning, product colors.
- Must communicate the outcome or conflict cold, without livestream context.
- Do not use the calm parchment two-host live composition unless the recap is explicitly branded as
  a livestream archive.

## Mode 3: Surgical Re-Prompt

For iterating inside a workflow app: "keep everything but remove the title", "same prompt but Claude
orange", "change only the color", "don't change anything else."

This mode overrides the normal creative rules.

- Output one clean standalone prompt that does not depend on prior chat state and does not say
  `use the provided image`.
- Fully restate the architecture: hosts, center asset, diagram, logo placement, lighting, colors,
  text rules, negatives.
- Preserve every unspecified element. Add no new concepts, icons, composition, logo treatment,
  diagram structure, or style.
- If the workflow injects a logo/image asset, say to use the injected asset exactly and repeat it in
  the specified places. Never tell the model to search for, recreate, describe, or redesign a logo.
- "Remove title" means: no title, no product numbers, no captions, no labels — enumerate them.
- "Change blue to Claude orange" means: replace cyan/blue/teal with warm Claude-like orange/amber,
  and explicitly prohibit blue/cyan/teal.
- Never say "reference", "previous", "same as above", or "provided image" unless Vincent explicitly
  asked for an image-edit prompt.

Skeleton:

```text
16:9 YouTube video thumbnail, 1920x1080, photoreal creator-tech thumbnail, ultra sharp, high contrast, readable at mobile size.

STYLE
[Restate exact style.]

COLOR PALETTE
[Only requested color changes.]

COMPOSITION
[Restate exact layout.]

NO TITLE
[If requested.]

CENTER ASSET
[Restate center content and repeated injected-logo placement.]

LOGO USE
[Injected asset only; repeat in the specified places.]

HOST LEFT
[Restate host.]

HOST RIGHT
[Restate host.]

NEGATIVE
[Only constraints that protect the requested edit.]
```

## Verification

Before handing back:

- Mode matches what Vincent asked for; Mode 1 and Mode 2 direction are not blended.
- Both hosts are identity-locked to the reference photos.
- Mode 1 has the episode number and no other text. Mode 2 has title text and no episode number.
- Filenames use the **locked** title slug, not a draft title.
- Images are under `~/Desktop/thumbnails/<YYMM>/<YYMMDD>/`, with intermediates in `sources/`.
  Nothing was written inside the repo.
- Mode 1 wrote `thumbnail_prompt` back to the topic frontmatter and changed nothing else.

After changing this skill, run:

```bash
uv run --with pyyaml python /Users/decod3rs/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/thumbnails
```
