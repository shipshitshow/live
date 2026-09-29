---
title: "[LIVE] How To Use Opus 5.5 & Sonnet 5.5: The Masterclass"
slug: "opus-5-5-sonnet-5-5-masterclass"
source: "Theo (t3.gg) 'So much for Pacing the Frontier' 27 Sep, Dario Amodei 'We Must Pace the Frontier' 12 Sep, Artificial Analysis X posts (Opus 5.5, Sonnet 5.5, Coding Agent Index), @claudeai and @ClaudeDevs launch posts, claude.dev blog (Getting the most out of Opus 5.5, What a task costs on Opus 5.5), Thariq @trq212 X article Spending your effort, X timeline use cases, release sweep 8-28 Sep, channel stats via yt-dlp 29 Sep"
status: "in_progress"
date: "2026-09-29"
announcement_tweet: null
thumbnail_prompt: null
---

## Sources — Livestream Notes

- Start: 14:00 CEST. Format: **masterclass**, 60–90 minutes. Off air 8 Sep → 29 Sep (three weeks).
- Stream links: **not created yet.** Add the YouTube and Restream links here when the event exists. Title above is a working title; ten options in `title-options.md`.
- **Spine, in plain words:** You are paying for the best AI models ever made and probably driving them like a chatbot. Four habits change that. We teach them, then prove them by making a video live on both models and publishing the brief.
- **Frame borrowed from Theo** (video below): the new models are not *smarter*, they are *less dumb*, so they can be trusted with longer jobs. Everything in the masterclass follows from that: longer jobs need a finish line, a task file, a cost dial and a check at the end.
- **Dates:** Opus 5.5 launched Tue 22 Sep. Sonnet 5.5 launched Mon 28 Sep (~20:00 in the X timestamps I saw), so on air it is "yesterday". Artificial Analysis had Sonnet numbers out ~30 minutes later.
- **Decision for Vincent before stream:** Capsule 5 (live build) needs a stand-in business, a renderer (browser 3D + screen record, or Blender) and a judging rule. Decide by 13:30 CEST or drop it and stretch Capsule 6.
- Fable 5.1 is not in this episode's tests. We are out of Fable credits; every Fable comparison is somebody else's number, attributed.
- Thumbnails and X posts: not written. Invoke the `thumbnails` and `x-pipeline` skills.

### What our streams did (from the channel Streams tab, read 29 Sep)

Small numbers, and older videos have had longer to collect views, so read the ranking loosely. Views are what YouTube reports on each video.

| Stream (upload date) | Views | Length | Shape |
|---|---|---|---|
| How to Use Grok 4.6, Grok Bot & Cursor Origin Together (19 Aug) | **676** | 45:40 | how-to |
| [LIVE] We Need to Talk About Anthropic (8 Apr) | 553 | 49:37 | opinion |
| [LIVE] Paperclip: We Rebuild Sora in 60 Minutes (1 Apr) | 500 | 1:25:12 | build |
| [LIVE] Claude Code Channels Killed OpenClaw (25 Mar) | 350 | 44:50 | opinion |
| **Fable 5.1 vs GPT-6 Astra: Did We Reach AGI? (9 Sep)** | **312** | 45:37 | comparison, 20 days old |
| [LIVE] ChatGPT Images 2.0 Is Insane: Best Prompts, Examples, and Use Cases (22 Apr) | 310 | 1:01:42 | how-to |
| [LIVE] GPT 5.5 vs Opus 4.7 (29 Apr) | 188 | 57:14 | comparison |
| How The SpaceX Team Ships Grok Bot (2 Sep) | 106 | 52:21 | rebuild |
| Stop Paying For AI. Use OpenRouter Stealth & Free Models. (27 Aug) | 80 | 1:02:22 | build |
| HeyPocket: Turn Calls Into Support Tickets (12 Aug) | 27 | 56:00 | business-problem build |

- **What it says:** the best of the last ten is a "how to use X" title (676). Opinion takes on Anthropic did well (553, 350). The 8 Sep comparison is fifth of ten at 20 days old and clearly ahead of the three most recent streams before it (106, 80, 27). The business-problem builds are at the bottom. So: "How To Use…" plus a strong take is the proven shape, and this masterclass fits it.
- The channel has only ten streams on the Streams tab, so this is not a big sample. Like counts are single digits. I could not read watch time or click-through, which is what would really tell you what "worked."

### The Theo video the masterclass is framed on

- **[So much for "Pacing" the Frontier — Theo (t3.gg)](https://www.youtube.com/watch?v=IBcBKgYUghU)**, 27 Sep, 27:29, ~188K views.
- It is **not** a how-to. It is a take on Dario Amodei's essay **"We Must Pace the Frontier"** (12 Sep) and the flood of releases that followed (Grok 4.7, Opus 5.5, GPT-6 Sol and Luna). Theo's argument: those releases *are* pacing, because labs are spending effort making the smaller models less dumb instead of making the biggest models more dangerous.
- The masterclass takes his practical conclusion, not his politics: reliability upgrades mean you can hand the model longer jobs.

## Cold Open — Read This

> "You are paying for the best AI models anyone has ever built, and I'd bet most of you are using them like a chatbot. Claude Opus 5.5 landed last Tuesday. Claude Sonnet 5.5 landed yesterday. And on the timeline, one guy typed a single sentence into Opus 5.5, asked for a fifteen-second showreel, and got almost two million views. Someone else built a whole 3D world out of pure code, zero downloaded assets, sound included, for about sixty dollars in usage. Meanwhile most people are typing 'think step by step' at a model that already thinks, leaving it on the most expensive setting, and wondering why the meter is empty by Wednesday. So today is a masterclass. Four habits from the people who built these models, one theory of why they work, and then we make a video live on both models, show you the clock and the bill, and publish the brief. Let's go."

## Summary

Anthropic shipped Claude Opus 5.5 (22 Sep) and Claude Sonnet 5.5 (28 Sep). On Artificial Analysis's index Opus scores 58, several points clear of everything measured, and Sonnet scores 56 at a fifth of the price of Fable 5.1 on the price list. Theo's take (27 Sep) is that these releases are less about getting smarter and more about getting less dumb: a higher floor, fewer stupid mistakes, longer jobs you can hand over. That explains why the advice in Anthropic's own guide and Thariq's effort article all points one way: state the finish line, stop saying "think hard", keep a task file, use helpers, spend effort where checking matters, and verify at the end. The catch is cost. The price lists dropped, but both models think a lot more, so the number that matters is the cost of a finished task at the effort you actually run. The timeline shows what the payoff looks like, mostly procedural video, 3D and motion work. We close with a live two-model build and a rapid catch-up of everything else since 8 Sep, including a straight answer on Gemini 4 (not out).

## Talking Points — Capsule 1, Why These Models Feel Different

### Segment Thesis

Opus 5.5 and Sonnet 5.5 are best understood as a reliability upgrade, and that changes what you should hand them.

### Talking Points

- Names once, properly. **Claude Opus 5.5**, Anthropic's top model, launched Tue 22 Sep, "the first model in our new Claude 5.5 family." **Claude Sonnet 5.5**, the cheaper one, launched Mon 28 Sep, "the second." After this: Opus and Sonnet.
- Anthropic's claim, in their own post: [Opus 5.5 performs at the level of Claude Fable 5.1, about 30% faster and about 40% cheaper per task than Opus 5](https://x.com/ClaudeDevs/status/2102438800836489554). Claude Code's five-hour limits went up 20% on launch day, plus a reset for Pro, Max and Team. [Sonnet 5.5](https://x.com/claudeai/status/2104633115620823187) is more than 30% faster and up to 30% cheaper for most work than Sonnet 5.
- The outside check. [Artificial Analysis on Opus 5.5](https://x.com/ArtificialAnlys/status/2102438210798514391): Intelligence Index **58** at max effort, the highest they have measured "by several points." Price **$4 in / $20 out** per million tokens, cache reads $0.20. On their knowledge-work test (AA-Briefcase) it beats Fable 5.1 by 143 Elo and is the first Anthropic model to beat OpenAI's Sol on presentation quality. [Artificial Analysis on Sonnet 5.5](https://x.com/ArtificialAnlys/status/2104640155843989864): **56**, second place, same price as Sonnet 5 ($2/$10), level with Opus 5.5 on knowledge-work tests (1811 vs 1822, 1844 vs 1846) and at 64% vs about 60% on their terminal-work test.
- **Now the frame.** Pull up [Theo's video](https://www.youtube.com/watch?v=IBcBKgYUghU). His hot take, in his words paraphrased: the flood of releases since Dario Amodei's "We Must Pace the Frontier" essay (12 Sep) *is* pacing. Labs are not pushing the ceiling with Opus 5.5, Sol, Luna and Grok 4.7, they are raising the floor.
- His mechanism, in plain language. A benchmark score is an average over many tasks, so it rewards a model that fails less often, not only one that peaks higher. Labs take the good solutions from their biggest models (Fable 5.1, GPT-6 Astra) and use them to train the smaller ones, which cleans up their worst moments. His line: "less dumb" and "more smart" are different things. Theo, on Astra: the smartest model he's used and one of the stupidest this year.
- Why this matters to us: **a model that fails less can be trusted with a longer job.** That is the reason every tip in the next capsules is about long jobs: a finish line, a task list in a file, helpers, a check at the end. Anthropic's guide even describes Opus 5.5 as carrying a change "through a large repository until the tests pass," and says early testers saw it run for hours with little steering.
- **Push back honestly, this is the debate.** Theo says Opus 5.5 isn't raising the ceiling. Artificial Analysis has it at 58 and Fable 5.1 at 53, which is a real gap. Both can be true, because an index rewards consistency. But be clear on air: "less dumb" is Theo's read, not Anthropic's. Attribute it.
- His numbers, which line up with ours. Theo reads Artificial Analysis and says reasoning tokens (the model's hidden thinking) roughly doubled from Opus 5 to Opus 5.5, about 42K to 84K per task, while visible output only went from about 30K to 35K. That adds to ~72K → ~119K, which matches Artificial Analysis's ~73K → ~119K that we use in Capsule 4. His spin: more visible reasoning makes the model easier to monitor. Our spin: it makes the bill bigger.
- One more Theo point worth a minute: he says labs used to ignore the smaller tiers and now Anthropic is pouring effort into making Opus and Sonnet nearly as good as Fable. He notes Haiku has not been updated in about 11 months (his figure). VentureBeat reports Haiku 5.5 "in coming weeks"; that is unconfirmed.
- **Which model for which job (our synthesis, from the sources).** Sonnet 5.5 for well-scoped everyday work: bug fixes, documents, slides, spreadsheets, and fast interactive sessions; on knowledge-work tests it is level with Opus. Opus 5.5 for the long autonomous jobs (migrations, audits, big reviews), the hard 10%, and factual recall: Artificial Analysis has 66% vs 54% on their factual-knowledge test (Sonnet hallucinates less though, 47% vs 59%). Cheaper helpers for lookups and log reading, per Anthropic's cost guide.
- Clip line: **"These models aren't smarter. They're less dumb. And that's why you can finally give them a real job."**
- Transition: so how do you give a real job? Lesson one is how you ask.

### Host Notes

- Ask Mitchell: would you rather hire the genius who's brilliant on Monday and useless on Wednesday, or the solid one who never drops the ball?
- Pull up: Artificial Analysis Opus post, Sonnet post, then 60 seconds of Theo's floor-and-ceiling drawing (around the middle of the video, where he sketches the response-quality chart).
- Don't pretend: Theo's pacing politics (that these releases prove the pacing plan works) is his argument. We are borrowing the reliability point and not endorsing the politics. Amodei's essay is real (12 Sep); Altman and Musk are reported to have said they agree.
- Shorts moment: "These models aren't smarter, they're less dumb." Thirty seconds with Theo's drawing on screen.

## Talking Points — Capsule 2, Lesson One: Brief It Like A Contractor

### Segment Thesis

A model that can carry a whole job needs a whole brief: what done looks like, what to avoid, and when to stop and ask.

### Talking Points

- The two sources for the next three capsules: Anthropic's [Getting the most out of Opus 5.5](https://claude.dev/blog/getting-the-most-out-of-opus-5-5/) on claude.dev, and Thariq's X article [Using Claude Code: Spending your effort](https://x.com/trq212/article/2103576349499855160) (25 Sep, 1.4M views; also at [claude.dev/blog/spending-your-effort](https://claude.dev/blog/spending-your-effort/)).
- **Rule 1: give the finish line.** The guide says hand over the whole task in one message with a definition of done (tests pass, every endpoint moved), and when to stop and ask. Take: same as briefing a contractor. "Fix the website" is not a brief. "Done means checkout works on mobile and the old page is gone" is.
- **Receipt: one sentence.** [Stephan Livera's post](https://x.com/stephanlivera/status/2103315922098470926) (25 Sep, 1.9M views, 16K likes): Opus 5.5 on max effort asked for a dynamic 15-second motion-graphics showreel, "go all out." Play the clip; I have not watched the video for you. Take: the brief had a length, a format and a quality bar. That is a finish line.
- **Rule 2: delete "think carefully" and "think step by step."** The guide: Opus 5.5 always thinks before it replies and decides how much; old instructions can slow it without helping. For simple questions say "answer directly." Effort, not wording, controls depth now.
- **Free cleanup, live.** Run `/claude-api prompt-audit` in Claude Code. [Lance Martin's tip](https://x.com/RLanceMartin/status/2102575471502528989) (2.8K likes): it checks your skills, agent files and CLAUDE.md and removes instructions that hobble the new models. [Dan McAteer's repost](https://x.com/daniel_mac8/status/2102799218154881486) has 501K views. Do it on our own repo on stream and show the diff.
- **Rule 3: for design, list what you don't want.** The guide: Opus 5.5 falls back to a few default looks, and "avoid a generic look" just swaps one default for another. Their example bans a cream background, italic accent words in headings, numbered "01 / 02 / 03" labels, monospace labels and pill buttons. Take: the tells of every AI-made website, from the people who made the AI. Pull up our last landing page and count them.
- **Rule 4: attach, don't retype.** In the Claude apps, give it the screenshot, chart or slide. The guide says Opus 5.5 reads them more accurately than Opus 5, including which boxes an arrow connects, and can audit a long document for contradictions (it caught a date on the wrong weekday and a chart that didn't match its deck). Ask for finished files, not outlines.
- **Rule 5: type while it works.** You can add a message mid-run ("also keep the old endpoint names") instead of restarting.
- **Gotcha: the safety switch.** Opus 5.5 is the first Opus with Fable-level cyber and biology safeguards. A flagged message quietly moves the chat to an older model and it stays there. The guide shows how to switch back (`/model` in Claude Code, the model picker in the apps). If answers suddenly feel worse, check which model you're on.
- Clip line: **"Stop telling it to think hard. It's already thinking. Tell it what done looks like."**
- Transition: a good brief gets you a good first run. The next question is what happens when the run lasts three hours.

### Host Notes

- Ask Mitchell: what's the worst brief you ever gave a freelancer, and what did they hand back?
- Pull up: the guide's "Your Opus 5.5 checklist" at the bottom, Livera's clip.
- Don't pretend: the prompt examples in "Copy Paste" are our paraphrase of the guide's shapes, not quotes.
- Shorts moment: "Delete 'think step by step' from your prompts." Thirty seconds, the guide on screen.

## Talking Points — Capsule 3, Lesson Two: Run A Long Job Without Babysitting

### Segment Thesis

Long runs need three things written down: when to stop, what's left, and who does which piece.

### Talking Points

- **Receipt: a three-and-a-half-hour run with zero fixes.** [Andrei Provkin](https://x.com/AndreiProvkin/status/2103919236653428985) (26 Sep): one prompt plus a reference image made a plan; he kicked off three plan steps by hand and never asked it to fix anything. Fully procedural three.js world, no downloaded assets, sound included. **3h36m active, 445 requests, +5,010 lines, about $60 at API pricing**, his figures. Take: this is what "hand it a whole job" looks like, and it started with a plan.
- **Stopping rules in CLAUDE.md.** The guide says Opus 5.5 sometimes stops to report instead of going on, a summary that names the next step without doing it, or an offer to continue. Fix it in your project file: keep going unless you truly can't continue without me, put status notes in the same message as the next action, ask before anything destructive (deleting data, force-pushing, touching anything outside the repo). Keep permission prompts on for destructive commands regardless.
- **A task file that survives.** Have it keep a checklist in `TASKS.md` and tick items off. The guide's reason: long runs fill the context window, older turns get summarised, a file does not. It also shows you at a glance what's done.
- **Helpers for big audits.** Tell it to give each service, folder or client to its own helper (subagent), check the evidence when each one reports back, and finish with one table: item, affected yes or no, evidence. The guide says early testers had Opus 5.5 coordinate parallel helpers on long audits and migrations with little oversight.
- **A dashboard before the run.** [Vox's thread](https://x.com/Voxyz_ai/status/2103946635831050740) (315K views): before any long task, a small helper builds a one-file HTML dashboard showing progress, what's stuck, questions waiting on you, and what it will do by default if you don't answer. It runs on medium effort while the main job runs on high. He shared the exact prompt. [Ado, who works on Claude at Anthropic,](https://x.com/adocomplete/status/2103293477912268813) shared a similar visual harness built with Opus 5.5 on medium. Take: steal this for the build.
- **Read the blockers first.** When a long run finishes, read what it needs from you before anything else. The guide says Opus 5.5 reports more clearly than Opus 5, and suggests ending every run with three headings: Blocked on me, Changed, Found.
- **The time trade.** Same idea, [Stefan 3D AI's test](https://x.com/Stefan_3D_AI/status/2102471841046786153) (22 Sep, 468K views): one prompt, Blender only, all procedural, a 10-second shot. His figures: Opus 5.5 35 minutes, 199.6K output tokens, about $13.30 in API terms; GPT-6 Astra 28 minutes, 56.6K tokens, about $14.50. His read: Opus "juggles way more at once and is faster overall." Take: it writes 3.5x the words for about the same bill. Hold that for Capsule 4.
- Clip line: **"A long job is three files: a brief, a checklist and a rule for when to stop."**
- Transition: long runs cost money. Here's how not to burn your week in a day.

### Host Notes

- Ask Mitchell: if you left a junior alone for three hours, what would you want on their desk when you got back?
- Pull up: the guide's "Steering a long run" section, Vox's dashboard prompt, a `TASKS.md` from one of our repos.
- Don't pretend: Provkin's and Stefan's figures are theirs, "in API terms." We did not reproduce either.
- Shorts moment: Vox's dashboard opening with the four panels. Thirty seconds.

## Talking Points — Capsule 4, Lesson Three: Spend Your Effort, Then Check The Bill

### Segment Thesis

Both models think more than the ones they replaced, so effort is the dial that decides your bill, and cost per finished task is the only number worth tracking.

### Talking Points

- **The trap, plain words.** A model charges for what it reads and what it writes, and its thinking counts as writing. The new models think more. Cheaper per word times more words is not automatically cheaper.
- [Artificial Analysis's cost post](https://x.com/ArtificialAnlys/status/2102541956014657615): Opus 5.5 at max costs **$5.98 per index task** against $5.86 for Opus 5. Their bridge: the extra thinking alone would have pushed it to $10.51, the 20% price cut takes it to $8.41, the cache-read cut takes it to $5.98. Take: the price cut only cancelled the extra thinking. Flat, not cheaper.
- Behind it: about **119K output tokens** per task for Opus 5.5 at max vs about 73K for Opus 5 and about **27K for GPT-6 Astra**. Same as Theo's split (reasoning doubled). Take: the quality leader is also the chattiest model in the room.
- On real coding work: [Artificial Analysis's Coding Agent Index](https://x.com/ArtificialAnlys/status/2102932119995756613): Opus 5.5 in Claude Code at max scores **66**, a new number one (Opus 5: 60, Fable 5.1: 62), but **$13.04 per task vs $10.79**, about 15.6M tokens a task. Best result, highest bill. Same trade-off as the 8 Sep episode.
- Sonnet is the sharper version: at max effort about **193K output tokens per task**, the most Artificial Analysis has measured, about 60% above Opus 5.5 and ~7x Astra, **$7.60 per task, ~50% above Sonnet 5**. Anthropic says up to 30% *less* per task. **Put the contradiction on screen.** They may be measuring different effort settings (our guess, unconfirmed) and Artificial Analysis ran a pre-release build with a bug they say they'll re-run. Their one clear verdict: **high** effort is the most competitive setting, just behind OpenAI's Sol on quality at about the same cost per task.
- **Thariq's loop, the masterclass's centre.** Effort is how much the model checks its own work and how much it decides on its own. His loop for normal software: have it interview you about the spec, **implement on low or medium**, review what it built, then **verify on high**. Rules of thumb: low for brainstorming and quick changes, medium for regular feature work, high for bugs where verification matters, max for fully autonomous hard problems.
- **His receipts.** An HTML-sanitizer task: Fable 5.1 went from 1 of 5 at low to 5 of 5 at the top level, about 2 minutes vs about 33, and the long run adversarially reviewed itself, read the parser's source and wrote a fuzzer. Opus 5.5 on a database-repair task: 0 of 5 at low, 4 of 5 at xhigh, about 1 minute vs 11. A command-line solver: 0 of 5 at low, 5 of 5 at high. A protein-data analysis: 0 of 5 at low, 4 of 5 at high, because it tried two ways of preparing the data and noticed the answer changed. **His caveat:** effort fixes missed edge cases, not wrong approaches, and on a design task low took 1 minute and max took 28, and he preferred low for exploring.
- **Anthropic's cost guide, in four moves** ([What a task costs on Opus 5.5](https://claude.dev/blog/what-a-task-costs-on-opus-5-5/), via [Vox's summary](https://x.com/Voxyz_ai/status/2103552376380457454)): start at medium, raise effort before you change models, keep cache hits at 90%+, and run lookups and log-reading on cheaper helpers. Check `/usage`. Note the quirk: a thinking token costs 100x a cache read, so an inherited "max" setting from Opus 5 is a leak.
- **Speed vs cost:** fast mode for Opus 5.5 (research preview, `/fast`) is the same model with quicker text at a higher price per token, listed at $8/$40 per million in Anthropic's docs. Use it only when you're reading each reply.
- The claim to be careful with: [@bridgebench](https://x.com/bridgebench/status/2104635523998347519) says Sonnet 5.5 beat Fable 5.1 on Artificial Analysis at one fifth of the price. Receipt: 56 vs 53, and $2/$10 vs $10/$50 on the price list. That is the sticker. We have no per-task number, so don't say "a fifth of the cost."
- Clip line: **"Low effort to build, high effort to check."**
- Clip line: **"Ask what a finished task costs. Not what a token costs."**
- Transition: enough theory. One job, two models, a clock.

### Host Notes

- Ask Mitchell: if your oven runs 60% longer but the electricity price dropped 20%, did your bill go down?
- Pull up: Artificial Analysis's $10.51 → $8.41 → $5.98 bridge, Thariq's diagram of every result and how it failed (purple = missed edge cases, blue = wrong approach), `/usage` on our machine.
- Don't pretend: the effort receipts are Thariq's own Terminal-Bench 3.0 runs. The 64% → 87% security and 34% → 75% hardware figures are from the claude.dev version of his article via the research pass; confirm on the page.
- Shorts moment: the $10.51 → $8.41 → $5.98 bridge. "The price cut only cancelled the extra thinking." Thirty seconds.

## Talking Points — Capsule 5, Lesson Four: Verify, And The Live Build

### Segment Thesis

Building on low effort and checking on high works, and we can prove it with one brief on two models and a clock.

### Talking Points

- **Lesson four, in one line: the last step is the one you don't skip.** The guide: have the model review the diff or the result before a human does. It says one early tester found Opus 5.5 at its *lowest* effort caught more bugs than Opus 5 at high, with fewer false alarms. Also: tell it to mark anything it could not confirm and say where it looked. "I couldn't find this" is worth reading.
- **Problem, in the viewer's words:** "I need a short promo video and I don't have a designer." Pick the stand-in business before stream (Vincent's call).
- **Setup, on screen:**
  - One brief with a finish line and a stop rule (Rule 1).
  - No "think hard" (Rule 2).
  - A banned-styles list (Rule 3).
  - `TASKS.md` for progress, plus Vox's one-file HTML dashboard if quick (Capsule 3).
  - Build on **medium**, verify on **high**, same for both models so the race is fair (Thariq's loop).
- **The race:** Opus 5.5 and Sonnet 5.5, same brief, started together, timer on screen, `/usage` read at the end. The shape copies Stefan 3D AI's test (Capsule 3), so credit him.
- **Demo:** play both outputs back to back. Say what's rough. Say what it would take to run this for a real client: a brief template, a review pass, brand assets.
- **Artifact + CTA:** publish the brief, the rules file and both outputs in a repo (name and link to fill in). Close on "if you have a video you keep meaning to make, reach out."
- **Failure is content.** If one model turns out garbage, keep it on screen and say what we'd change in the brief. That is the honest version of every viral clip.
- **The viral clips, play cold.** [Chain: "Opus 5.5 did this in 15 minutes"](https://x.com/achxvi/status/2103918792845963545), 860K views; [Bright Mirror: "Made with Claude Opus 5.5"](https://x.com/_brightmirror/status/2104078568137675107), 501K views. I could not see the video content from the page text, so react honestly.
- **What else people are making** (drop into chat as links): [Majid's procedural spells with sound](https://x.com/majidmanzarpour/status/2102586912993116411); [Harsh Shah: "I can design. Opus 5.5 can animate."](https://x.com/Onethirdesigner/status/2103749509616648627); [Oğuz B's UX-decision animation](https://x.com/moguzbulbul/status/2104206095313215591); [Fabiano Firmo porting Blender procedural buildings to the web](https://x.com/FabianoFirmo/status/2104577296451469697); [Sourany's koi pond in one HTML file with demo, code and tutorial](https://x.com/SouranyPhomhome/status/2104273690796179513); [Zsolt Kacso's Mac music visualizer + Blender robot head](https://x.com/kaolti/status/2103887665305391343); [0xSero on switching from local models to Claude Code](https://x.com/0xSero/status/2103747392189173760).
- **Sonnet 5.5, day one:** [Matthew Berman](https://x.com/MatthewBerman/status/2104634635234005025): "basically Opus 5.5 but 50% cheaper and much faster," demos in his replies. [Lance Martin](https://x.com/RLanceMartin/status/2104637229465538850) and [Addy Osmani](https://x.com/addyosmani/status/2104633511584084309) (both Anthropic): "code-to-painting," the model writes a brush engine, looks at its render and revises. [Future Brian](https://x.com/ForwardEditor/status/2104633533981491575): an F-Zero-style racer in Unreal, an RTS, a paint shooter, Sonnet 5.5 vs 5 on the same briefs. [Tim Jayas](https://x.com/TimJayas/status/2104640048033649115): same prompt on Sonnet 5.5 (web) vs Fable 5.1 (Claude Code), says about 5x cheaper, one test.
- Clip line: **"Same brief. Two models. Clock's running."**
- Transition: while that renders, everything you missed in three weeks.

### Host Notes

- Ask Mitchell: who judges the winner? Pick the rule before we start (fastest, cheapest, or which one you'd send to a client).
- Pull up: the brief in "Copy Paste — Live Build Prompts", `/usage`, the renderer window.
- Don't pretend: one run per model, no blind rubric, no Fable side. Say that.
- Shorts moment: both videos playing side by side with the timers. Thirty seconds.
- If there's no decision by 13:30 CEST, drop the build and extend Capsule 6 with the use-case posts above.

## Talking Points — Capsule 6, Everything Else We Missed (8 Sep → 28 Sep)

### Segment Thesis

Three weeks of releases, sorted by "does this change what you'd buy", including a straight answer on Gemini 4.

### Talking Points

Dates are 2026. Skip whatever does not land in chat.

- **Gemini 4: not out.** As of 29 Sep, Google's public Gemini API model list does not include it and Google has announced no date, price, model ID or benchmarks. What is confirmed: on 24 Sep DeepMind's Koray Kavukcuoglu said Gemini 4 has entered post-training, is already powering Google's Antigravity coding tool internally, and Google wants to release an early version "as soon as possible", "much earlier" than the end of the year. Source: [9to5Google](https://9to5google.com/2026/09/24/google-says-gemini-4-release-is-coming-as-soon-as-possible/). [InfoWorld, citing The Information](https://www.infoworld.com/article/4226642/google-plans-gemini-4-release-before-year-end-2.html) (25 Sep) says the same. October is speculation, not an announcement. Say: "Google says soon. Not today."
- **Anthropic CEO Dario Amodei's essay "We Must Pace the Frontier," 12 Sep.** He argues for deliberately slowing the rate at which frontier models gain capability so safety work can catch up, and proposes embedded third-party evaluators inside AI labs. CNN covered it; Sam Altman and Elon Musk said publicly they agreed. Sources: [Amodei's essay](https://darioamodei.com/post/we-must-pace-the-frontier), [CNN](https://www.cnn.com/2026/09/12/tech/anthropic-ceo-essay-ai). This is what Theo's video is about; give it 60 seconds.
- **OpenAI: GPT-6 Sol and GPT-6 Luna, 22 Sep.** Updated Sol (complex coding and agent work) at **$2 in / $10 out**, Luna (small, high volume) at **$0.10 / $0.50**. About 90 minutes after Opus 5.5, per TechCrunch. Artificial Analysis: Sol (max) 48 at $1.06 per task, Luna (max) 37 at $0.068. Sources: [TechCrunch](https://techcrunch.com/2026/09/22/openai-launches-gpt-6-sol-and-luna/), [Artificial Analysis frontier post](https://x.com/ArtificialAnlys/status/2102833926788288704).
- **OpenAI, smaller items.** ChatGPT Images 2.5 and GPT Image 2.5 API models (8 Sep). Agents API in public beta (10 Sep). Codex 0.156 (23 Sep) and 0.157 (25 Sep). GPT-5.5 retirement announced for 14 Oct. Sora API discontinued 24 Sep, **one secondary source plus a search snippet, not confirmed.** "OpenAI DevDay" is trending on X; check its date before mentioning.
- **xAI: Grok 4.7, 21 Sep.** $2 in / $6 out, 500K context, Artificial Analysis **46**. In Cursor. [x.ai](https://x.ai/news/grok-4-7).
- **Open-weight and China.** Xiaomi **MiMo-V2.6-Pro** (22 Sep): MIT license, index **46**, top open-weights model at launch; it also leads Artificial Analysis's new CyberGym-E2E-AA test at 79% and $0.20 a task. **DeepSeek V4.1-Flash** (10 Sep): open weights, index 39. **Alibaba Qwen**: Qwen3.8-Omni-Flash (18 Sep), Qwen-Image-2.1 (20 Sep), and on 22 Sep the Qwen lead said Qwen 4 is in training and coming "very soon". **Kimi K2.8 Preview** (11 Sep, API-only). **MiniMax M3.1-Flash-Preview** (27 Sep, only inside MiniMax's own tool).
- **Anthropic, the other news.** 10 Sep: Anthropic accused Alibaba, Moonshot and DeepSeek of large distillation campaigns (using Claude's answers to train their own models), about 200 million exchanges across five campaigns per TechCrunch. 14 Sep: Claude Code weekly limits changed, which [BleepingComputer counts as a net 17% cut](https://www.bleepingcomputer.com/news/artificial-intelligence/anthropic-is-cutting-claude-codes-current-weekly-limits-by-17-percent/); Anthropic first framed it as an increase, deleted the post, then clarified. Then +20% five-hour limits on Opus 5.5 day. 23 Sep: Claude Marketplace (2,000+ connectors, plugins, agents).
- **Coding tools.** Cursor Projects (10 Sep, a coordinator agent that plans and delegates). GitHub Copilot added Sol and Luna (22 Sep) and Sonnet 5.5 (28 Sep). Claude Code made Opus 5.5 and Sonnet 5.5 its default Opus and Sonnet.
- **Money.** Mistral raised €3B at a valuation above €21B (8 Sep).
- **Not found in the window:** a new Veo, Runway, Kling or Midjourney model, or anything from Amazon, Apple or Microsoft. Say "nothing major that I found."
- Clip line: **"Three weeks off. Two Anthropic models, two OpenAI models, a Grok, and Gemini 4 still isn't out."**
- Transition: so what do you actually do on Monday?

### Host Notes

- Ask Mitchell: which of these did you actually see on your feed?
- Pull up: [Artificial Analysis leaderboard](https://artificialanalysis.ai/leaderboards/models), one slide with logos and dates. Don't read the list.
- Don't pretend: the release sweep was done from the web on 28 Sep. Anything marked snippet-only in Verify Live is unconfirmed.
- Shorts moment: "Gemini 4 isn't out yet." Twenty seconds.
- If we're running long, skip everything except Gemini 4, Sol/Luna, Grok 4.7 and the Claude Code limit change.

## Hot Take

The launch posts say "cheaper" and the independent numbers say "flat." Anthropic cut Opus 5.5's list price by a fifth and its cache price by 60%, and Artificial Analysis found the cost per task landed within about twelve cents of the model it replaced, because the new model writes about 1.6 times as many words. Theo will tell you this is the good news: more visible thinking, fewer stupid mistakes, longer jobs you can trust. He might be right. But it's only good news if you set the dial on purpose. The people who will get burned are the ones who read "20% cheaper," left everything on max, and watched their usage meter empty on Wednesday. These models aren't smarter. They're less dumb, and you are still the one paying for the thinking.

## Closing Take

Three weeks off and the map changed. Anthropic has the number one model and the number two model, OpenAI answered ninety minutes later with cheaper ones, and Gemini 4 is coming but not here. Theo's theory is that these releases are about reliability, less dumb rather than smarter, and whether or not you buy his politics, the practical point holds: a model that drops the ball less can carry a longer job. So the masterclass was four habits. Brief it with a finish line and stop saying think hard. Give a long job a task file, helpers and a stop rule. Set the effort on purpose, and judge it by what a finished task costs. Build on low or medium, check on high. We ran a video on both models and you saw the clock and the bill. The brief, the rules file and both outputs are in the repo, link on screen. If you've got a video you keep meaning to make, or a business that needs one, reach out.

## Copy Paste — Live Build Prompts

Adapt the bracketed parts. Paraphrased from the shapes in Anthropic's guide, not copied from it.

**1. Build brief (same text to Opus 5.5 and Sonnet 5.5):**

```text
Make a 15-second promo video for [business / product], 16:9, [renderer: three.js in the browser, or Blender scripts].
Everything must be generated by code: no downloaded assets, no stock footage, no external images.
Include [motion beats: logo reveal, three benefits, call to action] and a simple sound track.
Done means: I can press play (or open the render) and see the full 15 seconds, it runs from a clean checkout with one command, and you have checked the output frame by frame for glitches.
Do not use: a cream or off-white background, italic accent words in headings, numbered 01/02/03 labels, monospace labels, pill-shaped buttons, [add show-specific bans].
Keep a checklist in TASKS.md, tick items as you go, add anything new you find.
Stop and ask me only if you cannot continue without a decision. Otherwise keep going and note the default you chose.
```

**2. CLAUDE.md stop rule (shape from the guide):**

```text
When a step doesn't need my input, keep going. Put status notes in the same message as your next action.
Stop and ask only when you can't continue without me, or before anything destructive: deleting data, force-pushing, or changing anything outside this repository.
End every run with three headings: Blocked on me, Changed, Found.
```

**3. Prompt cleanup (run first, live):**

```text
/claude-api prompt-audit
```

**4. Verify pass (run on high effort after the build):**

```text
Review the result against the brief. List only problems you'd block shipping for. For each, say where it is, why it's wrong, and how to show it fails. Mark anything you couldn't confirm and say where you looked.
```

**5. Cost review (adapted from Vox's shared prompt; needs the cost guide link):**

```text
Read https://claude.dev/blog/what-a-task-costs-on-opus-5-5/ and review my Claude Code setup against it: default effort, subagents that don't set a model, MCP servers I don't use, and a CLAUDE.md over 200 lines. Quote each problem, say what it costs, suggest the smallest change. Show recommendations first. Don't change anything yet.
```

## Verify Live Before Quoting

- **Theo's video is opinion.** "Less dumb, not smarter," the RL-cleans-up-small-models mechanism, "Astra is the smartest and stupidest", "Haiku has had no update in 11 months" and the reasoning-token split are his claims. His token split (about 42K → 84K reasoning, about 30K → 35K output) adds to ~72K → ~119K, which matches Artificial Analysis's ~73K → ~119K, but check the live Artificial Analysis page before you put a slide on it.
- **Amodei's essay.** Confirm the title and date on his site before quoting. "Altman and Musk agreed" is from news coverage of the essay; do not put words in their mouths beyond "said they agreed."
- **Whose number.** Terminal-Bench 4.0: Anthropic's own table has Opus 5.5 at 66.4% and Sonnet 5.5 at 70.6%. Artificial Analysis measured 59.6% for Opus 5.5 (63.1% inside Claude Code) and 64% for Sonnet 5.5. Different harness. Never mix them in one sentence.
- **Sonnet 5.5 cost is contested.** Anthropic: up to 30% less per task than Sonnet 5. Artificial Analysis: $7.60 per task at max effort, about 50% higher than Sonnet 5, on a pre-release build with a structured-output bug that they'll re-run. My "different effort settings" explanation is a guess.
- **Sonnet 5.5 rank.** Artificial Analysis's post says #2 behind Opus 5.5; the leaderboard page read by the research pass listed it as #3. Look at the live page.
- **"One fifth the price"** (@bridgebench) is the price list: $2/$10 vs $10/$50. We have no per-task cost for Fable 5.1 vs Sonnet 5.5.
- **Index scores.** Opus 5.5 58, Sonnet 5.5 56, Fable 5.1 53, GPT-6 Astra 53 (max), Sol 48 (max), Grok 4.7 46, MiMo-V2.6-Pro 46. Read them off the live page.
- **Default effort levels** (Opus 5.5 medium; Sonnet 5.5 high in the API and Claude Code, medium in the Claude apps) come from Anthropic's docs via the research pass. Confirm in `/effort` on stream.
- **Poster figures.** Stefan 3D AI, Andrei Provkin, Tim Jayas, Matthew Berman and Livera: every minute, token and dollar is the poster's own, "in API terms." We reproduced none.
- **Clips I did not see.** The Chain and Bright Mirror videos would not render in my browser; I only have captions and view counts. Matthew Berman's demos are in his replies; Future Brian's are in his.
- **Posts move.** View and like counts were read 28 Sep; they change fast. The stealth-testing chatter about Sonnet 5.5 ([@srikanthvaluri](https://x.com/srikanthvaluri/status/2104580745784397876), [@LuminaBench](https://x.com/LuminaBench/status/2104565586114056532)) was posted before the announcement.
- **Claude.dev guide details.** The guide text came through a summarizer and the prompts are paraphrased. The 64% → 87% security and 34% → 75% hardware figures come from the claude.dev version of Thariq's article via the research pass, not the X article. Fast-mode price ($8/$40) is from Anthropic's docs via the research pass. Confirm on the pages.
- **Cyber and bio behaviour:** Anthropic docs say most cybersecurity tasks get re-routed to an older model on Opus 5.5 while routine bug finding stays allowed. Read the docs before explaining.
- **Not confirmed:** Sora API shutdown (24 Sep), Claude Haiku 5.5 "coming weeks" (VentureBeat only), Astra usage-limit cuts (one blog, OpenAI has not confirmed), any Gemini 4 date.
- **Channel stats** are what YouTube showed on 29 Sep for the ten streams on the Streams tab. Older streams may have more views in the Videos tab.
- **Opus 5.5 launch time.** Say "Tuesday the 22nd", not a clock time.

## Sources — Theo, Dario Amodei And Channel Stats

- [Theo (t3.gg): So much for "Pacing" the Frontier](https://www.youtube.com/watch?v=IBcBKgYUghU), 27 Sep, 27:29
- [Dario Amodei: We Must Pace the Frontier](https://darioamodei.com/post/we-must-pace-the-frontier), 12 Sep; [CNN coverage](https://www.cnn.com/2026/09/12/tech/anthropic-ceo-essay-ai)
- Our streams: https://www.youtube.com/@ShipShitShow/streams

## Sources — Anthropic And Artificial Analysis

- Anthropic launch posts: [@claudeai Opus 5.5 via @ClaudeDevs](https://x.com/ClaudeDevs/status/2102438800836489554), [@claudeai Sonnet 5.5](https://x.com/claudeai/status/2104633115620823187), [price/speed](https://x.com/claudeai/status/2104633125511078314), [low/medium effort claim](https://x.com/claudeai/status/2104633128803582458)
- Anthropic pages: https://www.anthropic.com/claude-opus-5-5, https://www.anthropic.com/claude-sonnet-5-5, https://platform.claude.com/docs/en/models/opus-5-5/overview, https://platform.claude.com/docs/en/models/sonnet-5-5/overview
- Guides: [Getting the most out of Opus 5.5](https://claude.dev/blog/getting-the-most-out-of-opus-5-5/), [What a task costs on Opus 5.5](https://claude.dev/blog/what-a-task-costs-on-opus-5-5/), [Spending your effort](https://claude.dev/blog/spending-your-effort/), [Thariq's X article](https://x.com/trq212/article/2103576349499855160)
- Artificial Analysis: [Opus 5.5 launch](https://x.com/ArtificialAnlys/status/2102438210798514391), [Opus 5.5 cost per task](https://x.com/ArtificialAnlys/status/2102541956014657615), [Coding Agent Index](https://x.com/ArtificialAnlys/status/2102932119995756613), [Pareto frontier week](https://x.com/ArtificialAnlys/status/2102833926788288704), [Sonnet 5.5 launch](https://x.com/ArtificialAnlys/status/2104640155843989864), [Sonnet Terminal-Bench](https://x.com/ArtificialAnlys/status/2104640158364795297), [Cyber Index](https://x.com/ArtificialAnlys/status/2104548886442647864)
- Model pages: https://artificialanalysis.ai/models/claude-opus-5-5, https://artificialanalysis.ai/models/claude-sonnet-5-5, https://artificialanalysis.ai/leaderboards/models
- Cost thread: [Vox on the cost guide](https://x.com/Voxyz_ai/status/2103552376380457454)

## Sources — X Timeline Use Cases

- Procedural / motion: [Livera](https://x.com/stephanlivera/status/2103315922098470926), [Stefan 3D AI](https://x.com/Stefan_3D_AI/status/2102471841046786153), [Provkin](https://x.com/AndreiProvkin/status/2103919236653428985), [Majid](https://x.com/majidmanzarpour/status/2102586912993116411), [Harsh Shah](https://x.com/Onethirdesigner/status/2103749509616648627), [Oğuz B](https://x.com/moguzbulbul/status/2104206095313215591), [Fabiano Firmo](https://x.com/FabianoFirmo/status/2104577296451469697), [Chain](https://x.com/achxvi/status/2103918792845963545), [Bright Mirror](https://x.com/_brightmirror/status/2104078568137675107), [Sourany koi pond](https://x.com/SouranyPhomhome/status/2104273690796179513)
- Apps and games: [Kacso](https://x.com/kaolti/status/2103887665305391343), [Pokeidle](https://x.com/pedrofasi/status/2103631509773025717)
- Workflow: [Lance Martin prompt-audit](https://x.com/RLanceMartin/status/2102575471502528989), [Dan McAteer repost](https://x.com/daniel_mac8/status/2102799218154881486), [Vox dashboard subagent](https://x.com/Voxyz_ai/status/2103946635831050740), [Ado harness](https://x.com/adocomplete/status/2103293477912268813), [0xSero](https://x.com/0xSero/status/2103747392189173760)
- Sonnet 5.5, day one: [Matthew Berman](https://x.com/MatthewBerman/status/2104634635234005025), [Lance Martin](https://x.com/RLanceMartin/status/2104637229465538850), [Addy Osmani](https://x.com/addyosmani/status/2104633511584084309), [Future Brian](https://x.com/ForwardEditor/status/2104633533981491575), [Tim Jayas](https://x.com/TimJayas/status/2104640048033649115), [Bridgebench](https://x.com/bridgebench/status/2104635523998347519)

## Sources — Everything Else, 8–28 Sep

- Gemini 4: https://9to5google.com/2026/09/24/google-says-gemini-4-release-is-coming-as-soon-as-possible/, https://www.infoworld.com/article/4226642/google-plans-gemini-4-release-before-year-end-2.html, https://ai.google.dev/gemini-api/docs/changelog
- OpenAI: [TechCrunch on Sol and Luna](https://techcrunch.com/2026/09/22/openai-launches-gpt-6-sol-and-luna/), [9to5Mac](https://9to5mac.com/2026/09/22/openai-upgrading-chatgpt-and-codex-with-two-more-gpt-6-models/), https://developers.openai.com/api/docs/models/gpt-6-sol, https://developers.openai.com/api/docs/models/gpt-6-luna, https://developers.openai.com/api/docs/changelog
- xAI: https://x.ai/news/grok-4-7
- Open and China: https://mimo.mi.com/docs/en-US/news/latest/v2-6, https://api-docs.deepseek.com/updates/, https://www.marktechpost.com/2026/09/18/alibaba-qwen-releases-qwen3-8-omni-flash/ (snippet only), https://emergent.sh/news/moonshot-ai-launches-kimi-k2-8-preview
- Anthropic news: https://techcrunch.com/2026/09/10/anthropic-details-distillation-campaigns-from-alibaba-moonshot-ai-and-deepseek/, https://www.bleepingcomputer.com/news/artificial-intelligence/anthropic-is-cutting-claude-codes-current-weekly-limits-by-17-percent/
- Coding tools: https://code.claude.com/docs/en/changelog, https://cursor.com/changelog, https://github.blog/changelog/month/09-2026/
- Sonnet 5.5 customer numbers: https://venturebeat.com/technology/anthropic-launches-claude-sonnet-5-5-with-30-cost-reduction-per-task-due-to-faster-speeds-and-fewer-tool-calls
- Mistral: https://techcrunch.com/2026/09/08/mistral-raises-e3b-as-sovereign-ai-becomes-big-business/

## Tweets — Paste Live

> "These models aren't smarter. They're less dumb. And that's why you can finally give them a real job."

> "Stop telling it to think hard. It's already thinking. Tell it what done looks like."

> "A long job is three files: a brief, a checklist and a rule for when to stop."

> "They cut the price and the bill stayed flat. Cheaper per word, more words."

> "Ask what a finished task costs. Not what a token costs."

> "Low effort to build, high effort to check."

> "Same brief. Two models. Clock's running."

> "Gemini 4 isn't out yet. Google says soon. Not today."
