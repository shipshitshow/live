---
title: "Masterclass: Fable 5 + GPT-5.6 Sol In One Workflow"
slug: "fable-sol-masterclass"
source: "Anthropic, OpenAI, Claude Code, Codex, Matt Shumer, Axios, Forbes, Android Authority, Every, CodeRabbit, Towards Data Science, X, YouTube, Reddit, Ship Shit Show usage"
status: "in_progress"
date: "2026-07-14"
announcement_tweet: null
thumbnail_prompt: "16:9 YouTube livestream thumbnail, 1920x1080, photoreal cinematic render, ultra sharp, soft editorial lighting. PALETTE: warm parchment cream background, muted beige, ivory, soft brown shadows, natural skin tones, controlled amber/orange accent on the left emblem and warm golden accent on the right emblem, no neon, no cyberpunk, no red warning stamp. COMPOSITION: two large host portraits cropped by left and right edges, occupying roughly 35% of frame each, framing one centered parchment editorial emblem. CENTER ASSET: a two-brain routing emblem, left half an abstract amber butterfly-like premium model mark, right half a warm golden sun emblem, joined in the middle by clean interlocking routing arrows forming one pipeline, drawn like a vintage technical diagram on parchment; no official logos, no readable product UI, no tiny text. HOST LEFT: bald man, light tan olive skin, stubble, green-hazel eyes, black hoodie, confident teaching expression, one palm-up presenting hand toward the emblem. HOST RIGHT: man with dark wavy brown hair slicked back, navy blue polo, impressed nodding expression, subtle pointing gesture toward the emblem. BACKGROUND: plain warm parchment paper texture with soft vignette and studio shadow. CONTRAST RULE: hosts are large and readable at mobile size; center emblem is simple and visible. LIGHTING: soft warm studio lighting from front, gentle shadows, slight highlight around center emblem. BRANDING: top-right episode number '#23', clearly readable in muted dark brown/grey. TEXT: no title text, no model names, no UI labels, no official brand wordmarks, only '#23'. STYLE: premium natural-history tech poster, clean Ship Shit Show live-thumbnail composition."
---

## Sources — Livestream Notes

- Title: **[LIVE] Masterclass: Fable 5 + GPT-5.6 Sol In One Workflow**
- Alternate titles: "I Run Fable 5 AND GPT-5.6 Sol. Here Is The Workflow." / "The Two-Brain Stack: Fable 5 + GPT-5.6 Sol Masterclass"
- YouTube livestream: TBD
- Restream studio: TBD
- Format: masterclass, not a bake-off. The comparison videos already exist; this is the "how I actually run both, live" episode.
- Timing hook: Sol went GA in ChatGPT/Codex/API on July 9. Fable's included subscription window ends July 19, usage credits from July 20. This week is the one week both are maximally accessible. Say that out loud early.
- Stream promise: by the end, the viewer has a routing table, a setup path, a review loop, and cost math — the full two-brain stack, demonstrated on a real repo.
- Red line: this is not "OpenAI vs Anthropic." Both models are on the payroll. The show is about the org chart, not the war.
- Stream path: why both -> the setup -> the routing table -> blind parallel + cross-review -> the bill and the July 19 cliff -> one live task through the full pipeline.
- Caveat discipline: verify Fable credit pricing and the July 19 date on the official Anthropic pages live before quoting. Same for Sol GA pricing on the OpenAI page. Dates and prices have moved twice already this month.

## Cold Open — Read This

> "Everyone is making the same video right now: Fable 5 versus GPT-5.6 Sol. Same prompt, split screen, pick a winner."
>
> "That video is a coin flip with production value."
>
> "Here is the thing nobody says: I don't choose between them. I employ both."
>
> "Fable is the architect. Sol is the builder. One plans and judges. One executes and grinds."
>
> "And this is the exact week to learn this stack: Sol just went GA, and Fable leaves the subscription plans on July 19."
>
> "So tonight is not a comparison. It's a masterclass. My real workflow, my real config, one real task through the whole pipeline, live."

## Summary

GPT-5.6 Sol hit general availability on July 9 across ChatGPT, Codex, and the API. Fable 5's included access on Claude plans got extended to July 19 after backlash, with metered usage credits starting July 20. The timeline responded with a wall of versus content. This episode skips the versus and teaches the AND: a two-brain workflow where Fable 5 does the judgment-dense work (plans, architecture, review verdicts, hard debugging) and GPT-5.6 Sol does the execution-dense work (implementation threads, migrations, long autonomous runs, blind second opinions). The masterclass covers the mental model, the actual wiring (Claude Code as cockpit, Codex via the official plugin, worktrees, GitHub issues), the routing table, the cross-review loop, the guardrails, and the bill — then proves it with one live task run through the full pipeline.

## Hot Take

The lazy question is: **which model is better?**

The masterclass answer is: **wrong question — they have different jobs.**

Fable is the most expensive judgment on the market. Sol is the best value execution on the market. If you make one model do both jobs, you either overpay for typing or under-think your architecture. The stack is the skill now.

## Talking Points — Why Both: The Two-Brain Thesis

### Segment Thesis

Fable 5 and GPT-5.6 Sol are not competitors in a real workflow; they are two different roles on the same team.

### Talking Points

- Pull up [OpenAI: Previewing GPT-5.6 Sol](https://openai.com/index/previewing-gpt-5-6-sol/) and the [Axios GA coverage](https://www.axios.com/2026/07/09/ai-openai-gpt-release). Receipt: Sol is GA as of July 9 in ChatGPT, Codex, and the API. Sol $5/M input, $30/M output.
- Pull up [Anthropic: Claude Fable 5 and Claude Mythos 5](https://www.anthropic.com/news/claude-fable-5-mythos-5). Receipt: Fable is the frontier reasoning tier. Credits pricing when metered: $10/M input, $50/M output — literally 2x Sol.
- Pull up [Matt Shumer's early-access verdict](https://x.com/mattshumer_/status/2074720356510609788): "for almost every task I tested, Fable was quite a bit better, and more agentic to boot (one Fable turn does the same thing many 5.6 turns do)."
- Then the counterweight: reviewers consistently find Sol stronger at "keep pushing" execution — hand it shaped work and it grinds without babysitting. Weakness: fuzzy judgment when the problem has several defensible paths. Pull up the [CodeRabbit Sol/Terra benchmark](https://www.coderabbit.ai/blog/gpt-5-6-sol-and-terra-benchmark) for the coding-lane receipt.
- The community already landed on the frame: explorer vs executor. Claude reasons about ambiguity; Codex executes shaped work relentlessly. Pull up [Using Claude Code and Codex Together](https://codex.danielvaughan.com/2026/03/27/using-claude-code-and-codex-together/).
- My version: Fable is the CTO brain — plans, architecture calls, synthesis, review verdicts. Sol is the senior contractor — implementation, migrations, long runs, and second opinions. Neither is the junior. The junior is Sonnet and Haiku, and that's a different episode.
- Clip line: **"Fable is the most expensive judgment on the market. Sol is the best value execution. Stop making one do both jobs."**
- Transition: a thesis is worthless without wiring. Here's the actual setup.

### Host Notes

- Ask Mitchell: has he ever run two frontier models on the same project on purpose, or only as a fallback when one annoyed him?
- Pull up: OpenAI Sol page, Anthropic Fable page, Shumer post, CodeRabbit bench. One receipt per claim, keep moving.
- Do not let this become a benchmark segment. Benchmarks got 20 minutes last episode; tonight is workflow.

## Talking Points — The Setup: One Cockpit, Two Brains

### Segment Thesis

The stack only works if both models are one keystroke away from each other — Claude Code is the cockpit, Codex is wired in as a callable teammate.

### Talking Points

- Show the real config live. Claude Code is the primary terminal: main context runs the judgment model, subagents fan out for execution and retrieval.
- Codex comes in through the official [OpenAI Codex plugin for Claude Code](https://github.com/openai/codex-plugin-cc) — a skill and agent that let the Claude session hand a task to Codex/Sol and get the result back in-context. Demo the handoff: one slash command, Sol does the work, the answer lands back in the Claude session.
- Second lane: GitHub issues as the async interface. Implementation-ready issues get routed to Codex worktree threads — self-contained contract in the issue body: read the repo instructions, implement, run focused checks, commit, push, open a PR. I review the PR, I never watch it type.
- Worktrees are the safety layer: each Codex thread works on an isolated copy, so two agents never fight over the same working directory.
- Key principle: the human (or the main model) never copy-pastes between the two. If your "multi-model workflow" is two browser tabs and your clipboard, you don't have a workflow, you have a chore.
- Pull up [How Codex Changed My Claude Code Workflow](https://aimaker.substack.com/p/codex-claude-code-workflow) and [Towards Data Science: Combining Claude Code and Codex](https://towardsdatascience.com/how-to-combining-claude-code-and-codex-for-max-coding-power/) as receipts that this pattern is spreading.
- Clip line: **"Two browser tabs and a clipboard is not a multi-model workflow. It's a chore."**
- Transition: wiring is plumbing. The value is in the routing rules.

### Host Notes

- Ask Mitchell: what's the dumbest copy-paste loop he's caught himself doing between two AI tools?
- Screen share: real terminal, real config files, the plugin invocation. This is the segment people screenshot — make it legible, bump the font size.
- Don't dwell on install steps. Show the shape, link the repo, move on.

## Talking Points — The Routing Table: Which Job Goes Where

### Segment Thesis

The masterclass artifact is a routing table: every task type has a pre-decided owner, so no decision fatigue and no overpaying.

### Talking Points

- Show the actual table on screen. Fable 5: plans, architecture calls, synthesis of research, review verdicts, gnarly cross-file bugs, security-shaped reasoning, anything where a wrong answer costs more than the model bill.
- GPT-5.6 Sol: implementation threads, test writing, migrations, data analysis, long autonomous runs, and every blind second perspective.
- The cheap tier still exists: Sonnet-class for routine implementation, Haiku-class for retrieval. The two-brain stack sits on top of that, not instead of it.
- Rule 1: judgment-dense and token-light goes to Fable. Volume work never runs in Fable's context — delegate, get a summary back. Every token Fable spends watching a build log is money on fire.
- Rule 2: shaped work goes to Sol. If the task has a clear contract — inputs, outputs, done-criteria — Sol grinds it out cheaper and doesn't wander.
- Rule 3: unshaped work never goes to Sol first. The reviewers all agree on Sol's weak spot: multiple defensible paths, fuzzy tradeoffs. That's exactly where Fable earns 2x the price.
- Rule 4: defaults, not limits. If the cheaper lane's output doesn't meet the bar, escalate without a meeting. Judge the diff, not the price tag.
- Clip line: **"Route by failure cost, not by fanboy loyalty. Expensive judgment, cheap execution."**
- Transition: routing handles the normal days. The next two patterns are for the days that matter.

### Host Notes

- Ask Mitchell: which single task type would he move to Sol tomorrow, and which one would he never take away from Claude?
- The table is the thumbnail-moment of the episode. Clean slide or clean markdown on screen, five rows max.
- Be honest that the table is calibrated to subscription quotas, not API list prices. Different budget, different table.

## Talking Points — Blind Parallel + Cross-Review: The Power Patterns

### Segment Thesis

The two patterns that justify paying for both: blind parallel runs on high-stakes decisions, and cross-model review on everything that ships.

### Talking Points

- Pattern 1 — blind parallel: for a high-stakes decision (architecture choice, nasty production bug), task Fable and Sol on the same problem in parallel, and neither sees the other's answer. Then synthesize. Agreement is signal. Disagreement is information — it tells you exactly where the risk lives.
- Why blind matters: if model B sees model A's answer, you get anchoring, not a second opinion. You paid for two brains and got one brain with a hype man.
- Pattern 2 — cross-review: Claude-written diffs get a Codex review pass; Codex PRs get a Fable verdict before merge. Different training, different blind spots. The overlap of two blind-spot maps is much smaller than either alone.
- Pull up [Matt Shumer: Sol deleted almost all of my Mac's files](https://x.com/mattshumer_/status/2075657271401390161). Receipt: this is why guardrails aren't optional. Agents get worktrees, scoped permissions, and no god-mode on the machine. The model doesn't get trust; the sandbox earns it.
- Guardrail checklist: isolated worktrees, read-only defaults, focused checks instead of full local suites, CI as the broad gate, human merge on anything risky.
- Pull up the [cross-model workflow doc](https://github.com/shanraisshan/claude-code-best-practice/blob/main/development-workflows/cross-model-workflow/cross-model-workflow.md) — community version of the same idea: Claude plans, Codex reviews the plan against the codebase and inserts findings.
- Clip line: **"A second opinion that saw the first opinion is not a second opinion. Run them blind."**
- Transition: all of this costs money. Let's do the math the vendors won't do on stream.

### Host Notes

- Ask Mitchell: would he trust a model-reviewed PR with zero human read if two different vendors both passed it?
- The Shumer file-deletion post is the drama beat of the episode. Don't dunk on Sol — the point is sandboxing, not vendor shame. He said he trusts Fable more, but the lesson is trust NO agent with your home directory.
- If chat asks "why not two Claudes" — answer: same blind spots, same training, same failure modes. Diversity is the feature.

## Talking Points — The Bill And The July 19 Cliff

### Segment Thesis

The two-brain stack is only real if the bill works — and the Fable side of the bill changes in five days.

### Talking Points

- Pull up [Anthropic: Redeploying Fable 5](https://www.anthropic.com/news/redeploying-fable-5) plus [Forbes on the extension](https://www.forbes.com/sites/sandycarter/2026/07/07/claude-fable-5-extends-by-five-more-days-10-moves-to-make-now/) and [Android Authority](https://www.androidauthority.com/claude-fable-5-free-extension-3685103/). Receipt: included Fable access (up to 50% of weekly limits on Pro/Max/Team) was extended to July 19 after backlash. Usage credits from July 20: $10/M input, $50/M output. Verify the dates live on the Anthropic page — they've moved twice.
- Anthropic's own framing: the credit phase is temporary, and Fable is supposed to return to standard plans once capacity allows. No date attached. Plan for the cliff, hope for the return.
- Sol side: [GA pricing](https://www.axios.com/2026/07/09/ai-openai-gpt-release) at $5/$30 — half of Fable — and it's included in ChatGPT plan tiers through Codex. The execution lane is the cheap lane, which is exactly why volume work lives there.
- Subscription math beats API math: this whole stack runs on flat-rate plans, not API invoices. Quota is the real currency. Fable quota is precious — spend it on verdicts, not typing.
- The post-July-19 playbook: routing table survives, weights shift. Fable becomes the scalpel (credits, metered, deliberate). The everyday judgment lane falls back to the best on-plan Claude. If Fable comes back to plans, promote it back. Access is part of the architecture — we said it on July 1, it's still true.
- Clip line: **"Quota is the real currency. Spend Fable on verdicts, not on typing."**
- Transition: enough theory. Let's run the pipeline for real.

### Host Notes

- Ask Mitchell: does metered Fable kill it for him, or does $10-in-$50-out for the hardest 5% of work actually pencil out?
- Numbers discipline: every price quoted on stream gets its source pulled up. No pricing from memory.
- This segment doubles as the "why tonight matters" reprise — five days left of included Fable. Say it plainly, not as fake urgency.

## Talking Points — Live Demo: One Task, Full Pipeline

### Segment Thesis

One real task through the whole two-brain pipeline proves the masterclass better than any slide.

### Talking Points

- The task: one real, small feature or bug in a real repo. Fable-shaped enough to need a plan, Sol-shaped enough to have a clear contract once planned.
- Step 1 — Fable plans: main context, high effort. Deliverable: a phased plan with file targets and done-criteria. Read it out loud. This is what expensive judgment looks like.
- Step 2 — Sol executes: hand the plan to Codex via the plugin (or a worktree thread). We watch it work while we talk — that's the point, it doesn't need us.
- Step 3 — Fable verdicts: the diff comes back, Fable reviews it cold. Score: right files, clean diff, honest about risk, tests that mean something.
- Step 4 — the receipts: show elapsed time, quota burned on each side, and the diff. Cost per finished task, not cost per token — same scoring as every episode.
- If Sol flubs it: great, that's content. Show the recovery — Fable diagnoses, Sol retries with a tighter contract. The workflow's value IS the recovery loop.
- If it goes clean and boring: also great. Boring working software is the product. Say exactly that.
- Clip line: **"The plan is Fable's resume. The diff is Sol's. Tonight you see both."**

### Host Notes

- Ask Mitchell to play skeptical reviewer on the final diff — would he merge it?
- Pre-stage everything: repo open, plugin installed, task picked BEFORE stream. Live setup is where demos go to die.
- Timebox: if the run exceeds ~10 minutes, cut to prepared receipts from a rehearsal run. Do the rehearsal run tomorrow morning.
- Keep one fallback task in the pocket in case the first one turns out to be too big live.

## Closing Take

> "The versus videos will keep coming. They're easy to make and easy to watch."
>
> "But nobody hires 'the best employee' to do every job in the company."
>
> "Fable is the architect. Sol is the builder. The routing table is the org chart."
>
> "Blind parallel for the big calls. Cross-review for everything that ships. Sandboxes for everyone."
>
> "And after July 19, the table survives — the weights just shift."
>
> "Model loyalty is amateur hour. It was true two weeks ago. It's true tonight."

## Sources — Official Receipts

- [OpenAI: Previewing GPT-5.6 Sol](https://openai.com/index/previewing-gpt-5-6-sol/) — official Sol framing; check for GA updates on the page live.
- [Axios: OpenAI releases GPT-5.6 and ChatGPT Work tool](https://www.axios.com/2026/07/09/ai-openai-gpt-release) — GA date (July 9), rollout scope, pricing.
- [Axios: GPT-5.6 buzz builds](https://www.axios.com/2026/07/08/gpt-sol-ultra-openai-anthropic-grok) — pre-GA hype context, employee-hype caveat.
- [Anthropic: Claude Fable 5 and Claude Mythos 5](https://www.anthropic.com/news/claude-fable-5-mythos-5) — official Fable page; pull up current availability/pricing language live.
- [Anthropic: Redeploying Fable 5](https://www.anthropic.com/news/redeploying-fable-5) — access restoration, safeguards, usage-credit language.
- [Forbes: Claude Fable 5 Extends By Five More Days](https://www.forbes.com/sites/sandycarter/2026/07/07/claude-fable-5-extends-by-five-more-days-10-moves-to-make-now/) — extension to July 19 receipt.
- [Android Authority: Fable 5 promotion extended after backlash](https://www.androidauthority.com/claude-fable-5-free-extension-3685103/) — backlash framing for the extension.
- [OpenAI Codex plugin for Claude Code](https://github.com/openai/codex-plugin-cc) — the official cross-tool wiring shown in the setup segment.

## Sources — Builder Signal And Reviews

- [Matt Shumer: early-access Sol vs Fable verdict](https://x.com/mattshumer_/status/2074720356510609788) — "Fable was quite a bit better, and more agentic to boot."
- [Matt Shumer: full GPT-5.6 review thread](https://x.com/mattshumer_/status/2075267773458940306) — "best model I'd ever used... then Fable came out."
- [Matt Shumer: Sol deleted almost all of my Mac's files](https://x.com/mattshumer_/status/2075657271401390161) — the guardrails receipt; frame as sandboxing lesson, not vendor dunk.
- [Matt Shumer: prompting guide applies to both models](https://x.com/mattshumer_/status/2075294346899866085) — useful "skills transfer across models" point.
- [Interesting Engineering: Sol Ultra public July 9](https://x.com/IntEngineering/status/2074893844810764384) — GA announcement social receipt.
- [Every Vibe Check: GPT-5.6 Sol](https://every.to/vibe-check/gpt-5-6-sol) — "favorite model to collaborate with" framing; collaboration vs judgment nuance.
- [CodeRabbit: GPT-5.6 Sol and Terra benchmark](https://www.coderabbit.ai/blog/gpt-5-6-sol-and-terra-benchmark) — coding benchmark lane.
- [TechTimes: Sol review — faster coding, half Fable cost, benchmark problem](https://www.techtimes.com/articles/319808/20260707/gpt-56-sol-review-faster-coding-half-fable-5-cost-benchmark-problem.htm) — balanced review receipt.
- [NextBigFuture: Sol worse than Fable but best of old generation](https://www.nextbigfuture.com/2026/07/openai-gpt-5-6-sol-is-worse-than-fable-but-best-of-old-generation.html) — skeptic lane.

## Sources — Multi-Model Workflow Patterns

- [Using Claude Code and Codex Together: The Multi-Tool Strategy](https://codex.danielvaughan.com/2026/03/27/using-claude-code-and-codex-together/) — explorer/executor mental model.
- [The AI Maker: How Codex Changed My Claude Code Workflow](https://aimaker.substack.com/p/codex-claude-code-workflow) — practitioner workflow receipt.
- [Towards Data Science: Combining Claude Code and Codex](https://towardsdatascience.com/how-to-combining-claude-code-and-codex-for-max-coding-power/) — combined-stack walkthrough.
- [Cross-model workflow (claude-code-best-practice)](https://github.com/shanraisshan/claude-code-best-practice/blob/main/development-workflows/cross-model-workflow/cross-model-workflow.md) — Claude plans, Codex reviews the plan; community pattern.
- [Previous Ship Shit Show: Fable 5 Is Back. Sonnet 5 Is The Compromise.](../2026-07-01/topic-01-fable-5-sonnet-5-reaction.md) — routing-is-the-architecture setup.
- [Previous Ship Shit Show: Fable 5 Is Gone. What Are the Alternatives?](../2026-07-07/topic-01-open-models-escape-hatch.md) — the bench/fallback layer below tonight's two-brain tier.

## Sources — The Versus Wave (React Lane)

- [I Combined GPT 5.6 Sol + Fable 5 (INSANE Results)](https://www.youtube.com/watch?v=jEa_rEUL-vA) — closest video to tonight's angle; posted ~2 days ago. Skim live, then show what a real production version looks like.
- [I Gave GPT-5.6 Sol and Claude Fable 5 The SAME 4 Prompts (Not Close)](https://www.youtube.com/watch?v=aI58Ji_s_cg) — the versus-format example for the cold open.
- [I Made GPT 5.6 and Fable 5 Build the Same App (RAW RESULTS)](https://www.youtube.com/watch?v=1njjOIiA8Kc) — versus-format receipt #2.
- [I Tested GPT 5.6 Sol vs Fable 5. What You Need To Know.](https://www.youtube.com/watch?v=EthxaDswUFo) — versus-format receipt #3.
- [The truth about GPT-5.6 Sol after using it all day](https://www.youtube.com/watch?v=ekWJQrJmIig) — single-model daily-driver take.
- [GPT-5.6 vs Fable 5: The Ultimate Design Test](https://www.youtube.com/watch?v=DxDwKE0eiAg) — design-lane versus content.
- [Fable 5 made a Fireship Video for GPT 5.6 Sol](https://www.youtube.com/watch?v=cSsVNtGPOIg) — meme lane; fun cutaway if pacing needs it.

## Tweets — Paste Live

> Everyone is making "Fable 5 vs GPT-5.6 Sol" videos. Wrong question. Tonight: the masterclass on running BOTH in one workflow. Architect + builder. Live demo included.

> Fable is the most expensive judgment on the market. Sol is the best value execution. Stop making one model do both jobs.

> Two browser tabs and a clipboard is not a multi-model workflow. It's a chore.

> Route by failure cost, not by fanboy loyalty. Expensive judgment, cheap execution.

> A second opinion that saw the first opinion is not a second opinion. Run them blind.

> Quota is the real currency. Spend Fable on verdicts, not on typing.

> Five days left of included Fable 5. Sol just went GA. This is the exact week to learn the two-brain stack.
