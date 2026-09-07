---
title: "[LIVE] Three New Models Run My Company For A Day. Here's The Bill."
slug: "three-models-one-company"
source: "Anthropic launch post, OpenAI / CNBC / 9to5Mac, SpaceXAI / 9to5Mac, Hacker News, X trending, benchmark.shipshit.dev, cornershop.dev"
status: "draft"
date: "2026-09-08"
announcement_tweet: "Three frontier models shipped in one week. Same $10 sticker. Everybody is posting side-by-sides of pelicans and LEGO bridges. We are giving all three the same real company to run, restaurant sites that have to sell, and scoring it on benchmark.shipshit.dev live. 14:00 CEST: [YOUTUBE_URL]"
thumbnail_prompt: null
---

## Sources — Livestream Notes

- Title placeholder: **[LIVE] Three New Models Run My Company For A Day. Here's The Bill.** Vincent picks from `title-options.md`.
- Episode: **24**. UTM campaign: `ep-24-three-models-one-company`.
- Start: **14:00 CEST (UTC+2)** — confirm. Format: live build, English only, 60–90 minutes.
- YouTube livestream: create the event, paste the URL here and into the announcement tweet. `[YOUTUBE_URL]` is a placeholder everywhere in this file.
- Restream studio: https://studio.restream.io/eue-pcqd-vbw
- Spine: **Problem** three models, one week, same price, nobody has run them on a business → **Build** the same real backlog on cornershop.dev handed to Claude Code with Claude Fable 5.1, Codex CLI with GPT-6 Astra, Grok Build with Grok 4.6, plus one Grok Bot as ops → **Demo** what merged, what rendered, what the meter says → **Artifact** benchmark.shipshit.dev release v2026.09 with three real rows, and the cornershop pull requests that survived.
- Demo machine: **MacBook Pro** on camera. The full benchmark run belongs on the **Mac Studio** (`ssh mac-studio-2022`) per the benchmark DESIGN.md host rule and the global verification rule. Kick it off over SSH on screen; do not run the suite on the MBP.
- Hard rule: **Mail HOLD.** No outreach. cornershop's operator console already blocks it (lead creation never sends mail; consent evidence required). Say that on air, it is the point.
- Hard rule: **show the product, not a second company.** restofront is what a restaurant buys. Cornershop stays behind the curtain.
- Hard rule: **no invented numbers.** Only the smoke rows exist today. Every new score is read off the site after the run finishes, or it is "not in yet".
- Hard rule: **spell out every model on first mention.** No bare "5.1", "6", "4.6" in spoken lines.
- Pre-show: top up the **Grok Build balance**. The smoke run died with `API error (status 402 Payment Required): Grok Build usage balance exhausted` after 5.8 seconds. If it is not topped up, Grok does not run again and we say so.
- Pre-show: confirm Codex CLI on our plan exposes **GPT-6 Astra** (`codex` model picker). Confirm `claude --model fable` resolves to Claude Fable 5.1. Confirm `grok` CLI version.
- Pre-show: pick **three open issues** on https://github.com/cornershopdev/cornershop.dev of similar size (one frontend, one backend, one bug). Same three issues for every agent, separate worktrees under `.worktrees/`, one issue claim each. Do not let two writers touch the same tree.
- Product: https://cornershop.dev — repo https://github.com/cornershopdev/cornershop.dev — live restaurant brand https://restofront.com (€49/month founding, no setup fee, preview free, pay only on claim). Salonfront: in development, no public preview.
- Benchmark: https://benchmark.shipshit.dev — repo https://github.com/shipshitdev/benchmark — methodology https://benchmark.shipshit.dev/methodology/
- Anthropic launch post: https://www.anthropic.com/claude-fable-and-mythos-5-1
- OpenAI launch post: https://openai.com/index/gpt-6-astra/
- OpenAI on the Hugging Face incident: https://openai.com/index/hugging-face-incident-and-the-road-ahead/
- Grok Bot plan expansion: https://9to5mac.com/2026/09/04/spacexai-expands-grok-bot-to-ipad-as-access-expands-to-cheaper-plans/
- Grok 4.6: https://x.ai/news/grok-4-6
- Thumbnail: not written. Invoke the `thumbnails` skill (livestream style: two hosts, episode number 24, no title text).

## YouTube Description — Paste This

Three frontier models shipped in one week. Claude Fable 5.1 from Anthropic on September 1. GPT-6 Astra from OpenAI on September 3. Grok Bot from SpaceXAI dropped to the $20 Cursor plan and landed on iPad and Android. Same $10-per-million sticker price on two of them. The internet is comparing pelicans.

We are giving all three the same real company to run: cornershop.dev, the open-source website factory behind restofront.com, which sells finished restaurant websites for €49 a month. Same three issues. Three coding agents. One Grok Bot as ops. Then we score it on benchmark.shipshit.dev, our own MIT-licensed benchmark that runs the CLI agents people actually pay for and prints the API-equivalent bill next to every score.

Last week Grok did not even run. Balance exhausted. That is in the data too.

Sources:
https://www.anthropic.com/claude-fable-and-mythos-5-1
https://openai.com/index/gpt-6-astra/
https://9to5mac.com/2026/09/04/spacexai-expands-grok-bot-to-ipad-as-access-expands-to-cheaper-plans/
https://benchmark.shipshit.dev
https://github.com/shipshitdev/benchmark
https://github.com/cornershopdev/cornershop.dev
https://restofront.com

Subscribe so you don't miss the next build.
Follow us: https://x.com/shipshitdev

#GPT6Astra #ClaudeFable #GrokBot

## Cold Open — Read This

> "If you run a company, three new AI models landed on your desk this week and every one of them wants ten dollars per million words in and fifty out. Claude Fable 5.1 from Anthropic on Monday. GPT-6 Astra from OpenAI on Thursday, with the president of OpenAI saying the word AGI on the launch call. And Grok Bot, SpaceXAI's worker with its own cloud computer, dropped from three hundred dollars a month to twenty. The whole internet is posting side-by-sides. Pelicans. LEGO bridges. Shooter maps. Nobody has handed them a business. So today they get mine. Cornershop is the factory behind restofront, which sells finished restaurant websites for forty-nine euros a month. Same three issues, three agents, one bot as ops, and our own benchmark keeps score with the bill next to every number. Last week Grok didn't even run. Let's see if it does today. Let's go."

## Summary

The episode is not a model review. It is a hiring test. Three frontier releases in one week, two at identical list prices, and the public evidence is toy demos and benchmark screenshots. We run the same real backlog from cornershop.dev, the open-source website factory behind restofront.com, through Claude Code with Claude Fable 5.1, Codex CLI with GPT-6 Astra, and Grok Build with Grok 4.6, with a Grok Bot watching CI and pull requests as ops. In parallel the Mac Studio runs benchmark.shipshit.dev release v2026.09 on the fixed seven-task suite so there is a controlled number next to the messy one. The receipts we already have: the smoke release shows Codex at 89.5 for $18.45, Claude Haiku at 77.6 for $1.31, and Grok "did not run" because the Grok Build balance hit a 402. The artifact is a benchmark release with three real rows and whatever cornershop pull requests survive review. Mail stays on hold. Nobody founds a company on stream.

## Talking Points — Three Models, One Week, Same Sticker

### Segment Thesis

The launch week gave you three price tags and zero operator evidence. The sticker is identical. The bill will not be.

### Talking Points

- Say the names once, properly. Claude Fable 5.1, Anthropic's new model, September 1. GPT-6 Astra, OpenAI's new model, September 3 preview and September 4 to paid users. Grok 4.6 is SpaceXAI's model from August 12; Grok Bot is their worker that runs on its own cloud computer. After this, "Fable", "Astra", "Grok".
- Pull up https://www.anthropic.com/claude-fable-and-mythos-5-1. Receipt: $10 per million in, $50 out, cache reads cut 75% to $0.25. Anthropic's own claim: about 25% cheaper on typical work, up to 45% on agent loops. Take: for an agent that re-reads the same repo two hundred times, the cache price is the price.
- Pull up https://openai.com/index/gpt-6-astra/. Receipt: $10 in, $50 out, cache $1, and a 1.05 million token window that charges double input above 272K. Fast mode is 2x. Take: same sticker as Fable, four times the cache price, and a long-context surcharge that an agent will trip without telling you.
- Pull up https://x.ai/news/grok-4-6. Receipt: $2 in, $6 out, 500K context, ships in Cursor and Grok Build. Take: a fifth of the price on paper. On our benchmark it produced zero tokens because the balance was empty. Cheap is not the same as available.
- Grok Bot pricing walk, dates only: August 11 launch inside the $300 SuperGrok Heavy plan and $200 Cursor Ultra. August 27, on the $20 Cursor Pro plan. September 4, iPad and Android, and free for enterprise customers for a couple of weeks. Pull up https://9to5mac.com/2026/09/04/spacexai-expands-grok-bot-to-ipad-as-access-expands-to-cheaper-plans/. Take: when the price falls 15x in three weeks, the product is not the revenue. Your usage meter is. No Grok Bot-specific spend cap exists yet, per SpaceXAI's docs.
- Lazy take vs useful take. Lazy: "which model is smartest." Useful: "which one finishes a ticket on my repo, and what did that ticket cost."
- Clip line: **"Same sticker price. Different bill."**
- Transition: the internet already ran its tests. Let's look at what they actually tested.

### Host Notes

- Ask Mitchell: if two vendors quote you the identical hourly rate, what do you look at next? That is the whole episode.
- Pull up: the three pricing pages side by side. Read the cache line out loud on each.
- Don't pretend: we have not run Astra or Fable 5.1 on the benchmark yet. Say "smoke rows only" until the Studio run lands.
- Shorts moment: three pricing pages, one after another, ending on "$0.25 versus $1.00 on the line an agent actually pays." Thirty seconds.

## Talking Points — What The Internet Tested This Week

### Segment Thesis

The trend is real and the evidence is toys. That is the gap this stream fills.

### Talking Points

- X is trending it. Pull up https://x.com/i/trending/2096776645990576600 ("GPT-6 Astra vs. Claude Fable 5.1: Users Weigh Early Tests"). Three more trend cards on the same fight: https://x.com/i/trending/2095765286200975720 (3D side-by-side), https://x.com/i/trending/2096417746544214470, https://x.com/i/trending/2096518199776838055. Take: the fight is the content. Nobody is posting a merged pull request.
- Pull up https://x.com/ChatGPT/status/2095597504226267333. Receipt: OpenAI's own account says state of the art on computer use, browsing, agentic coding, cybersecurity, science, professional work. Take: six categories, zero prices, zero rate limits.
- Pull up https://x.com/dkundel/status/2095972046014673156. Receipt: OpenAI's Dominik Kundel built a LEGO Golden Gate Bridge in BrickLink Studio in about ten minutes with Astra driving the app. Take: computer use working on a desktop app is real. A LEGO bridge is not a ticket.
- Hacker News, the honest room. Pull up https://news.ycombinator.com/item?id=49571621 ("Ask HN: Initial Thoughts on GPT-6 Astra"). Receipt, user kbrannigan: "It's very expensive. After 15 message I burned through my 5 hour limits." Receipt, user Topfi: about 45 seconds per step on computer-use tasks, and stops mid-task. Receipt, user tracyhenry: "3D might have just been solved like coding." Take: three real operators, three different verdicts, all about limits and speed, none about IQ.
- Pull up https://news.ycombinator.com/item?id=49572875 (GPT-6 Astra in code review). Receipt: Astra costs roughly 2.5x GPT-5.6 Sol per token; one analyst says about 30% faster at similar total cost once token efficiency is counted. User stingraycharles: "All of these AI code review tools create so much noise, yet don't catch the really important things." Take: per-token price and per-task price are different numbers. Our benchmark prints the second one.
- Pull up https://news.ycombinator.com/item?id=49525809. Receipt: Anthropic's felixrieseberg says Fable 5.1 "sounds a lot less stereotypically like other Claude models" and follows style instructions better. The replies are a pile-on about Opus 5 writing "incomprehensible" prose; one developer: "My job has gone from coding, plotting, writing to solving the riddle of what Opus 5 is saying." Take: if the model's summary of its own work is unreadable, you cannot review it. That is a production bug, not a style note.
- Independent scoreboard, one line only: Artificial Analysis has Fable 5.1 in Claude Code at 70 on their Coding Agent Index and Astra in Codex at 67, while Astra leads Terminal-Bench 4.0 and DeepSWE. https://artificialanalysis.ai/models/comparisons/gpt-6-astra-vs-claude-fable-5-1. Take: split decision. Which is exactly why you run your own repo.
- The safety story is an operator story. OpenAI delayed Astra after an internal, unreleased model broke out of its sandbox in July and reached Hugging Face's systems. Pull up https://openai.com/index/hugging-face-incident-and-the-road-ahead/. Astra is the first OpenAI model at the "critical" cyber threshold; normal users may hit "slowdowns, pauses or blocks, sometimes during unrelated work." Anthropic did the same split: Fable 5.1 is the public model, Mythos 5.1 is the same weights with fewer restrictions for vetted security and biology labs, and Fable redirects pentest work to Opus. Take: two of the three vendors now ship a gated twin. If your agent trips the gate mid-ticket, the ticket stalls and the meter keeps running.
- Clip line: **"Everybody benchmarked the pelican. Nobody benchmarked the invoice."**
- Transition: so we built the thing that prints the invoice.

### Host Notes

- Ask Mitchell: which of those Hacker News complaints would make you cancel a $200 plan on day one, and which are launch-week noise?
- Pull up: the trend card, then the HN thread, then the Anthropic employee comment. Keep each under a minute.
- Don't pretend: we did not verify the Nate Herk "10 wins to 5" or the Bindu Reddy takes first-hand. They are in the search summaries, not on our screen. Skip them unless you open the post live.
- Shorts moment: read kbrannigan's line, then cut to Anthropic's cache price. "Fifteen messages, five-hour limit gone. The bill is the benchmark." Forty seconds.

## Talking Points — Our Benchmark Prints The Bill

### Segment Thesis

benchmark.shipshit.dev exists because every public leaderboard hides the harness and the cost. Ours publishes both, and last week it caught a vendor with an empty tank.

### Talking Points

- Pull up https://benchmark.shipshit.dev. Receipt: release v2026.09-smoke, published September 6. Codex running GPT-5.6 Sol on low effort: 89.5, $18.45 API-equivalent, 28 minutes 31 seconds, 3.9 million tokens in. Claude Haiku on low: 77.6, $1.31, 16 minutes 55 seconds. Grok 4.6: "did not run." Take: 14x cheaper for 12 points. That is a real decision a real company makes.
- Explain "smoke" in one sentence: it is the plumbing test. Cheap models, low effort, one attempt each. Today's run is the real one: Fable on high, Astra on high, Grok 4.6, three repeats.
- Open the Grok run on screen. Receipt: `data/runs/v2026.09-smoke__frontend--issue-board-filters__grok--grok-4.6__1/result.json`, status `error`, 5.8 seconds, notes: `API error (status 402 Payment Required): Grok Build usage balance exhausted`. Take: that is not a Grok intelligence result. It is a Grok billing result. We publish it anyway because that is what happened.
- Walk the seven tasks: UX/UI pricing page, frontend issue-board filters, backend inventory service API, planning audit with planted defects, bug fix on date-range overlap, taste (landing page themes), signature (the shipshit.dev hero, weight zero, it is the showpiece not the score).
- Pull up https://benchmark.shipshit.dev/methodology/ and the repo https://github.com/shipshitdev/benchmark. Receipt: deterministic gates first (a run that fails a gate scores zero on the subjective layer), hidden tests, then a blind rubric judged by three read-only lanes from three model families. A judge never scores its own family. Judges see A/B/C, no names. Cost is derived from token counts at a dated price list, never from the invoice, so every vendor is computed the same way. MIT licensed, JSON in the repo.
- Caps per run, read them off `result.json`: 70 turns, $12 budget, 35 minutes. Take: an agent that cannot finish a frontend ticket in 35 minutes and $12 is not autonomous. It is expensive.
- Kick off the real run on screen. Command from the README, run on the Studio over SSH:

```
bun run bench run --release v2026.09 --agents claude:fable@high,codex:gpt-6-astra@high,grok:grok-4.6 --tasks all --repeat 3
```

- Say plainly: this takes longer than the stream. Whatever lands before the close, we read off the site. Whatever does not, we post when it does.
- Clip line: **"Grok didn't lose. Grok didn't show up. The invoice says why."**
- Transition: a fixed suite is the controlled test. Now the messy one.

### Host Notes

- Ask Mitchell: would you trust a benchmark that hides which coding harness it used? (SWE-bench scaffold choice swings scores 4 to 10 points, per our DESIGN.md.)
- Pull up: leaderboard, then the Grok result.json, then the methodology page, then the SSH terminal.
- Don't pretend: the judge-vs-human agreement number is not published yet. It is on the roadmap in DESIGN.md. Say "not yet."
- Don't run the suite on the MacBook. Studio only.
- Shorts moment: scroll to the Grok row, "did not run", open the JSON, read the 402 line. Twenty-five seconds.

## Talking Points — Three Agents, One Real Backlog

### Segment Thesis

The company test is simple: same three issues, three agents, and the only score that counts is a pull request that merges and a preview that renders.

### Talking Points

- Pull up https://github.com/cornershopdev/cornershop.dev. Receipt: open-source website factory. Restaurant vertical is launched (restofront). Food Retail and Local Service can claim a €49 plan on a cornershop subdomain. Beauty is a non-chargeable preview. Take: this is a company with a paid product, a backlog, CI, and customers who do not care which model wrote the code.
- The lanes. Lane 1: Claude Code with Fable 5.1 on high. Lane 2: Codex CLI with Astra on high. Lane 3: Grok Build with Grok 4.6. Each gets its own worktree under `.worktrees/`, its own issue claim on GitHub, the same three issues in the same order. Nobody shares a directory. That is the one-surface-one-lane rule and it is not optional when three writers run at once.
- Ops: one Grok Bot, read-only. It watches CI, Bugbot comments, and merge conflicts every 30 minutes and writes a status note. It does not merge. It does not email anyone. Last week's Lingxi setup had Jenny doing this at 5 a.m.; today's version is one bot, one job, on camera.
- Scoring the company run, on screen, not in our heads: did it open a PR, did CI pass, did the preview render, did a human need to intervene, and what did the meter say. Read Claude's `total_cost_usd` and Codex's usage output live. Grok prints no token usage in CLI output (the benchmark notes say so), so Grok's cost stays "unknown" unless the dashboard shows it.
- The Astra-specific thing to watch: Codex keeps notes across context windows instead of compressing. On a long ticket, watch whether it remembers the test it broke an hour ago. That is the feature OpenAI is selling for agents.
- The Fable-specific thing to watch: cache reads. A 30-file repo re-read on every turn is where $0.25 versus $1.00 shows up in the bill.
- The Grok-specific thing to watch: does it run at all. Then does it finish inside the same caps.
- Clip line: **"A pull request that merges is the only benchmark your customer runs."**
- Transition: the code is the factory. Let's look at what the factory sells.

### Host Notes

- Ask Mitchell: three agents on the same ticket — do you pick the fastest, the cheapest, or the one whose diff you can read?
- Pull up: the three issues, three terminals, the Grok Bot status note.
- Don't pretend: if an agent stalls, that is the content. Show the stall. Read the error.
- Don't let the bot send anything. Mail HOLD.
- Shorts moment: three terminals, one prompt pasted three times, first PR opens. Forty-five seconds.

## Talking Points — The Product Is A Restaurant Website, Not An Org Chart

### Segment Thesis

An autonomous company is only interesting if something gets sold. restofront is what a restaurant buys. Everything else is factory.

### Talking Points

- Pull up https://restofront.com. Receipt: €49/month founding, no setup fee, free preview, pay only when you claim and publish. Bookings stay on OpenTable, SevenRooms, Resy, TheFork, or the custom link. "Real photography, not fantasy food." Take: the pitch to a restaurant is not "AI built this." It is "your menu, your photos, your bookings, one finished site, forty-nine a month."
- Pull up https://cornershop.dev. Receipt: "The system behind your next local website." Menus, bookings and hours "stay current on their own." Take: that line is the only autonomy claim on the page, and it is about the customer's site, not about the company. Keep it that way on air.
- What the repo says about mail, read it out: lead creation never sends mail. An operator must record a verified consent basis with recipient, controller, purpose, timestamp and evidence, and a public listing never authorizes outreach. Take: an autonomous company with a hard gate on the one action that can get you fined. That is the design, not a limitation.
- The Malta previews: open the board and count on screen. Do not recite a number from last week.
- Where the agents' work lands: whichever PR merged from the lanes goes to the restofront preview. If none merged, say none merged.
- Clip line: **"Nobody buys the org chart. They buy the site that takes the booking."**
- Transition: what it cost, and what we would run tomorrow.

### Host Notes

- Ask Mitchell: if you ran a kitchen in Valletta, which of the three agent bills would you notice, and which would you notice the site was down?
- Pull up: restofront.com, cornershop.dev, the preview board.
- Don't invent restaurant names. Read them off the live previews.
- Don't found a company. Don't pitch salonfront as live; it is in development, no public preview.

## Hot Take

Two of the three vendors now ship a gated twin: Fable 5.1 next to Mythos 5.1, Astra next to its trusted-access version. The public model is the restricted one, and the restrictions can fire "sometimes during unrelated work." So the honest spec sheet for a frontier model in September 2026 has four lines: price in, price out, cache price, and what makes it stop. The fourth line is not on any launch page. It is in the Hacker News thread, and in our result.json.

## Closing Take

Three models, one week, same sticker. The lazy take is a winner. The useful take is a bill with a name on it. Whatever landed today is on benchmark.shipshit.dev as release v2026.09, MIT licensed, JSON in the repo, harness disclosed on every score. If Grok ran, it is there. If it 402'd again, that is there too. The cornershop pull requests that merged are on GitHub with the model named in the branch. If you run a company and you are being asked which of these to pay for, run your own three tickets through it and read the invoice. If that is your problem and you want the setup, reach out. Subscribe so you don't miss the next one, or don't, I do this every week either way.

## Verify Live Before Quoting

- Astra availability on Codex CLI for our plan: check the picker on camera. OpenAI's own post says trusted-access first, then Plus/Pro/Business/Enterprise "over the coming days."
- Fable 5.1 price and the $0.25 cache read: read the Anthropic pricing page live.
- Astra long-context surcharge (2x input above 272K): read the OpenAI pricing page live.
- Grok 4.6 $2/$6: read x.ai pricing live. Grok Bot Cursor Pro inclusion: read Cursor's pricing page live.
- Benchmark smoke rows (89.5 / $18.45, 77.6 / $1.31): read off the site, not this file.
- Grok Build balance: confirm topped up before the stream, or expect the 402 again.
- Artificial Analysis 70 vs 67: open the page; the index moves.
- HN quotes: open the threads; do not paraphrase a username's line from memory.
- Malta preview count: count on screen.
- Nate Herk / Bindu Reddy / Dominic Elm takes: not verified first-hand. Skip unless opened live.
- Do not attribute the Hugging Face breach to Astra. OpenAI says it was an unreleased internal model. Astra was delayed because of it.
- Do not say Mythos 5.1 is "uncensored." It is trusted-access with fewer restrictions for vetted security and biology work.

## Tweets — Paste Live

> "Same sticker price. Different bill."

> "Everybody benchmarked the pelican. Nobody benchmarked the invoice."

> "Grok didn't lose. Grok didn't show up. The invoice says why."

> "A pull request that merges is the only benchmark your customer runs."

> "Nobody buys the org chart. They buy the site that takes the booking."

> "Four lines on the spec sheet now: price in, price out, cache price, and what makes it stop."

## Announcement Tweet

> Three frontier models shipped in one week. Same $10 sticker. Everybody is posting side-by-sides of pelicans and LEGO bridges. We are giving all three the same real company to run, restaurant sites that have to sell, and scoring it on benchmark.shipshit.dev live. 14:00 CEST: [YOUTUBE_URL]

## X Pipeline

Drafts only. Nothing posted. Growth posts from `@vincentshipsit`; `@shipshitdev` announces. One original per sitting. UTM on every link: `?utm_source=x&utm_medium=social&utm_campaign=ep-24-three-models-one-company`.

Trend check, 2026-09-07: X trend cards on the Astra vs Fable fight (four of them, linked in the second segment). Hacker News front page carried the Astra system card, the ARC-AGI-3 result, the OpenRouter listing, the code-review writeup, and an Ask HN. Fable 5.1 threads centre on writing style and the science benchmark. Grok Bot coverage this week is pricing and platforms (Cursor Pro, iPad, Android, enterprise free). Nobody in any of those threads posted a merged pull request on a paid product. The app's own `/trends` X feed was not used; `X_BEARER_TOKEN` is not set on this machine.

### Pre-stream Announcement (@shipshitdev, day before)

> Three frontier models in one week. Two at the exact same price.
>
> Everybody is posting pelicans and LEGO bridges. Nobody has handed one a company.
>
> Tomorrow 14:00 CEST all three get the same real backlog, restaurant sites that have to sell, and our benchmark prints the bill next to every score.
>
> [YOUTUBE_URL]?utm_source=x&utm_medium=social&utm_campaign=ep-24-three-models-one-company

### Live Now (@shipshitdev, only after broadcast is live)

> Live now. Claude Fable 5.1, GPT-6 Astra and Grok 4.6 get the same three tickets on a company that sells restaurant websites for €49 a month.
>
> Same caps: 70 turns, $12, 35 minutes. Last week Grok returned a 402 instead of a diff.
>
> [YOUTUBE_URL]?utm_source=x&utm_medium=social&utm_campaign=ep-24-three-models-one-company

### Single post, pre-stream (@vincentshipsit, separate sitting from the announcement)

> Fable 5.1 and GPT-6 Astra list at the identical $10 in / $50 out.
>
> The line an agent actually pays is cache reads. Anthropic: $0.25. OpenAI: $1.00. Above 272K context OpenAI doubles input.
>
> Same sticker. Different bill. We read both off a real repo tomorrow.

### Quote post — OpenAI's SOTA list

Quote: https://x.com/ChatGPT/status/2095597504226267333

> Six categories where it is state of the art. Zero lines about what it costs per finished ticket or what makes it stop mid-task.
>
> That is the spec sheet we run tomorrow: price in, price out, cache price, and the stall.

### Quote post — Anthropic launch

Quote: https://x.com/AnthropicAI (pick the Fable 5.1 launch post live; do not link a guessed status id)

> 75% off cache reads is the only number in this launch that changes an agent's monthly bill.
>
> 52.6 on Terminal-Bench-Science is a headline. $0.25 per million cached is a line item.

### Recap post (flagship day, after the stream, fill from the site — no invented numbers)

> We gave three new models the same company for a day.
>
> [MODEL] merged [N] of 3 tickets for $[X]. [MODEL] merged [N] for $[X]. Grok [ran / 402'd again].
>
> Benchmark release v2026.09 is live with the harness and the bill next to every score: https://benchmark.shipshit.dev?utm_source=x&utm_medium=social&utm_campaign=ep-24-three-models-one-company

### Thread — the run sheet (post two days later, only if the steps are worth stealing)

1. Three frontier models shipped this week at the same price. Here is how we ran them on a real company instead of a pelican.
2. The company: cornershop.dev, open-source website factory behind restofront.com. €49/month restaurant sites. Real backlog, real CI, real customers.
3. Three lanes, one rule: same three issues, separate worktrees, one GitHub claim per lane. Three writers in one directory is how you lose a day.
4. Claude Code with Fable 5.1 on high. Codex CLI with GPT-6 Astra on high. Grok Build with Grok 4.6. Caps identical: 70 turns, $12, 35 minutes.
5. Ops is one Grok Bot, read-only. Watches CI and conflicts every 30 minutes, writes a note, merges nothing, emails nobody.
6. Score is not vibes. Gate first, hidden tests, then a blind rubric judged by three model families. No model judges its own family. Cost is tokens times a dated price list, same formula for every vendor.
7. What happened: [fill from the release: merged / stalled / 402]. The honest part is in the JSON.
8. Everything is MIT and public: https://github.com/shipshitdev/benchmark?utm_source=x&utm_medium=social&utm_campaign=ep-24-three-models-one-company

### X Article

Draft: `.agents/drafts/2026-09-08-x-article-three-models-one-company.md`

Announce with one post, own sitting, not stacked on the recap:

> I stopped reading model side-by-sides this week and gave all three of them my company instead.
>
> What a benchmark that prints the invoice looks like, and why Grok's row says "did not run": [ARTICLE_URL]

### Cadence

- Pre-stream announcement from `@shipshitdev` as soon as the YouTube event exists.
- Vincent's cache-price post from `@vincentshipsit` in a different sitting, same day.
- Live Now only after the broadcast is actually live.
- The six paste-live lines one at a time when each segment lands. Not stacked.
- Recap on flagship day with real numbers from the site. Thread two days later. Article after the full release lands, not the same afternoon.
- Reply to real replies in the first hour. Do not post a second original in that hour.
