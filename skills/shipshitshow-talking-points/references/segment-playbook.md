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

### Problem -> Build -> Artifact (default)

Use for every build episode. This is the house format; the arcs below are variants for episodes that cannot be built.

1. **The problem, in the operator's words.** Who has it, what it costs them, why the obvious fix has not worked. One receipt that it is real: a market number, a first-hand deployment, a bill.
2. **The build.** What gets made, the decision points, and the parts that fail. Failures stay in — they are the proof the demo is real.
3. **The demo.** It runs. State plainly what is rough and what running it for real would take: cost per month, who maintains it, where it breaks.
4. **The artifact.** What is published, where, and who should reach out. The close points at the link.

Segment naming under this arc still follows the claim rule below: `## Talking Points — The Phone Is A Solved Problem Now`, not `## Talking Points — The Build`.

### Broken Platform -> Replacement -> Systemic Shift

Use for GitHub, SaaS, issue trackers, dev tooling.

1. Platform is failing in public.
2. Agent/tool already performs the core job better.
3. The market/workflow is reorganizing around that replacement.

### Launch -> Field Test -> Workflow Rule

Use for new models and tools — **as a contained segment inside a build episode, not as an episode arc.** A launch cannot carry an episode; see "Model News Is Never The Spine" in SKILL.md.

1. What launched and what the vendor claims.
2. What happened when we used it on the build in this episode.
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

- "Where does this break in a real business?"
- "Would a client pay for this, and how much?"
- "What would it cost to run this every month?"
- "Who maintains it after we log off?"
- "What would you never let it do unsupervised?"
- "What does the customer notice when it goes wrong?"
- "Where does this break in a real repo?"
- "What would you never trust it with?"

Mitchell's lens is the client and agency side — point his prompts at deliverability, pricing, and maintenance, not at model internals.

## Close

The close should land the thesis and point at the artifact. Never summarize every segment.

Default close for a build episode:

```text
So the problem was [problem].
It took [honest effort/time] and it costs [honest running cost].
It's published at [artifact link] — take it.
If that's your problem too, [reach-out CTA].
```

Fallback close when an episode genuinely produced no artifact:

```text
So the story is not [lazy topic].
The story is [episode thesis].
If you run a business on this, [action or warning].
```

An episode taking the fallback close twice in a row is a format failure — flag it rather than shipping it quietly.
