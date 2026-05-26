# Segment Playbook

## Segment Anatomy

Each segment should have six parts:

1. **Claim:** One sentence that can be argued with.
2. **Receipt:** The concrete proof: launch, quote, metric, outage, demo, repo, bill, transcript moment.
3. **Interpretation:** What the receipt means beyond the obvious.
4. **Operator consequence:** What changes for builders, workflows, cost, trust, or hiring.
5. **Clip line:** A short phrase that can stand alone.
6. **Transition:** The next segment's reason to exist.

If a segment cannot produce a receipt, downgrade it to a discussion prompt.

## Episode Arc Templates

### Broken Platform -> Replacement -> Systemic Shift

Use for GitHub, SaaS, issue trackers, dev tooling.

1. Platform is failing in public.
2. Agent/tool already performs the core job better.
3. The market/workflow is reorganizing around that replacement.

### Launch -> Field Test -> Workflow Rule

Use for new models and tools.

1. What launched and what the vendor claims.
2. What happened when builders used it.
3. The new routing or harness rule.

### Panic -> Reality -> Operator Playbook

Use for AI backlash, job loss, safety, open source, security.

1. What people are upset about.
2. What is actually changing underneath.
3. What competent builders should do now.

### Demo -> Failure -> Better System

Use for live builds.

1. Start with the thing you want to build.
2. Let the failure or weirdness become content.
3. Convert the failure into a workflow lesson.

## Talking Point Quality Bar

Strong talking points are:

- short enough to read while hosting
- specific enough to prevent drift
- opinionated enough to create tension
- sourced enough to avoid fake certainty
- modular enough to become clips, tweets, and segment titles

Weak talking points:

- summarize articles
- list features
- include too many quotes
- bury the take
- make every segment the same argument

## Segment Naming

Heading format is **locked**: every segment heading must be `## Talking Points — <Segment Name>`. Anything else (e.g. `## Segment 1 — X`, `## The Bench Run`) is filtered out by the dashboard's `isUsefulSection` and will not render. See SKILL.md "Default Output Contract" for the full list of allowed `## ` prefixes.

Prefer segment names that contain a claim:

- `## Talking Points — GitHub Is Just The Input Queue`
- `## Talking Points — The Wrapper Is Dying`
- `## Talking Points — The Bill Picks The Model`
- `## Talking Points — Security Is The First Real AI Labor Market`
- `## Talking Points — Open Source Has A Spam Problem, Not An AI Problem`

Avoid names that only label a topic:

- `## Talking Points — GitHub`
- `## Talking Points — Model Benchmarks`
- `## Talking Points — AI Images`
- `## Talking Points — Open Source`

## Transitions

Transitions should explain why the next segment follows.

Good transition shapes:

```text
So the platform is broken. Now the question is: what replaces the job it used to do?
```

```text
That is the vendor story. Now let's talk about what happened when we actually used it.
```

```text
This sounds like a model debate, but the bill turns it into a workflow debate.
```

```text
The outrage is real. But the useful question is what survives after the outrage.
```

## Hook Types

### Claim-First Hook

Best when the title already has tension.

```text
[Topic] is not dying because [lazy reason].
It is dying because [specific sharper reason].
```

### Receipt-First Hook

Best when there is a number, outage, launch, benchmark, or quote.

```text
[Specific receipt].
That is not a small detail.
That is [interpretation].
```

### Confession Hook

Best when hosts have first-hand usage.

```text
We tried to [do thing].
It worked, but not for the reason the launch post says.
```

### Enemy Hook

Best when fighting a lazy take.

```text
The internet is arguing about [surface debate].
Builders are already past that.
The real question is [operator question].
```

## Host Dynamic

Build prompts that let the second host challenge, not just agree.

Useful host prompts:

- "Where does this break in a real repo?"
- "Would you pay for this every day?"
- "What did the benchmark miss?"
- "What would you route to this model?"
- "What would you never trust it with?"
- "What changed since last week?"

## Close

The close should land the thesis, not summarize every segment.

Default close:

```text
So the story is not [lazy topic].
The story is [episode thesis].
If you build software, [action or warning].
```
