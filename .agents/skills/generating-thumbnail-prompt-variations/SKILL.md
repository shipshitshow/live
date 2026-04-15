---
name: generating-thumbnail-prompt-variations
description: Use when the user wants topic-fit thumbnail prompt variations for Ship Sh!t Show style videos or shorts, especially when they want high-contrast YouTube-friendly prompts grounded in existing vault thumbnails and a pasted creative brief.
---

# Generating Thumbnail Prompt Variations

Determine the skill directory from the path of this `SKILL.md` and use that as `$SKILL_DIR` when referring to bundled references.

This skill generates multiple thumbnail prompts from a Ship Sh!t Show style vault episode, a pasted prompt brief, or both.

## Inputs

Use any combination of:

- `vault_path`
- `vault_repo_url`
- `episode_path`
- `thumbnail.png`
- `thumbnail.md`
- a pasted prompt brief
- transcript excerpts
- explicit reset instructions such as `ignore the existing thumbnail`

## Workflow

1. Resolve the episode context.
   - If an `episode_path` is provided, read `overview.md`, `description.md`, and `thumbnail.md`.
   - If `thumbnail.png` exists and your environment supports image inspection, inspect it before generating new prompts.
   - If image inspection is not available, use `thumbnail.md` plus `overview.md` as the fallback visual context.

2. Read the pasted brief carefully.
   - Treat the user's prompt language as a style signal, not just raw content.
   - Preserve concrete subject details when the user gave them deliberately.

3. Choose the style family before writing prompts.
   - Use [references/thumbnail-style-families.md](references/thumbnail-style-families.md).
   - The style can vary by topic.
   - The global constraints do not vary:
     - high contrast
     - dark background or dark edge treatment
     - one dominant center object
     - hosts readable on outer edges
     - one emotional read at 120px

4. Preserve channel DNA unless the user asks for a reset.
   - Existing vault thumbnails strongly favor:
     - expressive hosts on the left and right edges
     - large symbolic object in the center
     - hot orange-red or blue light as the main narrative device
     - uncluttered composition

5. Generate 4-6 prompt variations plus one recommended winner.
   - Each variation must follow the output format reference exactly.
   - Do not paraphrase the same prompt six times.
   - Push each variation into a different visual angle, emotion, or symbol set.

## Output Contract

Return this exact structure:

### Recommended Winner

- Name the best variant and explain why it will read best at thumbnail size.

### Prompt Variations

- 4-6 variations.
- Each variation must include:
  - `SCENE`
  - `SUBJECT LEFT`
  - `SUBJECT RIGHT`
  - `CENTER OF FRAME`
  - `BACKGROUND`
  - `LIGHTING`
  - `STYLE`
  - `NEGATIVE PROMPT`
  - `WHY IT WORKS AT 120PX`

## Guardrails

- Do not add text overlays unless the user explicitly asks for them.
- Default to dark backgrounds and high contrast.
- Avoid clutter, small props, busy multi-object scenes, or thin detail that dies at small size.
- If the topic is abstract, convert it into one concrete center object.
- If an existing thumbnail already contains a strong recurring composition trait, keep it unless the user asked for a reset.

## Reading Order

- Read [references/visual-language-from-vault.md](references/visual-language-from-vault.md) first.
- Read [references/thumbnail-style-families.md](references/thumbnail-style-families.md) to choose the family.
- Read [references/prompt-output-format.md](references/prompt-output-format.md) to format the final response.

