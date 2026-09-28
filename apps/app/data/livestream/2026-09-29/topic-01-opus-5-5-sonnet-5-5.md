---
title: "[LIVE] Opus 5.5 + Sonnet 5.5: Everything We Missed, And How To Use Them"
slug: "opus-5-5-sonnet-5-5-catch-up"
source: "Artificial Analysis X posts (Opus 5.5, Sonnet 5.5, Coding Agent Index), @claudeai and @ClaudeDevs launch posts, claude.dev blog (Getting the most out of Opus 5.5, What a task costs on Opus 5.5), Thariq @trq212 X article Spending your effort, X timeline use cases, release sweep 8-28 Sep"
status: "in_progress"
date: "2026-09-29"
announcement_tweet: null
thumbnail_prompt: null
---

## Sources — Livestream Notes

- Start: 14:00 CEST. Format: catch-up + how-to + one live build, 60–90 minutes. We were off air 8 Sep → 29 Sep (three weeks).
- Stream links: **not created yet.** Add the YouTube and Restream links here when the event exists. Title above is a working title, not locked.
- **Spine, in plain words:** Making a 15-second product video used to mean hiring a motion designer. This week people made them from one sentence. Two new models made that possible, one shipped last Tuesday and one shipped yesterday. We cover what changed, what it costs, how to drive them, then we make a video live and publish it.
- **Decision for Vincent before stream:** the build (Capsule 5) is my suggestion so the episode is not only a model recap. Drop it and the episode is a straight catch-up. Pick the client-style brief and the renderer (browser 3D + screen record, or Blender) before we go live.
- Thumbnails and X posts: not written. Invoke the `thumbnails` and `x-pipeline` skills.
- Fable 5.1 is not in this episode's tests. We are out of Fable credits. Every Fable comparison is somebody else's number, attributed.
- Dates: Opus 5.5 launched **Tue 22 Sep**. Sonnet 5.5 launched **Mon 28 Sep, ~20:00 in the X timestamps I saw**, so on air it is "yesterday". Artificial Analysis had its Sonnet numbers out about 30 minutes later.

## Cold Open — Read This

> "Okay so. We went dark for three weeks and Anthropic shipped its two best models while we were gone. Claude Opus 5.5 last Tuesday. Claude Sonnet 5.5 yesterday. Here's why you should care if you run a business and not a GitHub account. A fifteen-second product video used to mean hiring a motion designer. This week one guy typed a single sentence into Opus 5.5, asked for a showreel, and it got almost two million views. Someone else built a whole 3D world out of pure code, zero downloaded assets, sound included, for about sixty dollars in usage. If you sell anything online, that's your video budget. So today: what changed, what it actually costs, because the price went down and the bill might not, how Anthropic says to drive these things, and then we make a video live, on stream, and publish it before we log off. Let's go."

## Summary

Anthropic shipped two models in seven days. Claude Opus 5.5 (22 Sep) took the number one spot on the Artificial Analysis Intelligence Index with a 58, several points clear of everything measured, at a 20% lower sticker price than Opus 5 and cache reads cut 60%. Claude Sonnet 5.5 (28 Sep) scored 56, second place, at $2/$10 per million tokens, and by Artificial Analysis's numbers it matches Opus 5.5 on knowledge-work tests while using the most tokens they have ever measured. That is the episode's tension: cheaper price lists, hungrier models, so cost per finished task is the only number that matters. Then the part viewers can use: the X timeline is full of Opus 5.5 procedural video, 3D and motion work, and Anthropic's own guide plus Thariq's effort article explain how to drive the new models: state the finish line, stop saying "think hard", keep a task file, use subagents, and run a loop of interview → build on low or medium effort → verify on high. We close with a live build (one brief, both models, bill on screen) and a rapid-fire pass over everything else that shipped since 8 Sep.

## Talking Points — Capsule 1, The Two Models In One Table

### Segment Thesis

Anthropic gave us a top model and a mid-priced model in one week, and the mid-priced one is close enough to the top one that the choice is now about cost, not capability.

### Talking Points

- Names once, properly. **Claude Opus 5.5**, Anthropic's top model, launched Tue 22 Sep, "the first model in our new Claude 5.5 family." **Claude Sonnet 5.5**, the cheaper one, launched Mon 28 Sep, "the second." After this: Opus and Sonnet.
- Pull up [Anthropic's Opus launch post on X](https://x.com/claudeai/status/2102438800836489554) via @ClaudeDevs. Receipt: performs at the level of Claude Fable 5.1 for most work, about 30% faster and about 40% cheaper per task than Opus 5. Claude Code five-hour session limits went up 20% on launch day, and Pro, Max and Team users got a reset. Take: this is Anthropic's own claim. The next two bullets are the outside check.
- Pull up [Artificial Analysis on Opus 5.5](https://x.com/ArtificialAnlys/status/2102438210798514391), 408K views. Receipt: Intelligence Index **58** at max effort, the highest they have measured "by several points." Leads six of ten evaluations. Price cut to **$4 in / $20 out** per million tokens from $5/$25, cache reads $0.20 from $0.50. One million tokens of context. Take: "several points" on an index where the previous best was 53 is a real gap, not noise.
- Same post, the business number: on Artificial Analysis's knowledge-work test (AA-Briefcase), Opus 5.5 scores 1822 Elo, **+143 over Fable 5.1**, and it is the first time an Anthropic model beats OpenAI's Sol on presentation quality. Take: this is the "documents, decks, spreadsheets" score. It's the one your clients care about.
- Pull up [Artificial Analysis on Sonnet 5.5](https://x.com/ArtificialAnlys/status/2104640155843989864), posted about 30 minutes after launch. Receipt: Index **56**, second place behind Opus 5.5, up 18 points on Sonnet 5. Same price as Sonnet 5: **$2 in / $10 out**. On knowledge-work tests it is basically level: 1811 vs 1822 on AA-Briefcase, 1844 vs 1846 on GDPval-AA, 71% vs 70% on AutomationBench-AA.
- Terminal work (the AI running commands on its own): Artificial Analysis has Sonnet 5.5 at 64% on Terminal-Bench 4.0 against about 60% for Opus 5.5 and for OpenAI's GPT-6 Astra. Source: [their Terminal-Bench post](https://x.com/ArtificialAnlys/status/2104640158364795297). Anthropic's own table has higher numbers (66.4% Opus, 70.6% Sonnet). Say whose number it is every time. Take: two labs, two harnesses, same ordering. Sonnet is not behind on this one.
- Where Sonnet is behind, said fairly: factual knowledge. Artificial Analysis's Omniscience test has 54% for Sonnet 5.5 against 66% for Opus 5.5, though Sonnet hallucinates less (47% vs 59%). Also about six points lower on Humanity's Last Exam and SciCode. Take: if the job is "know obscure facts", pay for Opus. If the job is "do the work", Sonnet is close.
- [@claudeai on Sonnet 5.5](https://x.com/claudeai/status/2104633115620823187), 2.7M views: more than 30% faster, up to 30% cheaper for most work. And [the benchmark claim](https://x.com/claudeai/status/2104633128803582458): at low or medium effort it beats Sonnet 5's best score for about a tenth of the cost. Take: hold that thought, because Capsule 2 is about whether the bill really goes down.
- Both default in Claude Code now: Opus 5.5 is the default Opus (Claude Code 2.1.280), Sonnet 5.5 the default Sonnet (2.1.284). Sonnet 5.5 is also already in GitHub Copilot. Haiku 5.5 is reported "coming in weeks" by VentureBeat only. Say "reported", do not confirm.
- Also new and easy to miss: Opus 5.5 is the first Opus with Fable-level cyber and biology safeguards. A flagged message quietly switches you to an older model and the chat stays there until you switch back. The claude.dev guide shows how. Take: if your answers suddenly feel dumber, check which model the chat is on.
- Fast mode for Opus 5.5 exists as a research preview: `/fast` in Claude Code, priced at $8/$40 per million tokens according to the docs the research pass read. Same model, quicker output, needs extra usage turned on.
- Clip line: **"Sonnet 5.5 is Opus 5.5's little brother, and on the business tests it's basically the same person."**
- Transition: same power, cheaper list price. So is it actually cheaper? That's the part nobody puts in the launch post.

### Host Notes

- Ask Mitchell: if the second-best model is within two points of the best and costs half as much per word, why would anybody buy the best one?
- Pull up: Artificial Analysis's Opus post, then Sonnet post, side by side. The Sonnet post is long. Scroll to the "Key takeaways" list.
- Don't pretend: the Sonnet 5.5 numbers were run on a pre-release build that Anthropic says had a bug affecting structured outputs. Artificial Analysis says they will re-run. Say "early numbers".
- Shorts moment: "Opus 5.5 scored 58. Sonnet 5.5 scored 56. One costs half as much." Twenty-five seconds, the two Artificial Analysis posts on screen.

## Talking Points — Capsule 2, The Price Went Down, Did The Bill?

### Segment Thesis

Both new models have lower or unchanged price lists and both think harder, so Anthropic's price cut is real and the bill per finished task is a separate question you have to check yourself.

### Talking Points

- Start with the trick, in plain words. A model charges by the word it reads and writes, and it writes "thinking" too. The new models think more. Cheaper per word times more words is not automatically cheaper.
- Pull up [Artificial Analysis's cost post](https://x.com/ArtificialAnlys/status/2102541956014657615). Receipt: Opus 5.5 at max costs **$5.98 per Intelligence Index task** against $5.86 for Opus 5. Their bridge: extra thinking alone would have pushed it to $10.51, the 20% base price cut takes it to $8.41, the cache-read cut takes it to $5.98. Take: Anthropic's price cuts were exactly enough to cancel the extra thinking. Flat, not cheaper.
- The token count behind that: about **119K output tokens** per task for Opus 5.5 at max, against about 73K for Opus 5, about 78K for Fable 5.1 and about **27K for GPT-6 Astra**. Source: [Artificial Analysis's launch post](https://x.com/ArtificialAnlys/status/2102438210798514391). Take: the leader on quality is also the chattiest model in the room.
- For real coding work the picture is the same. Pull up [Artificial Analysis's Coding Agent Index post](https://x.com/ArtificialAnlys/status/2102932119995756613). Receipt: Opus 5.5 in Claude Code at max effort scores **66**, new number one (Opus 5: 60, Fable 5.1: 62), but cost per task is **$13.04 against $10.79** for Opus 5, about 15.6 million tokens a task. Take: best result, highest bill. Same trade-off as the 8 Sep episode.
- Sonnet 5.5 is the sharper version of this. Artificial Analysis: at max effort it used about **193K output tokens per task**, "the highest token use we have measured," about 60% above Opus 5.5 and about 7 times GPT-6 Astra. Cost per task **$7.60, about 50% higher than Sonnet 5**.
- **Put the contradiction on screen.** Anthropic says Sonnet 5.5 costs up to 30% less per task. Artificial Analysis measured about 50% more, at max effort, on a pre-release build. Both can be true if they were measuring different effort settings, but I have not confirmed that, so say it as a guess. The one thing the Artificial Analysis post does say: the **high** effort setting is the most competitive, sitting just behind OpenAI's Sol on quality at effectively the same cost per task.
- Effort is the dial. It is the same idea Thariq explains in Capsule 4, so keep this short: low, medium, high, xhigh, max. Higher means more thinking, more checking, more money.
- The comparison people are already posting: [@bridgebench](https://x.com/bridgebench/status/2104635523998347519) says Sonnet 5.5 beat Fable 5.1 on Artificial Analysis at one fifth of the price. Receipt: 56 vs 53 on the index and $2/$10 vs $10/$50 on the price list. Take: that is the sticker price. Per finished task we have no measured number, so do not say "one fifth the cost".
- What we can defend: ask for cost per finished task, at the effort you'll actually run, on your own three jobs. [Anthropic's own cost guide](https://claude.dev/blog/what-a-task-costs-on-opus-5-5/) says the same: start at medium, raise effort before you change models, keep cache hits at 90%+, run lookups on cheaper subagents, and check `/usage`. The ClaudeDevs post announcing that guide (25 Sep) had about 560K views, per the copy quoted in [Vox's thread](https://x.com/Voxyz_ai/status/2103552376380457454).
- Clip line: **"They cut the price and the bill stayed flat. The model got hungrier. Cheaper per word, more words."**
- Clip line: **"Ask what a finished task costs. Not what a token costs."**
- Transition: enough about the bill. What are people making with it? There's a lot, and a lot of it is video.

### Host Notes

- Ask Mitchell: if your electricity price drops 20% and your new oven runs 60% longer, did your bill go down?
- Pull up: Artificial Analysis's $5.98 bridge (three-step chart), then the Sonnet post's token chart.
- Don't pretend: the "different effort settings" explanation is my inference, not something either party said. Say "possibly".
- Shorts moment: the $10.51 → $8.41 → $5.98 bridge. "The price cut only cancelled out the extra thinking." Thirty seconds.

## Talking Points — Capsule 3, What People Are Actually Making With Opus 5.5

### Segment Thesis

The biggest Opus 5.5 posts are not benchmark charts. They are finished procedural video, 3D and motion work generated from a sentence or a few prompts, and that is where non-developers should be paying attention.

### Talking Points

- Set the frame: "procedural" means made by code, not by hand. No stock footage, no downloaded 3D models, nothing drawn in an editor. The AI writes a program, the program draws every frame. Cheap to change, cheap to redo.
- **The showreel prompt: 1.9 million views.** Pull up [Stephan Livera's post](https://x.com/stephanlivera/status/2103315922098470926) (25 Sep, 16K likes). Receipt: Opus 5.5 on max effort, one sentence asking for a dynamic 15-second motion-graphics showreel like it's a résumé, "go all out." Take: this is the whole pitch of the episode in one post. Play the clip, do not describe it, I have not watched the video for you.
- **Blender only, one prompt, Opus vs Astra.** Pull up [Stefan 3D AI](https://x.com/Stefan_3D_AI/status/2102471841046786153) (22 Sep, 468K views). Receipt, his numbers: Opus 5.5 took 35 minutes, 199.6K output tokens, about $13.30 in API terms. GPT-6 Astra took 28 minutes, 56.6K output tokens, about $14.50. His read: Opus "juggles way more at once and is faster overall," Astra "still good." Take: this is the token story from Capsule 2 in real life, Opus writes 3.5x more and finishes with a comparable bill.
- **A whole world from code.** Pull up [Andrei Provkin](https://x.com/AndreiProvkin/status/2103919236653428985) (26 Sep). Receipt, his numbers: fully procedural three.js world, zero downloaded assets, sound included, one prompt plus a reference image → plan → three plan steps run by hand, zero correction rounds. **3h36m active, 445 requests, +5,010 lines, about $60 at API pricing.** Take: sixty dollars against a game-art contractor. Say the caveat out loud: this is one enthusiast's best run.
- **Spells and sound in the browser.** [Majid Manzarpour](https://x.com/majidmanzarpour/status/2102586912993116411): Opus 5.5 with three.js, procedural visual effects plus sound, demo artifact attached, techniques credited to @chirovisuals. Show it running.
- **Turning design into motion.** [Harsh Shah](https://x.com/Onethirdesigner/status/2103749509616648627) (113K views): "I can design. Opus 5.5 can animate. Motion is no longer a v2 problem." And [Oğuz B](https://x.com/moguzbulbul/status/2104206095313215591) (160K views) made an animation to explain his UX decisions in job interviews and offered the skill. Take: this is a design-agency deliverable, done by a designer who can't animate.
- **From 3D software to the web.** [Fabiano Firmo](https://x.com/FabianoFirmo/status/2104577296451469697) used Opus 5.5 to port three procedural buildings from Blender's geometry nodes to the browser. Small post, big workflow.
- **The viral clips, watch before you call them.** [Chain: "Opus 5.5 did this in 15 minutes"](https://x.com/achxvi/status/2103918792845963545), 860K views, 8.4K likes. [Bright Mirror: "Made with Claude Opus 5.5,"](https://x.com/_brightmirror/status/2104078568137675107) 501K views, 3.6K likes, posted as a "nothing went foom" meme. I could not see the video content from the page text, so play them cold and react honestly.
- **Interactive things in one file.** [Sourany Phomhome's koi pond](https://x.com/SouranyPhomhome/status/2104273690796179513): an interactive Japanese garden in a single HTML file, first one-shot already impressive, then refined. He posted the live demo, code and a [YouTube tutorial](https://youtu.be/uSCUkGlHY30). Take: the best use-case posts ship the recipe. Copy that habit.
- **Apps and games.** [Zsolt Kacso](https://x.com/kaolti/status/2103887665305391343): asks Opus 5.5 for a native Mac music visualizer, a robot head modelled in Blender, and his own 2018 track wired to it. [The Pokeidle developer](https://x.com/pedrofasi/status/2103631509773025717) says "you're bizarre" about what it made him.
- **The other big group: workflow.** [Voxyz's dashboard trick](https://x.com/Voxyz_ai/status/2103946635831050740) (315K views): before any long autonomous run, a small helper agent builds a one-file HTML dashboard showing progress, what's stuck, questions for you and what it'll do by default. He shared the exact prompt. [Ado, who works on Claude at Anthropic,](https://x.com/adocomplete/status/2103293477912268813) built a visual harness with Opus 5.5 on medium effort. Take: the dashboard is worth stealing for the build in Capsule 5.
- **Switching your whole workflow.** [0xSero](https://x.com/0xSero/status/2103747392189173760) (85K views): went from mostly local models to mostly Claude Code, says Opus 5.5 is "a bigger step change than Opus to Fable." Take: one enthusiast, not a benchmark. Attribute it.
- **Sonnet 5.5, day one (yesterday, so this is early):**
  - [Matthew Berman](https://x.com/MatthewBerman/status/2104634635234005025): "basically Opus 5.5 but 50% cheaper and much faster," 3D simulation demos in the replies.
  - [Lance Martin](https://x.com/RLanceMartin/status/2104637229465538850) and [Addy Osmani](https://x.com/addyosmani/status/2104633511584084309) (both Anthropic): "code-to-painting." The model is shown a photo, writes a brush engine, renders, looks at the result and revises. Every pixel comes from Python the model wrote. Big visible step up from Sonnet 5.
  - [Future Brian](https://x.com/ForwardEditor/status/2104633533981491575): early access, an F-Zero-style racer in Unreal (called STARLANE), plus an RTS, a paint shooter and animation, with Sonnet 5.5 vs Sonnet 5 on the same briefs.
  - [Tim Jayas](https://x.com/TimJayas/status/2104640048033649115): same prompt, Sonnet 5.5 in the web app vs Fable 5.1 in Claude Code, one-shot, says about 5x cheaper. One test, his claim.
- Clip line: **"One sentence. Fifteen seconds. Two million views. That used to be a motion designer's week."**
- Clip line: **"The best posts don't say 'wow'. They give you the prompt."**
- Transition: so how do you get results like that and not a mess? Anthropic wrote it down.

### Host Notes

- Ask Mitchell: what's the last thing you paid a freelancer for that could now be a sentence?
- Pull up: play three clips maximum, 30 seconds each: Livera, Stefan 3D, Provkin. Keep the rest as links in chat.
- Don't pretend: we did not run any of these. Costs and minutes above are the posters' own, "in API terms". Say "he says".
- Don't pretend: I haven't seen the actual video frames for Chain or Bright Mirror. Do not describe them in advance.
- Shorts moment: Livera's prompt read out, then the clip. "One sentence." Forty seconds.

## Talking Points — Capsule 4, How To Use The New Models

### Segment Thesis

Anthropic's own guidance boils down to four habits: state the finish line, stop telling it to think hard, give it a task file and helpers, and match effort to how much checking the job needs.

### Talking Points

- Two pull-ups drive this capsule. Anthropic's [Getting the most out of Opus 5.5](https://claude.dev/blog/getting-the-most-out-of-opus-5-5/) on claude.dev, and Thariq's X article [Using Claude Code: Spending your effort](https://x.com/trq212/article/2103576349499855160) (25 Sep, 1.4M views; interactive version at [claude.dev/blog/spending-your-effort](https://claude.dev/blog/spending-your-effort/)). Take: one is "how to ask", the other is "how hard to make it try."
- **Habit 1: hand over the whole job with a finish line.** The guide's example shape: state the task, say what "done" means (tests pass, every endpoint moved), say when to stop and ask. Take: this is how you brief a contractor. "Fix the website" is not a brief. "Done means the checkout works on mobile and the old page is deleted" is.
- **Habit 2: delete "think carefully" and "think step by step."** The guide says Opus 5.5 always thinks before it answers and decides how much. Old instructions can slow it down. For a simple question say "answer directly." Take: a lot of people's saved prompts are now working against them.
- Free tool for that, [Lance Martin's tip](https://x.com/RLanceMartin/status/2102575471502528989) (2.8K likes): run `/claude-api prompt-audit` in Claude Code. It checks your skills, agent files and CLAUDE.md and removes instructions that hobble the new models. [Dan McAteer's repost](https://x.com/daniel_mac8/status/2102799218154881486) has 501K views: "best 5 mins you'll spend." Take: do this live on our own repo, on screen, show the diff.
- **Habit 3: type while it works.** You can add a message mid-run ("also keep the old endpoint names as aliases") instead of restarting. Longer runs make restarts expensive.
- **Habit 4: for design, list what you don't want.** The guide says without direction Opus 5.5 falls back to a few default styles, and "avoid a generic look" mostly swaps one default for another. The fix is a named list of things to avoid. Their example bans a cream background, italic accent words in headings, numbered "01 / 02 / 03" section labels, monospace labels and pill buttons. Take: the exact tells of AI-made websites, from the people who made the AI. Pull up our own last landing page and count them.
- **Long runs in Claude Code.** Three moves from the guide. Put stopping rules in CLAUDE.md (keep going unless you truly need me, ask before anything destructive). Hand audits and migrations to subagents, one per service, and make it check their evidence before accepting it. Keep the task list in a file like TASKS.md so it survives the model compacting its memory. Take: [Voxyz's dashboard](https://x.com/Voxyz_ai/status/2103946635831050740) is the same idea with a nicer screen.
- **Checking the result.** Read what the model needs from you first. Have it review the diff before a human does; one early tester said Opus 5.5 at its lowest effort caught more bugs than Opus 5 at high, with fewer false alarms. Ask it to mark anything it could not confirm, and say where it looked.
- **In the Claude apps.** Attach the chart or screenshot instead of retyping it. Ask for finished files, not outlines. Ask it to audit a long document for contradictions: the guide says it caught a date on the wrong weekday and a chart that did not match its deck. Take: this is the non-developer half of the guide, and it's the half our audience needs.
- **Thariq's headline, in plain words.** Effort is the dial for how much the model checks its own work and how much it decides on its own. His loop for normal software: have it interview you about the spec, build on **low or medium**, review it, then verify on **high**. Rule of thumb: low for brainstorming and quick changes, medium for regular feature work, high for bug fixes where verification matters, max for fully autonomous hard problems.
- **His receipts.** Fable 5.1 on a Terminal-Bench 3.0 web-safety task: 1 of 5 at low effort, 5 of 5 at the top level; low took about 2 minutes, the high run about 33 minutes and adversarially reviewed itself, read the parser's source and wrote a random-input fuzzer. Opus 5.5 on a database-repair task: 0 of 5 at low, 4 of 5 at xhigh, about 1 minute vs about 11. A command-line solver task: 0 of 5 at low, 5 of 5 at high. A protein-data analysis: 0 of 5 at low, 4 of 5 at high, because at high it tried two ways of preparing the data and noticed the answer changed.
- **His caveat, the important one:** more effort fixes missed edge cases; it does not fix a wrong approach. And on his design test, low effort took 1 minute and max took 28, and for exploring he preferred low. Take: max is for "walk away and trust it," not for everything.
- Guide numbers on the claude.dev version of that article, read off the research pass: security tasks 64% → 87% pass rate, hardware 34% → 75%. Verify on the page before quoting.
- Clip line: **"Stop telling it to think hard. It's already thinking. Tell it what done looks like."**
- Clip line: **"Low effort to build, high effort to check."**
- Transition: enough theory. We have one job and two models. Let's put a clock on it.

### Host Notes

- Ask Mitchell: if a junior works faster when you say "it's due in an hour" and slower when you say "take your time", what does that tell you about effort?
- Pull up: the claude.dev guide, the checklist at the bottom; Thariq's diagram of every result and how it failed (purple = missed edge cases, blue = wrong approach).
- Don't pretend: these are Anthropic's claims about their own models. The Terminal-Bench 3.0 runs are Thariq's own eval runs.
- Do this live: run `/claude-api prompt-audit` on a repo of ours, show what it removes.
- Shorts moment: "Delete 'think step by step' from your prompts." Thirty seconds, the guide on screen.

## Talking Points — Capsule 5, Live Build: A 15-Second Video, Two Models, One Clock

### Segment Thesis

Give the same brief to Opus 5.5 and Sonnet 5.5 using the guide's rules, and show the video, the minutes and the bill.

### Talking Points

- **Problem, in the viewer's words:** "I need a short promo video for my product and I don't have a designer." Pick the stand-in business before stream. (Vincent's call.)
- **Build rules we will follow, on screen:**
  - One message, a finish line, a stop rule (Habit 1).
  - No "think hard" (Habit 2).
  - A list of banned styles (Habit 4). Suggested seed: no cream background, no italic accent words, no numbered section labels, no pill buttons, plus whatever the show hates.
  - Progress in a TASKS.md file, plus the one-file HTML dashboard from Voxyz if it is quick.
  - Effort: build on medium, verify on high (Thariq's loop). Same for both models so the race is fair.
- **The race:** Opus 5.5 and Sonnet 5.5, same brief, started together, timer on screen. Read `/usage` at the end of each for cost. This copies the shape of Stefan 3D AI's test (Capsule 3), so cite him as where the idea came from.
- **Demo:** play both outputs back to back. Say what's rough. Say what it would take to run this for a client: a brief template, a review pass, brand assets.
- **Artifact + CTA:** publish the brief, the CLAUDE.md rules and the two outputs in a repo (name and link to fill in). Close on "if you need this for your business, reach out."
- **Failure is content.** If one model produces garbage, keep it on screen and say what we'd change in the brief. That is the honest version of every clip in Capsule 3.
- Clip line: **"Same brief. Two models. Clock's running."**
- Transition: while that renders, everything else you missed in three weeks.

### Host Notes

- Ask Mitchell: who judges the winner? Pick a rule before we start (fastest, cheapest, or which one you'd send to a client).
- Pull up: the brief prompt in "Copy Paste — Live Build Prompts", `/usage`, the renderer window.
- Don't pretend: the two-model race is one run. Say that. No blind rubric, no Fable side.
- Shorts moment: the two videos playing side by side with the timers. Thirty seconds.
- Decide before going live: renderer, brand, judge. If no decision by 13:30 CEST, drop the capsule and extend Capsule 6.

## Talking Points — Capsule 6, Everything Else We Missed (8 Sep → 28 Sep)

### Segment Thesis

Three weeks of releases, in two minutes each, sorted by "does this change what you'd buy."

### Talking Points

Dates are 2026. One rapid pass; skip anything that does not land in chat.

- **OpenAI: GPT-6 Sol and GPT-6 Luna, 22 Sep.** Updated Sol (complex coding and agent work) at **$2 in / $10 out**, and Luna (small, high volume) at **$0.10 / $0.50**. They launched about 90 minutes after Opus 5.5, per TechCrunch. Artificial Analysis: Sol (max) 48 at $1.06 per task, Luna (max) 37 at $0.068 per task. Take: OpenAI's pitch is cheap and good enough; Anthropic's is best and hungry. Source: [TechCrunch](https://techcrunch.com/2026/09/22/openai-launches-gpt-6-sol-and-luna/), [Artificial Analysis frontier post](https://x.com/ArtificialAnlys/status/2102833926788288704) (which also lists the Xiaomi model below).
- **OpenAI, smaller items.** ChatGPT Images 2.5 and the GPT Image 2.5 API models, 8 Sep. Agents API in public beta (a managed Codex harness), 10 Sep. Codex 0.156 (fullscreen terminal view, voice) 23 Sep and 0.157 (Sol and Luna with Amazon Bedrock) 25 Sep. Sora API discontinued 24 Sep, **per one secondary source and a search snippet, not confirmed.** GPT-5.5 retirement announced for 14 Oct. Also: the "OpenAI DevDay" countdown is trending on X; check the date before mentioning.
- **xAI: Grok 4.7, 21 Sep.** $2 in / $6 out, 500K context. Artificial Analysis index **46**. Available in Cursor. Source: [x.ai](https://x.ai/news/grok-4-7). Take: cheap, mid-pack.
- **Google.** No new flagship. Gemini 3.8 Live audio and Extended Thinking (15 Sep), Gemini 3.8 text-to-speech models (22 Sep), Antigravity agent update (17 Sep). And on 24 Sep DeepMind's Koray Kavukcuoglu said **Gemini 4 is in post-training** and will ship "as soon as possible," no date. Source: [9to5Google](https://9to5google.com/2026/09/24/google-says-gemini-4-release-is-coming-as-soon-as-possible/). Take: the next big release is probably Google's.
- **Open-weight and China.**
  - **Xiaomi MiMo-V2.6-Pro, 22 Sep**: MIT license, weights on Hugging Face, Artificial Analysis **46**, the top open-weights model at launch. Same chart shows $0.13 per task. It also leads Artificial Analysis's new CyberGym-E2E-AA test at 79% and $0.20 a task.
  - **DeepSeek V4.1-Flash, 10 Sep**: open weights (MIT), image understanding, index 39.
  - **Alibaba Qwen**: Qwen3.8-Omni-Flash (18 Sep, text/image/audio/video, 1M context) and Qwen-Image-2.1 (20 Sep, open image model). At its 22 Sep conference the Qwen lead said **Qwen 4 is in training** and coming "very soon."
  - **Moonshot Kimi K2.8 Preview (11 Sep)**, API-only preview, no price or benchmarks. **MiniMax M3.1-Flash-Preview (27 Sep)**, only inside MiniMax's own coding tool.
  - Take: the open model gap keeps closing. The best open model now scores 46, level with Grok 4.7.
- **Anthropic, the other news.**
  - 10 Sep: Anthropic published a report accusing **Alibaba, Moonshot and DeepSeek** of large distillation campaigns (using Claude's answers to train their own models). Reported by TechCrunch: about 200 million exchanges across five campaigns.
  - 14 Sep: Claude Code weekly limits changed. A temporary boost ended, a permanent +25% took effect, which BleepingComputer counts as a **net 17% cut** for existing users. Anthropic first framed it as an increase, deleted the post, then clarified. Take: relevant to anyone on a subscription; pair it with the +20% five-hour limit bump on Opus 5.5 launch day.
  - 17 Sep: Life Sciences Verification Program. 23 Sep: Claude Marketplace (2,000+ connectors, plugins, agents). 25 Sep: plugin submission portal.
- **Coding tools.** Cursor Projects (10 Sep, a coordinator agent that plans and delegates). GitHub Copilot added Sol and Luna (22 Sep) and Sonnet 5.5 (28 Sep). Claude Code shipped several point-releases; the two that matter are the Opus 5.5 and Sonnet 5.5 defaults.
- **Money and industry.** Mistral raised €3B at a valuation above €21B (8 Sep). Minor for our audience.
- **Not found in the window:** a new Veo, Runway, Kling or Midjourney model, or anything from Amazon, Apple or Microsoft. Say "nothing major that I found," not "nothing happened."
- Clip line: **"Three weeks off. Two Anthropic models, two OpenAI models, one Grok, and Google says Gemini 4 is coming."**
- Transition: so what do we actually do with this?

### Host Notes

- Ask Mitchell: which of these did you actually see on your feed?
- Pull up: [Artificial Analysis leaderboard](https://artificialanalysis.ai/leaderboards/models), then one slide with logos and dates. Do not read the list.
- Don't pretend: the release sweep was done from the web on 28 Sep. Anything marked "search snippet only" in Verify Live is unconfirmed.
- Shorts moment: "Gemini 4 is coming." Twenty seconds.
- If we are running long, skip everything except Sol/Luna, Grok 4.7, Gemini 4 and the Claude Code limit change.

## Hot Take

The launch posts say "cheaper" and the independent numbers say "flat." Anthropic cut Opus 5.5's list price by a fifth and its cache price by 60%, and Artificial Analysis found the cost per task landed within about twelve cents of the model it replaced, because the new model writes about 1.6 times as many words. On Sonnet 5.5 they measured the opposite of the launch claim, though on different settings and a pre-release build. So the honest version: the new models are better, Anthropic is passing some of that back as price, and it is spending some of it on making the model think harder on your dime. That is fine, if you know which dial you set. The people who will get burned are the ones who read "20% cheaper," left everything on max, and saw their usage meter empty on Wednesday.

## Closing Take

Three weeks off and the map changed. Anthropic has the number one model and the number two model, and OpenAI answered ninety minutes later with cheaper ones. The timeline gave us the reason to care: fifteen-second showreels, fully procedural 3D worlds and one-file interactive gardens, from people with a sentence and a subscription. What I can defend: Opus 5.5 is the top model on Artificial Analysis's index, Sonnet 5.5 is close on the business tests, both use a lot more thinking than the model before, and the only cost number that matters is what a finished task costs you at the effort you actually run. Anthropic's advice is short. Say what done looks like. Stop telling it to think hard. Keep a task list in a file. Low effort to build, high effort to check. We ran a video on both models and you saw the clock and the bill. The brief, the rules file and both outputs are in the repo, link on screen. If you have a video you keep meaning to make, or a business that needs one, reach out.

## Copy Paste — Live Build Prompts

Adapt the bracketed parts. Paraphrased from the shapes in Anthropic's guide, not copied from it.

**1. Opus 5.5 / Sonnet 5.5 build brief (same text to both):**

```text
Make a 15-second promo video for [business / product], 16:9, [renderer: three.js in the browser, or Blender scripts].
Everything must be generated by code: no downloaded assets, no stock footage, no external images.
Include [motion beats: logo reveal, three product benefits, call to action] and a simple sound track.
Done means: I can press play (or open the render) and see the full 15 seconds, the script runs from a clean checkout with one command, and you have checked the output frame by frame for glitches.
Do not use: a cream or off-white background, italic accent words in headings, numbered 01/02/03 labels, monospace labels, pill-shaped buttons, [add show-specific bans].
Keep a checklist in TASKS.md, tick items as you go, add anything new you find.
Stop and ask me only if you cannot continue without a decision. Otherwise keep going and note the default you chose.
```

**2. CLAUDE.md stop rule (from the guide's shape):**

```text
When a step doesn't need my input, keep going. Put status notes in the same message as your next action.
Stop and ask only when you can't continue without me, or before anything destructive: deleting data, force-pushing, or changing anything outside this repository.
End every run with three headings: Blocked on me, Changed, Found.
```

**3. Prompt cleanup (run first, live):**

```text
/claude-api prompt-audit
```

**4. Cost review (from Vox's shared prompt, needs the cost guide link):**

```text
Read https://claude.dev/blog/what-a-task-costs-on-opus-5-5/ and review my Claude Code setup against it: default effort, subagents that don't set a model, MCP servers I don't use, and a CLAUDE.md over 200 lines. Quote each problem, say what it costs, suggest the smallest change. Show recommendations first. Don't change anything yet.
```

## Verify Live Before Quoting

- **Whose number.** Terminal-Bench 4.0: Anthropic's own table has Opus 5.5 at 66.4% and Sonnet 5.5 at 70.6%. Artificial Analysis measured 59.6% for Opus 5.5 (63.1% inside Claude Code) and 64% for Sonnet 5.5. Different harness. Never mix them in one sentence.
- **Sonnet 5.5 cost is contested.** Anthropic: up to 30% less per task than Sonnet 5. Artificial Analysis: $7.60 per task at max effort, about 50% higher than Sonnet 5, on a pre-release build with a structured-output bug that they will re-run. My "different effort settings" explanation is a guess.
- **Sonnet 5.5 rank.** Artificial Analysis's Sonnet post says #2 behind Opus 5.5; the leaderboard page read by the research pass listed it as #3. Look at the live page.
- **"One fifth the price"** (@bridgebench) is the price list: $2/$10 vs $10/$50. We have no per-task cost for Fable 5.1 vs Sonnet 5.5. Do not say it costs a fifth.
- **Index scores.** Opus 5.5 58, Sonnet 5.5 56, Fable 5.1 53, GPT-6 Astra 53 (max). Grok 4.7 46, MiMo-V2.6-Pro 46, GPT-6 Sol 48 (max). Read them off the live page.
- **Stefan 3D AI, Andrei Provkin, Tim Jayas, Matthew Berman, Livera:** every minute, token and dollar figure is the poster's own, "in API terms." We reproduced none.
- **Clips I did not see.** The Chain and Bright Mirror videos would not render in my browser; I only have the captions and view counts. Watch them before describing them. Matthew Berman's demos are in his thread replies. The Sonnet 5.5 F-Zero, RTS and paint-shooter demos are in Future Brian's replies.
- **Posts move.** View and like counts were read 28 Sep; they change fast. Sonnet 5.5's launch is a few hours old and the stealth testing chatter (@srikanthvaluri, @LuminaBench) was posted before the announcement.
- **Claude.dev guide details.** The guide text came through a summarizer. The prompts are paraphrased in this doc. The security 64% → 87% and hardware 34% → 75% figures come from the claude.dev version of Thariq's article via the release sweep, not from the X article, which has different details. Confirm on the page.
- **Fast mode price ($8/$40)** comes from Anthropic's docs as relayed by the research pass. Confirm before quoting.
- **Cyber and bio behavior:** Anthropic docs say most cybersecurity tasks get re-routed to an older model on Opus 5.5 while routine bug finding is still allowed. Read the docs before explaining.
- **Not confirmed:** Sora API shutdown (24 Sep), Claude Haiku 5.5 "coming weeks" (VentureBeat only), Astra usage-limit cuts (one blog, OpenAI has not confirmed). Do not state as facts. The 3 Sep three-way outage is before the window.
- **Opus 5.5 launch time.** Tweets show 18:44 on 22 Sep in the timezone my browser used; say "Tuesday the 22nd" rather than a time.
- **Not in scope:** Vincent's own Fable spend; do not claim we tested Fable.

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
- Sonnet 5.5, day one: [Matthew Berman](https://x.com/MatthewBerman/status/2104634635234005025), [Lance Martin](https://x.com/RLanceMartin/status/2104637229465538850), [Addy Osmani](https://x.com/addyosmani/status/2104633511584084309), [Future Brian](https://x.com/ForwardEditor/status/2104633533981491575), [Tim Jayas](https://x.com/TimJayas/status/2104640048033649115), [Bridgebench](https://x.com/bridgebench/status/2104635523998347519), [stealth comparison](https://x.com/srikanthvaluri/status/2104580745784397876), [LuminaBench](https://x.com/LuminaBench/status/2104565586114056532)

## Sources — Everything Else, 8–28 Sep

- OpenAI: [TechCrunch on Sol and Luna](https://techcrunch.com/2026/09/22/openai-launches-gpt-6-sol-and-luna/), [9to5Mac](https://9to5mac.com/2026/09/22/openai-upgrading-chatgpt-and-codex-with-two-more-gpt-6-models/), https://developers.openai.com/api/docs/models/gpt-6-sol, https://developers.openai.com/api/docs/models/gpt-6-luna, https://developers.openai.com/api/docs/changelog
- xAI: https://x.ai/news/grok-4-7
- Google: https://9to5google.com/2026/09/24/google-says-gemini-4-release-is-coming-as-soon-as-possible/, https://ai.google.dev/gemini-api/docs/changelog
- Open and China: https://mimo.mi.com/docs/en-US/news/latest/v2-6, https://api-docs.deepseek.com/updates/, https://www.marktechpost.com/2026/09/18/alibaba-qwen-releases-qwen3-8-omni-flash/ (snippet only), https://emergent.sh/news/moonshot-ai-launches-kimi-k2-8-preview
- Anthropic news: https://techcrunch.com/2026/09/10/anthropic-details-distillation-campaigns-from-alibaba-moonshot-ai-and-deepseek/, https://www.bleepingcomputer.com/news/artificial-intelligence/anthropic-is-cutting-claude-codes-current-weekly-limits-by-17-percent/, https://www.anthropic.com/news/life-sciences-verification-program
- Coding tools: https://code.claude.com/docs/en/changelog, https://cursor.com/changelog, https://github.blog/changelog/month/09-2026/
- Sonnet 5.5 customer numbers: https://venturebeat.com/technology/anthropic-launches-claude-sonnet-5-5-with-30-cost-reduction-per-task-due-to-faster-speeds-and-fewer-tool-calls
- Mistral: https://techcrunch.com/2026/09/08/mistral-raises-e3b-as-sovereign-ai-becomes-big-business/

## Tweets — Paste Live

> "Sonnet 5.5 is Opus 5.5's little brother, and on the business tests it's basically the same person."

> "They cut the price and the bill stayed flat. Cheaper per word, more words."

> "Ask what a finished task costs. Not what a token costs."

> "One sentence. Fifteen seconds. Two million views. That used to be a motion designer's week."

> "The best posts don't say 'wow'. They give you the prompt."

> "Stop telling it to think hard. It's already thinking. Tell it what done looks like."

> "Low effort to build, high effort to check."

> "Same brief. Two models. Clock's running."
