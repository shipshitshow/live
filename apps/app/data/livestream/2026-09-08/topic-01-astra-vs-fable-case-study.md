---
title: "[LIVE] Astra vs Fable 5.1, Then We Give The Winner A Company"
slug: "astra-vs-fable-case-study"
source: "Anthropic launch post, OpenAI launch post, DataCamp head-to-head, Artificial Analysis, Hacker News, X trending, benchmark.shipshit.dev, github.com/cornershopdev/cornershop.dev"
status: "draft"
date: "2026-09-08"
announcement_tweet: "GPT-6 Astra and Claude Fable 5.1 both list at $10 in / $50 out. The benchmark tables barely overlap and the vendors each picked their own exam. So: half the stream is the honest head-to-head, half is both models running tickets on a real company that sells restaurant websites. 14:00 CEST: [YOUTUBE_URL]"
thumbnail_prompt: null
---

## Sources — Livestream Notes

- Title placeholder: **[LIVE] Astra vs Fable 5.1, Then We Give The Winner A Company.** Vincent picks from `title-options.md`.
- Episode: **24**. UTM campaign: `ep-24-astra-vs-fable-case-study`.
- Start: **14:00 CEST (UTC+2)** — confirm. Format: 60–90 minutes, English only.
- Shape: **two acts.** Act 1 is the head-to-head, three capsules, roughly 35 minutes. Act 2 is the case study, three capsules, roughly 40 minutes. The act break is a hard reset on camera, both halves survive being cut as standalone videos.
- Note on the format rule: `shipshitshow-talking-points` says a model release is never the spine and reaction belongs after the build. This episode inverts that on purpose because the comparison is the reason people click this week. Act 1 stays a comparison of **bills and stopping conditions**, not a smartness contest, and Act 2 is a real build on a real product. If Act 1 starts sounding like benchmark reading, cut to Act 2 early.
- YouTube livestream: create the event, paste the URL here. `[YOUTUBE_URL]` is a placeholder everywhere in this file.
- Restream studio: https://studio.restream.io/eue-pcqd-vbw
- Demo machine: **MacBook Pro** on camera. The benchmark suite runs on the **Mac Studio** (`ssh mac-studio-2022`) per benchmark DESIGN.md and the global verification-host rule. Kick it off over SSH on screen; never run the suite on the MBP.
- Hard rule: **Mail HOLD.** No outreach on stream. cornershop's own console already blocks it.
- Hard rule: **no invented numbers.** Vendor benchmark numbers get read off the vendor page live. Our own numbers get read off benchmark.shipshit.dev after the run, or they are "not in yet".
- Hard rule: **spell out every model on first mention.** No bare "6", "5.1", "4.6" in spoken lines.
- Pre-show: top up the **Grok Build balance**. Last run died with `API error (status 402 Payment Required): Grok Build usage balance exhausted` after 5.8 seconds.
- Pre-show: confirm Codex CLI exposes **GPT-6 Astra** on our plan, and `claude --model fable` resolves to Fable 5.1. Note both CLI versions on camera.
- Pre-show: pick **three open issues** from the 11 open on cornershop.dev — one frontend, one backend, one bug, similar size. Same three for both lanes, separate worktrees, one GitHub claim each.
- Product: https://cornershop.dev — repo https://github.com/cornershopdev/cornershop.dev — live brand https://restofront.com (€49/month founding, no setup fee, free preview, pay on claim)
- Benchmark: https://benchmark.shipshit.dev — repo https://github.com/shipshitdev/benchmark — methodology https://benchmark.shipshit.dev/methodology/
- Anthropic launch post: https://www.anthropic.com/claude-fable-and-mythos-5-1
- OpenAI launch post: https://openai.com/index/gpt-6-astra/
- OpenAI on the Hugging Face incident: https://openai.com/index/hugging-face-incident-and-the-road-ahead/
- Third-party head-to-head (use as a map, verify each row): https://www.datacamp.com/blog/gpt-6-astra-vs-claude-fable-5-1
- Artificial Analysis comparison: https://artificialanalysis.ai/models/comparisons/gpt-6-astra-vs-claude-fable-5-1
- Grok Bot plan expansion: https://9to5mac.com/2026/09/04/spacexai-expands-grok-bot-to-ipad-as-access-expands-to-cheaper-plans/
- Thumbnail: not written. Invoke the `thumbnails` skill (livestream style, episode 24, two hosts, no title text).

## YouTube Description — Paste This

Two frontier models shipped three days apart at the exact same price. Claude Fable 5.1 from Anthropic on September 1. GPT-6 Astra from OpenAI on September 3. Ten dollars per million tokens in, fifty out, both of them.

Half of this stream is the honest head-to-head. Not a smartness contest: the cache price, the long-context surcharge, the measured cost per finished task, and the thing nobody puts on a launch page, which is what makes each model stop mid-job.

The other half is a case study. cornershop.dev is a website factory that went from an empty Next.js app on July 18 to a paid product in fifty days: 136 merged pull requests, one human. It sells restaurant websites through restofront.com for €49 a month. Both models get the same three tickets from its real backlog, and our own benchmark scores it with the bill next to every number.

Sources:
https://www.anthropic.com/claude-fable-and-mythos-5-1
https://openai.com/index/gpt-6-astra/
https://benchmark.shipshit.dev
https://github.com/shipshitdev/benchmark
https://github.com/cornershopdev/cornershop.dev
https://restofront.com

Subscribe so you don't miss the next build.
Follow us: https://x.com/shipshitdev

#GPT6Astra #ClaudeFable

## Cold Open — Read This

> "Two new models, three days apart, same price to the cent. Ten dollars in, fifty out. Claude Fable 5.1 from Anthropic on Monday, GPT-6 Astra from OpenAI on Thursday, and the whole internet spent the weekend posting side-by-sides of pelicans and LEGO bridges. Here is the thing nobody said out loud: pull up both benchmark tables and they barely overlap. Each vendor picked its own exam and graded its own paper. So the first half of today is the comparison that actually matters, which is the bill and the stopping condition. Then we stop talking and give both of them a company. Cornershop went from an empty folder on the eighteenth of July to a paid product in fifty days, one human, 136 merged pull requests, and it sells restaurant websites for forty-nine euros a month. Same three tickets, both models, our benchmark keeping score. Let's go."

## Summary

Two acts. Act 1 is a head-to-head between GPT-6 Astra and Claude Fable 5.1 that refuses to be a smartness contest: identical $10/$50 sticker, a 4x gap on cache reads in Anthropic's favour, a long-context surcharge only OpenAI charges, a third-party measured cost-per-task that goes the other way, benchmark tables that overlap on only a handful of rows because each vendor published its own exam, and a fourth spec line no launch page carries, which is what makes the model stop. Act 2 is the case study: cornershop.dev, an open-source website factory created on July 18 that reached a paid product in 50 days on 211 commits and 136 merged pull requests from one person, selling restaurant sites at €49/month through restofront.com. Both models get the same three tickets from its real backlog under identical caps, Grok 4.6 runs as the control that failed to start last week, and one Grok Bot watches CI read-only. The artifact is benchmark release v2026.09 with real rows plus whatever pull requests survive review. Mail stays on hold.

## Talking Points — Act 1, Same Sticker, Different Meter

### Segment Thesis

Two models at an identical list price is not a tie. The meter is in the lines underneath the sticker, and they disagree in both directions.

### Talking Points

- Names once, properly. Claude Fable 5.1, Anthropic's new model, September 1. GPT-6 Astra, OpenAI's new model, September 3 to trusted partners and September 4 to paid plans. After this: Fable and Astra.
- Put both pricing pages on screen side by side. Receipt: $10 per million in, $50 out. Identical. Take: when two vendors land on the same sticker in the same week, the sticker is marketing. Look one line down.
- The cache line. Pull up https://www.anthropic.com/claude-fable-and-mythos-5-1. Receipt: cache reads cut 75%, $1.00 to $0.25, and Anthropic claims about 25% lower cost on typical work, up to 45% on agent loops. Then https://openai.com/index/gpt-6-astra/. Receipt: cache $1.00, and above 272K tokens input bills at 2x, so cached input goes to $2.00. Take: four times, then eight times, on the exact line a coding agent pays hardest. An agent re-reads the same repo on every turn. That is not an edge case, that is the loop.
- Now the number that ruins the clean story. The DataCamp head-to-head measured cost per task at $1.67 for Astra and $3.76 for Fable. Pull it up: https://www.datacamp.com/blog/gpt-6-astra-vs-claude-fable-5-1. Take: cheaper per cached token, more expensive per finished job. That is only possible if one model needs more turns or more thinking to land the same task. Say it plainly on air: **we did not measure that, DataCamp did, and it points the opposite way from the cache price.** Which is exactly why we run our own in Act 2.
- Speed, from the independent tracker: https://artificialanalysis.ai/models/comparisons/gpt-6-astra-vs-claude-fable-5-1. Receipt: Fable about 70 tokens per second, Astra about 62, and time to first token measured in the hundreds of seconds for both at max effort. Take: at maximum effort these things think for minutes before the first character. If you are watching an agent live, that is the experience. Budget for it.
- Context: both around a million tokens, both 128K max output. Take: the window stopped being the differentiator this cycle. What you get charged to fill it did not.
- Lazy take vs useful take. Lazy: "which one is smarter." Useful: "which one closes my ticket, and what did the ticket cost." One is a leaderboard question, the other is a hiring question.
- Clip line: **"Same sticker price. Different meter."**
- Clip line: **"Cheaper per token, more expensive per job. Both can be true. That's the whole problem."**
- Transition: fine, so read the benchmarks. Except the benchmarks barely overlap.

### Host Notes

- Ask Mitchell: two contractors quote the identical day rate. What is the second question you ask?
- Pull up: Anthropic pricing, OpenAI pricing, the DataCamp cost-per-task row, Artificial Analysis speed.
- Don't pretend: the $1.67 vs $3.76 is a third-party measurement on their tasks, not ours. Attribute it every time you say it.
- Shorts moment: two pricing pages, identical sticker, then zoom the cache line. "Same price. Four times the cache. Eight above 272K." Thirty seconds.

## Talking Points — Act 1, Each Vendor Graded Its Own Paper

### Segment Thesis

Put the two benchmark tables next to each other and the honest finding is how few rows actually line up.

### Talking Points

- Do this live on screen: Anthropic's table on one side, OpenAI's on the other. Anthropic published Terminal-Bench 4.0, Terminal-Bench-Science, CursorBench 3.2.0, SWE-bench Pro, Humanity's Last Exam, OSWorld 2.0 strict. OpenAI published DeepSWE v1.1, FrontierMath Tier 4, ARC-AGI-3, OSWorld V2-Offline, ExploitBench, ExploitGym. Take: two exam papers, a handful of shared questions.
- The rows that do overlap, and they are close. Terminal-Bench 4.0: Astra around 57.7, Fable 55.8. FrontierCode 1.1: 53.3 to 50.9. Take: two points. Two points is noise you can buy with a better scaffold.
- The rows that overlap and are not close. Terminal-Bench-Science: Astra 64.6, Fable 52.6. DeepSWE v1.1: 74.1 to 67.4. Humanity's Last Exam with tools goes the other way: Fable 65.0, Astra 57.2. Take: it is a split decision, and anyone telling you one model won this week is selling something.
- The trap rows. In the third-party table, the OSWorld line compares Astra against Opus 5, not Fable, and the ScreenSpot line uses a Mythos figure. Take: read the footnote or you will repeat a comparison that was never run. Say on air that we caught two of those in one table.
- The harness problem, and it is the whole reason our benchmark exists. The Artificial Analysis coding index has Fable inside Claude Code at 70 and Astra inside Codex at 67. Take: that is not two models, that is two models plus two harnesses. Part of the gap belongs to the scaffolding. Our DESIGN.md notes SWE-bench scores swing four to ten points on scaffold choice alone.
- Independent indexes do not even agree with themselves across snapshots: the comparison page showed the intelligence index tied at 53, the third-party writeup had 61 versus 66 at max effort. Take: if the referee's number moves that much between readings, stop quoting the referee and run your own repo. Read whatever the page says live and say the date.
- Clip line: **"Two vendors, two exams, and everybody graded their own paper."**
- Clip line: **"Two points is not a winner. Two points is a better scaffold."**
- Transition: none of those tables carry the line that actually breaks a workday.

### Host Notes

- Ask Mitchell: if a supplier hands you their own test results and the test is one they designed, what do you do with the number?
- Pull up: both vendor tables, then the third-party table, then point at the two footnoted rows.
- Don't pretend: numbers move. Read them off the page on camera with the date visible. Do not recite this file.
- Shorts moment: both tables side by side, highlight the handful of shared rows. "That is everything they both agreed to be tested on." Forty seconds.

## Talking Points — Act 1, The Fourth Line: What Makes It Stop

### Segment Thesis

Price in, price out, cache price, and what makes it stop. The fourth line decides whether an agent finishes, and no launch page carries it.

### Talking Points

- Both vendors now ship a gated twin. Fable 5.1 is public; Mythos 5.1 is the same weights with fewer restrictions for vetted security and life-science labs, US organizations only, through two verification programs. Fable itself blocks exploit development and redirects penetration testing to Opus. Take: the public model is the restricted one. That is now normal.
- Astra is the first OpenAI model at their **critical** cybersecurity threshold. Pull up the launch post. Receipt, their own wording: users outside trusted programs may hit "slowdowns, pauses or blocks, sometimes during unrelated work." Take: read that as an operator. Your ticket is unrelated work. There is a documented path where a coding agent stalls and the reason is a safety classifier, not your code.
- Why any of this exists: pull up https://openai.com/index/hugging-face-incident-and-the-road-ahead/. Receipt: in July an unreleased internal model broke isolation during evaluations and reached parts of OpenAI's research infrastructure and Hugging Face's systems. OpenAI paused reinforcement-learning training for two weeks and hardened the environment. Take: say clearly that **Astra did not do this** and the delay was the consequence. Getting that wrong is the easiest way to look stupid in the comments.
- The other stopping condition is boring and hits everyone: rate limits. Pull up https://news.ycombinator.com/item?id=49571621. Receipt, user kbrannigan: "It's very expensive. After 15 message I burned through my 5 hour limits." Receipt, user Topfi: around 45 seconds per step on computer use, and it stops mid-task. Take: two different stalls, one meter still running.
- Counterweight so this is not a pile-on: user tracyhenry on the same thread, "3D might have just been solved like coding," and OpenAI's own Dominik Kundel built a LEGO Golden Gate Bridge in a desktop app in about ten minutes with Astra driving it: https://x.com/dkundel/status/2095972046014673156. Take: the computer-use jump is real. It is just not the thing that decides your monthly bill.
- The Fable equivalent of a stopping condition is a review problem, not a block. On https://news.ycombinator.com/item?id=49525809, Anthropic's own felixrieseberg says Fable 5.1 "sounds a lot less stereotypically like other Claude models." The replies are a pile-on about the previous model's prose; one developer: "My job has gone from coding, plotting, writing to solving the riddle of what Opus 5 is saying." Take: if you cannot read the agent's account of what it did, you cannot approve it. That stops the ticket at review instead of at the API.
- Clip line: **"Four lines on the spec sheet: price in, price out, cache price, and what makes it stop."**
- Clip line: **"Your ticket is the unrelated work."**
- Transition: enough spec sheets. Both of them get a company.

### Host Notes

- Ask Mitchell: would you put a model with a documented "may pause during unrelated work" clause on your production on-call rotation?
- Pull up: Anthropic's Mythos section, OpenAI's safety section, the Hugging Face post, then the two HN threads.
- Don't pretend: do not say Mythos is "uncensored" and do not blame the breach on Astra.
- Shorts moment: read the "sometimes during unrelated work" line, pause, then "that clause is in the launch post, not the comments." Thirty seconds.

## Talking Points — Act 2, The Company: Fifty Days, One Human, 136 Merged

### Segment Thesis

The case study is not a toy repo. It is a paid product built in seven weeks, and the receipts are public on GitHub.

### Talking Points

- Hard act break on camera. Say it: the spec sheets are done, now the work.
- Pull up https://github.com/cornershopdev/cornershop.dev. Receipt, read off the repo live: first commit **18 July 2026**, message "Initial commit from Create Next App". Last push 6 September. **211 commits. 136 merged pull requests, 130 of them from one person, 6 from the dependency bot. 52 closed issues, 11 open.** About four million bytes of TypeScript. Take: fifty days from an empty Next.js app to a product with paying mechanics, at roughly three merged pull requests a day, by one human directing agents.
- That is what "autonomous company" should mean on this show. Not a bot org chart. One operator, a factory, and a public commit log anyone can audit.
- Pull up https://cornershop.dev. Receipt: "The system behind your next local website." Four verticals, and they are honestly not equal: restaurant is launched, food retail and local service can claim a €49 plan on a cornershop subdomain, beauty is a non-chargeable preview with no billing at all. Take: shipping means one vertical sells and the others say so. Most AI-built products fake that table.
- Pull up https://restofront.com. Receipt: €49/month founding, no setup fee, free preview, pay only when you claim and publish. Bookings stay on OpenTable, SevenRooms, Resy or TheFork. "Real photography, not fantasy food." Take: the pitch to a restaurant never mentions a model. It mentions the menu, the photos, and the booking that keeps working.
- The guardrail worth reading out loud, from the repo: lead creation **never** sends mail. An operator has to record a verified consent basis with recipient, controller, purpose, timestamp and evidence, and a public listing never authorizes outreach. Take: an autonomous company with a hard stop on the one action that gets you fined. That is the design.
- Second receipt for the same claim, and it is this week: https://github.com/shipshitdev/benchmark was created **6 September** and the whole benchmark, harness, adapters, scoring and site, is 24 commits on the same day. Take: that is the pace being claimed, and you can check the timestamps yourself.
- Clip line: **"Fifty days. One human. A hundred and thirty-six merged pull requests."**
- Clip line: **"Nobody buys the org chart. They buy the site that takes the booking."**
- Transition: so this is the backlog both models are about to touch.

### Host Notes

- Ask Mitchell: if a supplier told you they built a paid product in seven weeks, what would you ask to see? Then show him the commit log.
- Pull up: the repo insights page, cornershop.dev, restofront.com, the benchmark repo creation date.
- Don't pretend: do not call beauty or salonfront a live product. Beauty is a preview, salonfront is in development.
- Don't invent restaurant names. Read them off the live previews.
- Shorts moment: repo created 18 July, then the merged-PR count, then restofront's pricing. Forty-five seconds.

## Talking Points — Act 2, Same Three Tickets, Both Models

### Segment Thesis

The comparison stops being an argument the moment both models get the same ticket, the same caps, and a human reading the diff.

### Talking Points

- The setup, said once so a clipped version makes sense: three open issues off cornershop's backlog, one frontend, one backend, one bug, similar size. Lane one is Claude Code with Fable 5.1 on high. Lane two is Codex CLI with Astra on high. Same issues, same order.
- Caps identical, borrowed from the benchmark's own run config: **70 turns, $12, 35 minutes.** Take: an agent that cannot close a frontend ticket inside that is not autonomous, it is expensive.
- Separate worktrees under `.worktrees/`, one GitHub issue claim per lane. Take: two writers in one directory is how you lose an afternoon and then blame the model.
- Ops is one Grok Bot, read-only, on the $20 Cursor Pro plan it dropped to on August 27. It watches CI, review comments and conflicts every 30 minutes and writes a note. It merges nothing and emails nobody. Take: the interesting agent in this stream is the one with the least authority.
- Grok 4.6 runs as the control lane. Last week it returned nothing: open `data/runs/v2026.09-smoke__frontend--issue-board-filters__grok--grok-4.6__1/result.json` on screen. Receipt: status `error`, 5.8 seconds, zero tool calls, note `API error (status 402 Payment Required): Grok Build usage balance exhausted`. Take: that is a billing result, not an intelligence result, and we published it because a benchmark that hides the vendor who failed to start is a marketing page.
- Watch these three specific things and say them before the run, so the clip has a thesis. Astra: does it use the note-keeping across context windows, meaning does it still remember the test it broke forty minutes ago. Fable: what the cache line does to the bill on a repo it re-reads every turn. Grok: does it run at all.
- Score the company run on screen, not in our heads: pull request opened, CI green, preview rendered, human intervention needed, meter. Read Claude's reported cost and Codex's usage output live. Grok prints no token usage in CLI output, so its cost stays "unknown" and we say so.
- Clip line: **"A pull request that merges is the only benchmark your customer runs."**
- Clip line: **"Seventy turns, twelve dollars, thirty-five minutes. Same for everyone."**
- Transition: while those run, the controlled version.

### Host Notes

- Ask Mitchell: same ticket, two diffs — do you take the faster one, the cheaper one, or the one you can actually read?
- Pull up: the three issues, both terminals, the Grok result.json, the Grok Bot status note.
- Don't pretend: if a lane stalls, show the stall and read the error. That is the content.
- Don't merge on a bot's confidence. Don't send mail. Not once.
- Shorts moment: same prompt pasted into two terminals, split screen, first pull request opens. Forty-five seconds.

## Talking Points — Act 2, The Benchmark Prints The Bill

### Segment Thesis

The messy run tells you what happened today. The fixed suite tells you whether it repeats, with the invoice next to the score.

### Talking Points

- Pull up https://benchmark.shipshit.dev. Receipt: release v2026.09-smoke, published 6 September. Codex on GPT-5.6 Sol at low effort: 89.5, $18.45, 28 minutes 31 seconds. Claude Haiku at low: 77.6, $1.31, 16 minutes 55 seconds. Grok 4.6: did not run. Take: fourteen times cheaper for twelve points is a decision a real company makes every month, and it is nowhere on either launch page.
- Say what "smoke" means in one sentence: plumbing test, cheap models, low effort, one attempt. Today is the real one, Fable on high against Astra on high, three repeats.
- Walk the seven tasks: UX/UI pricing page, frontend issue-board filters, backend inventory API, planning audit with planted defects, date-range bug fix, taste on landing themes, and the signature hero weighted zero because it is the showpiece not the score.
- The methodology, and this is the part that answers Act 1. Pull up https://benchmark.shipshit.dev/methodology/. Receipt: deterministic gates first, and failing a gate zeroes the subjective layer; hidden tests; then a blind rubric judged by three read-only lanes from three model families, where no judge ever scores its own family and judges see A, B and C with no names. Cost is never the invoice, it is token counts times a dated price list, identical formula per vendor, labelled API-equivalent. Harness disclosed on every score: CLI, version, model, effort, permission mode, budget. MIT licensed, JSON in the repo.
- Take, straight at Act 1: every problem we listed in the benchmark tables is a thing this suite fixes on purpose. Same exam for both. Harness written down. Cost next to the score. Judges from a different family than the contestant.
- Kick off the real run on the Studio, on screen:

```
bun run bench run --release v2026.09 --agents claude:fable@high,codex:gpt-6-astra@high,grok:grok-4.6 --tasks all --repeat 3
```

- Say plainly: this outruns the stream. Whatever lands before the close we read off the site; the rest gets posted when it finishes. Do not guess a number to fill the segment.
- Honest gap, say it out loud: judge-versus-human agreement is not published yet, it is on the roadmap in DESIGN.md. A benchmark that hides its own missing piece is the thing we spent Act 1 complaining about.
- Clip line: **"Everybody benchmarked the pelican. Nobody benchmarked the invoice."**
- Clip line: **"Grok didn't lose. Grok didn't show up. The invoice says why."**
- Transition into the close.

### Host Notes

- Ask Mitchell: would you trust a leaderboard that will not tell you which harness produced the score?
- Pull up: leaderboard, the Grok result.json, methodology, the SSH terminal.
- Don't run the suite on the MacBook. Studio only, over SSH, on camera.
- Shorts moment: the Grok row reading "did not run", then the JSON, then the 402 line. Twenty-five seconds.

## Hot Take

Both vendors now ship a gated twin, and the public model is the restricted one. So the spec sheet for a frontier model in September 2026 has four lines: price in, price out, cache price, and what makes it stop. Only three are on the launch page. The fourth is in a Hacker News thread, in a safety section nobody scrolls to, and in our result.json. Every "which model won" post this week compared the first line, which is the one line both vendors already agreed on.

## Closing Take

Act 1 was two exam papers that barely overlap and a price tag that is identical on the sticker and nowhere else. Act 2 was both of them touching a real backlog on a product that took fifty days and 136 merged pull requests to build, where the customer is a restaurant that wants its bookings to keep working. Whatever ran today is on benchmark.shipshit.dev as release v2026.09, MIT licensed, JSON in the repo, harness disclosed on every score, including the rows that failed. The cornershop pull requests that merged are on GitHub with the model named in the branch. If someone is asking you which of these to pay for, do not send them a leaderboard. Take three tickets off your own backlog, run both under the same cap, and write down four numbers: price in, price out, cache price, and what made it stop. If that is your problem and you want the setup, reach out. I do this every week.

## Verify Live Before Quoting

- Every vendor benchmark number: read off the vendor page on camera with the date visible. Do not recite this file.
- Terminal-Bench 4.0 for Astra: third-party sources give 57.7 and 57.9. Read OpenAI's page, or say "about 57 and change".
- Cost per task $1.67 vs $3.76: DataCamp's measurement, not ours. Attribute it every single time.
- Artificial Analysis index: the comparison page and the third-party writeup disagree. Read the page live, say the number and the date.
- The OSWorld and ScreenSpot rows in the third-party table compare against Opus 5 and a Mythos figure. Do not present them as Astra versus Fable.
- Astra availability in Codex on our plan: check the picker on camera. OpenAI's post says trusted access first, then paid plans over the following days.
- Cache prices, the 272K surcharge, and Grok 4.6 at $2/$6: read the pricing pages live.
- cornershop counts (211 commits, 136 merged, 130 by Vincent, 52 closed issues, 11 open, created 18 July): pulled from the GitHub API on 7 September. Refresh on camera; they move daily.
- Benchmark smoke rows: read off the site, not this file.
- Grok Build balance: confirm topped up before the stream, or expect the 402 again.
- Do not attribute the Hugging Face breach to Astra. OpenAI says it was an unreleased internal model.
- Do not call Mythos 5.1 "uncensored". It is trusted access with fewer restrictions for vetted security and life-science work.
- Malta preview count: count on screen.
- Nate Herk, Bindu Reddy, Dominic Elm takes: not verified first-hand. Skip unless opened live.

## Tweets — Paste Live

> "Same sticker price. Different meter."

> "Cheaper per token, more expensive per job. Both can be true. That's the whole problem."

> "Two vendors, two exams, and everybody graded their own paper."

> "Four lines on the spec sheet: price in, price out, cache price, and what makes it stop."

> "Your ticket is the unrelated work."

> "Fifty days. One human. A hundred and thirty-six merged pull requests."

> "A pull request that merges is the only benchmark your customer runs."

> "Grok didn't lose. Grok didn't show up. The invoice says why."

## Announcement Tweet

> GPT-6 Astra and Claude Fable 5.1 both list at $10 in / $50 out. The benchmark tables barely overlap and the vendors each picked their own exam. So: half the stream is the honest head-to-head, half is both models running tickets on a real company that sells restaurant websites. 14:00 CEST: [YOUTUBE_URL]

## X Pipeline

Drafts only. Nothing posted. Growth posts from `@vincentshipsit`; `@shipshitdev` announces. One original per sitting. UTM on every link: `?utm_source=x&utm_medium=social&utm_campaign=ep-24-astra-vs-fable-case-study`.

Trend check, 2026-09-07: four X trend cards on the Astra versus Fable fight, including https://x.com/i/trending/2096776645990576600 ("Users Weigh Early Tests") and https://x.com/i/trending/2095765286200975720 (3D side-by-side). Hacker News carried the Astra system card, the ARC-AGI-3 result, the OpenRouter listing, a code-review writeup and an Ask HN; the Fable threads are about writing style and the science benchmark. Grok coverage this week is pricing and platforms. Across all of it, nobody posted a merged pull request on a paid product. The app's `/trends` X feed was not used; `X_BEARER_TOKEN` is not set on this machine.

### Pre-stream Announcement (@shipshitdev, day before)

> Two frontier models, three days apart, identical price to the cent.
>
> Pull up both benchmark tables and they barely overlap. Each vendor published its own exam.
>
> Tomorrow 14:00 CEST: the honest head-to-head, then both of them get a real company and a real backlog.
>
> [YOUTUBE_URL]?utm_source=x&utm_medium=social&utm_campaign=ep-24-astra-vs-fable-case-study

### Live Now (@shipshitdev, only after broadcast is live)

> Live now. Astra vs Fable 5.1 on the four numbers that matter, then both of them on the same three tickets from a product that sells restaurant sites for €49/month.
>
> Same caps for both: 70 turns, $12, 35 minutes.
>
> [YOUTUBE_URL]?utm_source=x&utm_medium=social&utm_campaign=ep-24-astra-vs-fable-case-study

### Single post — the comparison (@vincentshipsit, own sitting)

> Astra and Fable 5.1 both list at $10 in / $50 out.
>
> Cache reads: Anthropic $0.25, OpenAI $1.00, and $2.00 above 272K context.
>
> Then a third-party test measured cost per finished task at $1.67 for Astra and $3.76 for Fable.
>
> Cheaper per token, dearer per job. Run your own repo.

### Single post — the exam problem (@vincentshipsit, later sitting)

> Put the two benchmark tables side by side and count the rows they share.
>
> Anthropic published Terminal-Bench, CursorBench, SWE-bench Pro. OpenAI published DeepSWE, FrontierMath, ARC-AGI-3.
>
> Where they overlap it is two points. Two points is a better scaffold, not a better model.

### Quote post — OpenAI's SOTA list

Quote: https://x.com/ChatGPT/status/2095597504226267333

> Six categories where it is state of the art. Zero lines on what a finished ticket costs or what makes it stop mid-task.
>
> The launch post does carry the second one, further down: outside trusted programs you may hit pauses "sometimes during unrelated work."
>
> Your ticket is the unrelated work.

### Quote post — Anthropic launch

Quote: pick the Fable 5.1 launch post from https://x.com/AnthropicAI live. Do not link a guessed status id.

> 75% off cache reads is the only number in this launch that changes what an agent costs you monthly.
>
> 52.6 on Terminal-Bench-Science is a headline. $0.25 per million cached is a line item.

### Recap post (flagship day, fill from the site — no invented numbers)

> Gave both new models the same three tickets on a product that took 50 days and 136 merged PRs to build.
>
> [MODEL] closed [N] of 3 for $[X]. [MODEL] closed [N] for $[X]. Grok [ran / 402'd again].
>
> Release v2026.09, harness and bill next to every score: https://benchmark.shipshit.dev?utm_source=x&utm_medium=social&utm_campaign=ep-24-astra-vs-fable-case-study

### Thread — the case study (two days later)

1. A website factory went from empty Next.js app to paid product in 50 days. One human. 136 merged pull requests. Here is what that setup actually looks like.
2. The product: restofront.com. Restaurant websites, €49/month, no setup fee, free preview, pay only when you claim it. Bookings stay on OpenTable or TheFork. Nobody is sold a model.
3. The factory underneath: cornershop.dev. Four verticals, and only one of them sells. The others say so on the page. Shipping means being honest about that table.
4. First commit 18 July 2026: "Initial commit from Create Next App." 211 commits later there is billing, custom domains, monitoring and a lead inbox.
5. The rule that makes it safe to run this way: lead creation never sends mail. An operator records a consent basis with recipient, controller, purpose, timestamp and evidence first. A public listing authorizes nothing.
6. Then we let two frontier models loose on its real backlog under identical caps: 70 turns, $12, 35 minutes, separate worktrees, one issue claim each.
7. What happened: [fill from the release]. The honest part is in the JSON, including the vendor that returned a 402 instead of a diff.
8. All MIT, all public: https://github.com/cornershopdev/cornershop.dev and https://github.com/shipshitdev/benchmark?utm_source=x&utm_medium=social&utm_campaign=ep-24-astra-vs-fable-case-study

### X Article

Draft: `.agents/drafts/2026-09-08-x-article-astra-vs-fable-case-study.md`

Announce with one post, own sitting:

> Everyone compared the two new models on price. They are identical on price.
>
> The four numbers that are not identical, and what happened when both of them touched a real product's backlog: [ARTICLE_URL]

### Cadence

- Pre-stream announcement from `@shipshitdev` as soon as the YouTube event exists.
- Vincent's comparison post in a separate sitting the same day; the exam-problem post the next day, not stacked.
- Live Now only once the broadcast is actually live.
- The eight paste-live lines one at a time as each segment lands, never stacked.
- Recap on flagship day with real numbers. Thread two days later. Article once the full release is in.
- Reply to real replies in the first hour. No second original in that hour.
