# Prompt Output Format

Each variation should use this exact shape:

```text
VARIANT N - <short codename>

SCENE: ...

SUBJECT LEFT (far left): ...

SUBJECT RIGHT (far right): ...

CENTER OF FRAME (large): ...

BACKGROUND: ...

LIGHTING: ...

STYLE: ...

NEGATIVE PROMPT: ...

WHY IT WORKS AT 120PX: ...
```

## Output rules

- Keep each field concrete.
- Keep the center object oversized.
- Explain expression, gesture, and lighting, not just nouns.
- The `WHY IT WORKS AT 120PX` note should be one tight sentence.
- The recommended winner should name the best variant and why it beats the others.

## Default negative prompt language

Reuse and adapt this baseline unless the user says otherwise:

- no text
- no words
- no branding
- no watermarks
- no letters
- no numbers
- dark background only

