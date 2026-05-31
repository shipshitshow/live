# Live Voice Extraction

Use this when show prep sounds too polished, generic, or "AI written." The goal is not perfect grammar. The goal is Vincent's live rhythm with enough cleanup that replay viewers still understand the take.

## Voice Source

Before writing or rewriting:

1. Read 2-4 recent clean transcripts from `apps/app/data/transcripts/clean/*livestream*.txt`.
2. Pull 10-20 raw lines that match the topic's emotional shape: cost, models, trust, bugs, shipping, agents, GitHub, code, production, or demos.
3. Extract patterns, not just quotes: sentence length, contrast words, frustration, self-correction, and how the point turns into a workflow rule.
4. Rewrite the prep from those patterns.

Use `scripts/extract-live-voice.sh` for a fast sample, then inspect the best matching transcript directly.

## Vincent Rhythm

Common live shapes:

- "Okay, so..." then the real point.
- "The thing is..." then the workflow consequence.
- "It's not magical." / "It doesn't work like that." / "That's the problem."
- "From one week to another..." when tools, model behavior, limits, or harnesses shift.
- "What are you doing?" when a platform/vendor/workflow is obviously broken.
- "You need to still..." when correcting fake autonomy claims.
- "I tried it..." or "I'm using..." before giving a take.
- "It works, but..." when the honest answer is mixed.
- "That's why..." to turn a failure into a rule.

Do not overuse these literally. Use them as rhythm.

## Rewrite Moves

### Replace Analyst Voice

Bad:

```text
The key operator implication is that model-selection should be treated as a workflow-dependent routing decision.
```

Better:

```text
Okay, so the model question is not "which logo is smarter." The question is: what loop are you running, and how much does it cost when it retries?
```

Bad:

```text
This demonstrates that autonomous software engineering requires verifiable traces.
```

Better:

```text
If the agent says "done" and you can't see the trace, you don't have autonomy. You have a very expensive guess.
```

Bad:

```text
The demo provides a useful stress test for spatial reasoning and export fidelity.
```

Better:

```text
CAD is nice because it doesn't care about vibes. If the hole is in the wrong place, the part is wrong. That's it.
```

### Keep Rough Edges That Help

Keep:

- short corrections: "No, actually..."
- blunt transitions: "So, what do you do?"
- restrained frustration: "That's kind of annoying."
- practical limits: "I don't trust it with that yet."
- personal workflow: "Right now what I'm doing is..."

Cut:

- repeated filler that blocks the take
- transcript artifacts
- long nested clauses
- fake certainty stronger than the source
- polished words Vincent would not naturally say live: "therefore", "paradigm", "demonstrates", "robustly", "leverages"

## Talking Point Shape

Use this structure inside the dashboard's required sections, but write it like notes for live speech:

```markdown
### Segment Thesis

Okay, so this segment is about [simple tension], not [lazy framing].

### Talking Points

- Start with the uncomfortable version of the take.
- Give the receipt immediately: date, number, link, bill, screenshot, demo failure.
- Say what broke or what changed in the workflow.
- Say what Vincent would do with it tomorrow.
- End with one clip line.

### Host Notes

- Ask Mitchell:
- Pull up:
- Don't pretend:
```

Avoid turning every bullet into `Claim / Receipt / Why it matters / Operator take` unless the user asks for a formal briefing. That structure is scaffolding. The visible copy should sound speakable.

## Voice Check

Before finalizing, ask:

- Would Vincent actually read this sentence live without laughing at how AI it sounds?
- Does the first line name the real issue, or does it warm up?
- Is there a personal workflow, bill, bug, or failure?
- Is the take useful to a builder tomorrow?
- Is there one sentence that can become a Short?
