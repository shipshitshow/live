---
title: "[LIVE] Stop Selling Seats. Take A Cut Of The Savings."
slug: "output-first-pricing"
source: "Vincent's output-first article, Anthropic launch post, OpenAI launch post, DataCamp head-to-head, Artificial Analysis, Hacker News, benchmark.shipshit.dev, github.com/cornershopdev/cornershop.dev"
status: "draft"
date: "2026-09-08"
announcement_tweet: "Claude Fable 5.1 and GPT-6 Astra both cost $10 in / $50 out. Same price, scores inside scaffold noise. When the best intelligence costs everyone the same, you cannot sell access to it any more. So we stopped selling subscriptions and started taking a cut of the savings. The deal, the risk, and the proof: 14:00 CEST [YOUTUBE_URL]"
thumbnail_prompt: null
---

## Sources — Livestream Notes

- Title placeholder: **[LIVE] Stop Selling Seats. Take A Cut Of The Savings.** Vincent picks from `title-options.md`.
- Episode: **24**. UTM campaign: `ep-24-output-first-pricing`.
- Start: **14:00 CEST (UTC+2)** — confirm. Format: 60–90 minutes, English only.
- **Spine, locked with Vincent:** the two model launches are the setup, not the subject. Both frontier models now cost the same and score inside noise of each other, so access to intelligence has stopped being a differentiator. The episode is what you sell instead: output, and a share of the savings.
- This puts the episode back inside the format rule. The model news is a contained reaction that sets up the thesis. It is not the spine and it is not the title.
- Source article: Vincent's output-first piece, saved to `.agents/drafts/2026-09-08-article-output-first-pricing.md`. The X and LinkedIn cuts live in `## X Pipeline` and `## LinkedIn Pipeline` in this file.
- Three acts. Act 1: the input is a commodity, two capsules. Act 2: the deal, two capsules. Act 3: the proof, two capsules. Hard reset on camera between acts so each half cuts as a standalone video.
- YouTube livestream: create the event, paste the URL here. `[YOUTUBE_URL]` is a placeholder everywhere in this file.
- Restream studio: https://studio.restream.io/eue-pcqd-vbw
- Demo machine: **MacBook Pro** on camera. Benchmark suite runs on the **Mac Studio** (`ssh mac-studio-2022`) per benchmark DESIGN.md and the global verification-host rule. Never run the suite on the MBP.
- Hard rule: **do not name the client.** The engagement in the article is anonymous and stays anonymous. Say the shape of the deal, never the logo.
- Hard rule: **be exact about tense.** See `## Verify Live Before Quoting`. Whether this is a closed engagement, a live pilot, or the offer we are taking to market is the one thing the audience will judge us on.
- Hard rule: **Mail HOLD.** No outreach on stream.
- Hard rule: **no invented numbers.** Vendor benchmarks get read off the vendor page live. Our numbers come off benchmark.shipshit.dev after the run, or they are "not in yet".
- Pre-show: top up the **Grok Build balance** (last run returned a 402). Confirm Codex CLI exposes GPT-6 Astra and `claude --model fable` resolves to Fable 5.1.
- Pre-show: pick **three open issues** from the 11 open on cornershop.dev, one frontend, one backend, one bug.
- Product: https://cornershop.dev — repo https://github.com/cornershopdev/cornershop.dev — live brand https://restofront.com (€49/month founding)
- Benchmark: https://benchmark.shipshit.dev — repo https://github.com/shipshitdev/benchmark — methodology https://benchmark.shipshit.dev/methodology/
- Anthropic launch post: https://www.anthropic.com/claude-fable-and-mythos-5-1
- OpenAI launch post: https://openai.com/index/gpt-6-astra/
- Third-party head-to-head (map only, verify every row): https://www.datacamp.com/blog/gpt-6-astra-vs-claude-fable-5-1
- Artificial Analysis comparison: https://artificialanalysis.ai/models/comparisons/gpt-6-astra-vs-claude-fable-5-1
- Thumbnail: not written. Invoke the `thumbnails` skill (livestream style, episode 24, two hosts, no title text).

## YouTube Description — Paste This

Two frontier AI models shipped three days apart at the exact same price. Ten dollars per million words in, fifty out, both of them. Their benchmark tables barely overlap, and where they do the gap is about two points, which is inside the margin you get from a better setup.

That is the whole story, and almost nobody drew the conclusion: if the best intelligence available costs everyone the same, then having it is not a business. Selling access to it is not a business either.

So we changed how we charge. No seats. No subscription as the product. We take the old cost of a process, we change how the work gets done, and when the savings hold we take a share of the difference. Around fifteen percent of the performance, no management fee. We only get paid when the number moves.

This episode is that argument, the deal mechanics, the risk we are taking on, and the proof: cornershop.dev went from an empty folder on 18 July to a paid product in fifty days on 136 merged changes, and our own benchmark measures what a finished task actually costs.

Sources:
https://www.anthropic.com/claude-fable-and-mythos-5-1
https://openai.com/index/gpt-6-astra/
https://benchmark.shipshit.dev
https://github.com/cornershopdev/cornershop.dev
https://restofront.com

Subscribe so you don't miss the next build.
Follow us: https://x.com/shipshitdev

#AIpricing #outcomepricing

## Cold Open — Read This

> "Two new AI models landed this week, three days apart, and they cost exactly the same. Ten dollars in, fifty out, both of them. Pull up the benchmark tables and they barely overlap, and where they do the gap is two points, which is what a better setup buys you anyway. Everybody spent the weekend arguing about which one won. Nobody said the obvious thing. If the best intelligence on earth is the same price for you, for me, and for the company you are pitching against, then having it is not a business. Selling access to it definitely is not a business. So we stopped. No seats, no subscription, no billable hours with a chatbot bolted on. We take the old cost of a process, we change how the work gets done, and when the savings stick we take about fifteen percent of the difference. Zero management fee. We eat the risk. Today: why that is now the only honest way to sell this, what it costs us when a model stalls, and the proof that we can actually deliver it. Let's go."

## Summary

The thesis is a pricing argument, and the week supplied the receipt for it. Claude Fable 5.1 and GPT-6 Astra both list at $10 per million in and $50 out; their published benchmark tables share only a handful of rows, and on those the gap is roughly two points, which our own design notes put inside the swing you get from scaffold choice alone. When the input is that commoditised, nobody can sell "we use the best AI" and nobody can defend a margin on access. Act 2 is the alternative: baseline the old cost of a process, get data access, change how the work is done, and take roughly 15% of the verified savings with no management fee, which moves the risk from the buyer to us. That risk is real and now includes model behaviour: both vendors ship a gated public model, and OpenAI's own launch post warns of pauses "sometimes during unrelated work". Act 2 also covers the engineering discipline that makes savings survive: one unbroken chain from context to data to output to result to productivity, and deterministic software written by experts with AI rather than task-agents that improvise the same job daily and drift. Act 3 is proof of delivery: cornershop.dev, created 18 July, 211 commits and 136 merged pull requests in 50 days from one human, selling restaurant sites at €49/month through restofront.com — including the honest question of whether that subscription contradicts the thesis. Then benchmark.shipshit.dev, because you cannot invoice a saving you cannot measure.

## Talking Points — Act 1, The Intelligence Just Became A Commodity

### Segment Thesis

Two vendors landed on the same price in the same week with scores inside noise of each other. That is the definition of a commodity input, and it changes what you are allowed to charge for.

### Talking Points

- Names once, properly. Claude Fable 5.1, Anthropic's new model, 1 September. GPT-6 Astra, OpenAI's new model, 3 September to trusted partners and 4 September to paid plans. After this: Fable and Astra.
- Both pricing pages on screen together. Receipt: $10 per million tokens in, $50 out. Identical, to the cent, three days apart. Take: two competitors converging on the same number in the same week is not a coincidence, it is a market telling you the product has no pricing power left.
- Now the tables, and this is the part almost nobody did. Anthropic published Terminal-Bench 4.0, Terminal-Bench-Science, CursorBench, SWE-bench Pro, Humanity's Last Exam. OpenAI published DeepSWE, FrontierMath, ARC-AGI-3, OSWorld V2-Offline, ExploitBench. Take: two exam papers with a handful of shared questions. Each vendor wrote its own test and graded its own paper.
- Where they do overlap it is close. Terminal-Bench 4.0: Astra about 57.7, Fable 55.8. FrontierCode: 53.3 to 50.9. Take: two points. Our own DESIGN.md notes SWE-bench scores swing four to ten points on scaffold choice alone. Two points is not a winner, it is a better setup.
- Where the gaps are real they cut both ways: Terminal-Bench-Science 64.6 to 52.6 for Astra, DeepSWE 74.1 to 67.4 for Astra, and Humanity's Last Exam with tools 65.0 to 57.2 for Fable. Take: split decision. Anyone declaring a winner this week is selling something.
- The independent index does not settle it either. One Artificial Analysis view had them tied; the coding index has Fable inside Claude Code at 70 and Astra inside Codex at 67, which is two models plus two harnesses, not two models.
- Where they genuinely differ is the meter, not the mind. Cache reads: Anthropic $0.25, OpenAI $1.00, and $2.00 above 272K of context. Then the reversal: a third-party test measured cost per finished task at $1.67 for Astra and $3.76 for Fable. Take: cheaper per token, dearer per job. Say clearly that is DataCamp's measurement on their tasks, not ours.
- Land the act: for a buyer, all of that nets out to "both are excellent and both cost the same." Which means the model you picked is not a reason to hire you.
- Clip line: **"Two vendors, two exams, and everybody graded their own paper."**
- Clip line: **"When the best intelligence costs everyone the same, having it is not a business."**
- Transition: so if the model is not the product, what exactly is everyone charging for?

### Host Notes

- Ask Mitchell: if two suppliers quote the identical day rate and both pass your test, what are you actually choosing between?
- Pull up: both pricing pages, both benchmark tables, the shared rows, then the cost-per-task row.
- Don't pretend: attribute the $1.67 vs $3.76 to DataCamp every single time. Read vendor numbers off vendor pages on camera.
- Shorts moment: two pricing pages, identical sticker, then the two benchmark tables with the shared rows highlighted. "That is everything they both agreed to be tested on." Forty seconds.

## Talking Points — Act 1, The Subscription Is The Wrapper Now

### Segment Thesis

Every vendor in the room is selling the same commoditised input with a different wrapper around it, and the wrapper is where the margin is hiding.

### Talking Points

- Name the pitches the buyer is actually getting, in their words: seats, subscriptions, agent workflows, billable hours. Process stacked on process, and a promise the profit line moves later.
- Tool is wrapper, said plainly: the subscription is not the job. It is the packaging around a job that a commodity model now does. Take: when the thing inside the box costs your competitor the same as it costs you, the box is the only thing you are selling, and boxes get cheap.
- The uncomfortable version, and say it about our own industry: most AI offers today are a seat tax with a chatbot wrapped around it. Nobody in the room can point at the profit line and say the money moved.
- The buyer's real problem is never "we need AI." It is "this process is expensive and nobody can tell me exactly where the money goes." Take: that is an accounting problem before it is a model problem, and it is why the demo never closes.
- Why demos do not close, in one line: a demo proves the tool works. It does not prove the cost went away. Nobody signs a cheque for a capability, they sign for a number that moved.
- Lazy take vs useful take, straight from the article. Lazy: more software, more agents, more hours. Useful: share the performance check when the savings stick.
- Clip line: **"A seat tax with a chatbot wrapped around it."**
- Clip line: **"Nobody buys a capability. They buy a number that moved."**
- Transition: so we stopped quoting subscriptions. Here is the contract we ask for instead.

### Host Notes

- Ask Mitchell: from the agency side, how many AI proposals has he seen that could name the cost being removed? Let him answer honestly, even if it is zero.
- Pull up: nothing. This capsule is two people talking. Keep it under ten minutes and keep it concrete.
- Don't pretend: we sell software too. Acknowledge cornershop charges a subscription and promise to deal with it in Act 3 rather than dodging it now.
- Shorts moment: the four pitches a buyer gets, then "not one of them names the cost being removed." Thirty seconds.

## Talking Points — Act 2, The Performance Check

### Segment Thesis

Three asks replace the subscription: the old cost of the process, access to the data, and a contract that only pays when the number moves.

### Talking Points

- The deal, said slowly enough to be clipped. One: what did this process cost before AI. Two: access to the data. Three: a contract that pays us only when the spend drops and the result holds. When it does, we take a share of the difference and they keep the rest.
- The commercial shape: roughly **fifteen percent of the verified performance, zero management fee.** Take: no retainer means no income until the saving is real. That is the whole point, and it is why the conversation changes.
- What that does to the sales call: the client stops being pitched and starts pitching us, because the only remaining question is whether we will put our own money on their savings line. Take: it is the fastest qualification tool we have found. Anyone unwilling to share the upside was never going to sign anyway.
- They are not buying our stack. They are buying the output and the effect on the profit line. Which model sits underneath is our problem, not theirs. Take: that sentence is only sayable because Act 1 is true. Two years ago the model choice was the product.
- Now the risk, and be honest about it because we are the ones holding it. Under a savings-share contract, every stall is our loss. Both vendors now ship a gated public model: Fable blocks exploit development and redirects to Opus, and OpenAI's launch post says users outside trusted programs may see "slowdowns, pauses or blocks, sometimes during unrelated work." Take: on a subscription that is the client's annoyance. On a performance contract it is our margin.
- The mundane risk is the same shape: on Hacker News one developer burned a five-hour limit in fifteen messages, another measured about 45 seconds per step on computer use with stops mid-task. Take: rate limits are a cost of goods sold now. Price them in or eat them.
- So the fourth line on the spec sheet is a commercial line, not a technical one: price in, price out, cache price, and what makes it stop. Only three are on the launch page.
- What we refuse to sign: a deal where we cannot see the baseline, or cannot access the data, or where "savings" is measured by the same people whose budget it came from. Take: no baseline, no contract. That is not caution, it is arithmetic.
- Clip line: **"No management fee. We only get paid when the number moves."**
- Clip line: **"On a subscription, a stalled model is the client's annoyance. On our contract, it's our margin."**
- Transition: none of that survives contact with production unless one chain holds.

### Host Notes

- Ask Mitchell: as an agency owner, would he sign a contract with no retainer and fifteen percent of a number he has to help prove? Push him. His objection is the audience's objection.
- Pull up: the launch post's stopping clause, then the two Hacker News complaints. Keep it to two minutes; this is the risk section, not a rerun of the comparison.
- Don't pretend: be exact about whether this is signed, piloted, or offered. See the verify section. Never name the client.
- Shorts moment: the three asks, then "fifteen percent, zero management fee." Forty seconds.

## Talking Points — Act 2, The Chain That Has To Hold

### Segment Thesis

The hard part was never picking the best model. It is holding one chain together: context, data, output, result, productivity. Miss a link and you are optimising demos.

### Talking Points

- Walk the chain out loud, one link at a time, and make Mitchell name where his clients break it. Context, then data, then output, then result, then productivity. Take: every failed AI project we have seen dies at a link, not at the model.
- Miss a link and you get a faster version of a process that should not exist. Hit all of them and you can remove a legacy cost that never even sat under the right budget line, reallocate it, and turn a cut into growth. Take: that last move is the one that gets you back in the room next year. Pure cost-cutting gets you thanked once.
- The part that will annoy the AI crowd: we do not rent clients task-agents that improvise the same job every day. Those drift. Prototypes die in production when a nondeterministic token sits where a fixed path belonged. Take: if the job is the same every morning, it deserves code, not a model rolling dice on it.
- What we do instead: give their experts AI so they ship deterministic software that automates the craft. Take: you are not speeding up the old process, you are changing what the firm produces. That is the difference between a saving that holds and a saving that evaporates in month four.
- Tie it to the contract: this is not engineering taste, it is commercial self-defence. A drifting agent is a saving that reverses, and a saving that reverses is an invoice we do not get to send.
- Tie it back to Act 1: this is also why the model choice stopped mattering. The determinism lives in the software the experts ship, not in the model. Swap the model underneath and the savings survive.
- Clip line: **"Prototypes die in production when nondeterministic tokens sit where you needed a fixed path."**
- Clip line: **"If the job is the same every morning, it deserves code, not dice."**
- Transition: fine. Can we actually build software that fast? Here are the receipts.

### Host Notes

- Ask Mitchell: which link do his clients break most, context or data? Bet on data access.
- Pull up: nothing, or a single drawn chain on screen. Resist the urge to demo here.
- Don't pretend: we have shipped agents that drifted too. Name one if it makes the point honest.
- Shorts moment: the five links, then "miss one and you are optimising demos." Thirty seconds.

## Talking Points — Act 3, Fifty Days, One Human, 136 Merged

### Segment Thesis

A savings-share contract is a promise to deliver software fast enough to matter. Here is the public commit log that says we can.

### Talking Points

- Hard act break. Say it: the argument is done, now the receipts.
- Pull up https://github.com/cornershopdev/cornershop.dev and read it off the page live. Receipt: first commit **18 July 2026**, "Initial commit from Create Next App". Last push 6 September. **211 commits. 136 merged pull requests, 130 from one person, 6 from the dependency bot. 52 closed issues, 11 open.** Take: fifty days from an empty folder to a product with billing, custom domains, monitoring and a lead inbox. About three merged changes a day, one human directing AI.
- Second receipt, same week: https://github.com/shipshitdev/benchmark was created **6 September** and the entire benchmark — harness, adapters, scoring, website — is 24 commits from that single day. Take: that is the delivery speed the contract is underwritten by. Check the timestamps yourself.
- Pull up https://cornershop.dev. Receipt: four verticals and they are not equal. Restaurants launched and sell; food retail and local service can claim a plan on a subdomain; beauty is a non-chargeable preview with no billing. The page says so. Take: shipping means publishing the table honestly. Most AI-built products fake it.
- The guardrail that matters commercially: lead creation **never** sends mail. An operator must record a verified consent basis with recipient, controller, purpose, timestamp and evidence first, and a public listing authorizes nothing. Take: if you are taking a share of a client's performance, the fastest way to lose it is a fine.
- **Now the honest contradiction, do not dodge it.** Pull up https://restofront.com. Receipt: €49 a month. That is a subscription, and this episode just spent thirty minutes saying stop selling subscriptions. Take: the resolution is that €49 buys an output — a finished, hosted, maintained website — not a seat and not usage. Nobody is billed per login. But it is still not savings-share, and the honest version is that a restaurant site could be priced on bookings recovered instead. Say on air that we have not done that yet.
- Where the two business lines actually sit: cornershop is a product where the output is the thing sold; the performance check is a services contract where the output is a number on someone's profit line. The thesis applies to both, differently. Take: the test is not "is there a recurring charge", it is "is the customer paying for a seat or for a result".
- Clip line: **"Fifty days. One human. A hundred and thirty-six merged changes."**
- Clip line: **"The test isn't whether it recurs. It's whether they're paying for a seat or a result."**
- Transition: and none of this is invoiceable unless we can measure it.

### Host Notes

- Ask Mitchell: does €49 a month for a finished restaurant site break our own rule? Let him argue it. If he wins, say he won.
- Pull up: the repo, cornershop.dev, restofront.com, the benchmark repo creation date.
- Don't pretend: beauty is a preview, salonfront is in development. Neither is a live product.
- Don't invent restaurant names. Read them off the live previews.
- Shorts moment: repo created 18 July, then the merged count, then restofront pricing. Forty-five seconds.

## Talking Points — Act 3, You Cannot Invoice A Saving You Cannot Measure

### Segment Thesis

The benchmark is not a leaderboard hobby. It is the measurement instrument the whole pricing model depends on.

### Talking Points

- Connect it before opening it: our contract pays on a delta between an old cost and a new one. That means we need a defensible way to say what a unit of work costs. That is what this thing is.
- Pull up https://benchmark.shipshit.dev. Receipt: release v2026.09-smoke, 6 September. Codex on the previous model at low effort: 89.5 for $18.45, 28 minutes 31 seconds. Claude Haiku at low: 77.6 for $1.31, 16 minutes 55 seconds. Grok 4.6: did not run. Take: fourteen times cheaper for twelve points. On a savings contract that is not trivia, that is the difference between a margin and a loss.
- The methodology, and note it is the same discipline as the client contract. Pull up https://benchmark.shipshit.dev/methodology/. Receipt: deterministic gates first and failing a gate zeroes the subjective layer; hidden tests; a blind rubric judged by three read-only lanes from three model families where no judge scores its own family and sees only A, B, C. Cost is never the invoice, it is tokens times a dated price list, identical formula per vendor, labelled API-equivalent. Harness disclosed on every score.
- Say the parallel out loud: baseline first, deterministic gates, cost next to the result, and a judge who is not the party being judged. That is the benchmark and it is also the contract. Take: if we would not accept a vendor's self-graded exam, we cannot hand a client a self-graded saving.
- The failure we published. Open the Grok run: status `error`, 5.8 seconds, zero tool calls, note `API error (status 402 Payment Required): Grok Build usage balance exhausted`. Take: a billing result, not an intelligence result, published anyway. A benchmark that hides the vendor who failed to start is a marketing page, and so is a savings report that hides the month it went backwards.
- Kick off the real run on the Studio, on camera:

```
bun run bench run --release v2026.09 --agents claude:fable@high,codex:gpt-6-astra@high,grok:grok-4.6 --tasks all --repeat 3
```

- It outruns the stream. Whatever lands before the close we read off the site; the rest gets posted when it finishes. Do not guess a number to fill a segment.
- The honest gap: judge-versus-human agreement is not published yet, it is on the roadmap in DESIGN.md. Take: say it out loud. We just spent an act demanding baselines from two trillion-dollar companies.
- Clip line: **"Everybody benchmarked the pelican. Nobody benchmarked the invoice."**
- Clip line: **"If we wouldn't accept a self-graded exam, we can't hand a client a self-graded saving."**
- Transition into the close.

### Host Notes

- Ask Mitchell: if we brought him a savings report we produced and scored ourselves, would he sign it?
- Pull up: leaderboard, the Grok result.json, methodology, then the SSH terminal.
- Don't run the suite on the MacBook. Studio only, over SSH, on camera.
- Shorts moment: the Grok row reading "did not run", the JSON, the 402 line. Twenty-five seconds.

## Hot Take

We charge €49 a month for a restaurant website, and we just spent half an episode telling you subscriptions are the wrapper. Both things are defensible, but only one of them is finished thinking. The €49 buys an output, not a seat, so it passes the test as written. The version we have not built yet is the one where a restaurant pays a share of the bookings it recovered instead of a flat monthly fee — because that is the same contract we ask enterprise buyers to sign, and we have not yet asked ourselves to sign it. If output-based pricing is right, it is right for our own product too, and we are one iteration behind our own argument.

## Closing Take

Two of the best models on earth shipped this week at the same price with scores you cannot separate without arguing about scaffolds. That is the end of selling access. It is not the end of selling outcomes, it is the beginning of it. So: ask what the process cost before, ask for the data, and put your fee on the difference. Fifteen percent of a saving you helped prove beats a hundred percent of a retainer nobody can justify. It only works if the chain holds — context, data, output, result, productivity — and if what you leave behind is deterministic software your client's experts own, not an agent that improvises the same job every morning until it drifts. The proof that we can build at that speed is public: cornershop, fifty days, 136 merged changes, one human. The instrument that measures the saving is public too, MIT licensed, at benchmark.shipshit.dev, including the runs that failed. If your process is expensive and nobody can tell you where the money goes, that is the conversation. Reach out. I do this every week.

## Verify Live Before Quoting

- **The engagement, most important item on this list.** Before going live, decide and say precisely which of these it is: a signed and delivered engagement, a live pilot, a signed contract with savings not yet verified, or the offer shape we are taking to market. Use the past tense only for what actually happened. Never name the client, the sector, or a number that could identify them.
- The 15% and "zero management fee" come from Vincent's article. Confirm they are the terms actually offered before saying them as our standard.
- Every vendor benchmark number: read off the vendor page on camera with the date visible. Do not recite this file.
- Terminal-Bench 4.0 for Astra: third-party sources give 57.7 and 57.9. Read OpenAI's page or say "about 57 and change".
- Cost per task $1.67 vs $3.76: DataCamp's measurement on their tasks. Attribute it every time.
- Artificial Analysis index: snapshots disagree. Read the page live and say the date.
- The OSWorld and ScreenSpot rows in the third-party table compare against Opus 5 and a Mythos figure. Do not present them as Astra versus Fable.
- Cache prices and the 272K surcharge: read the pricing pages live.
- cornershop counts (211 commits, 136 merged, 130 by Vincent, 52 closed, 11 open, created 18 July): pulled from the GitHub API on 7 September. Refresh on camera; they move daily.
- Benchmark smoke rows: read off the site, not this file.
- Grok Build balance: confirm topped up, or expect the 402 again.
- Do not attribute the Hugging Face breach to Astra. OpenAI says it was an unreleased internal model; Astra was delayed as a consequence.
- Do not call Mythos 5.1 "uncensored". It is trusted access with fewer restrictions for vetted security and life-science work.
- restofront €49 founding price: read checkout live if you quote it.

## Tweets — Paste Live

> "When the best intelligence costs everyone the same, having it is not a business."

> "Two vendors, two exams, and everybody graded their own paper."

> "A seat tax with a chatbot wrapped around it."

> "Nobody buys a capability. They buy a number that moved."

> "No management fee. We only get paid when the number moves."

> "On a subscription, a stalled model is the client's annoyance. On our contract, it's our margin."

> "Prototypes die in production when nondeterministic tokens sit where you needed a fixed path."

> "If the job is the same every morning, it deserves code, not dice."

> "The test isn't whether it recurs. It's whether they're paying for a seat or a result."

> "Fifty days. One human. A hundred and thirty-six merged changes."

## Announcement Tweet

> Claude Fable 5.1 and GPT-6 Astra both cost $10 in / $50 out. Same price, scores inside scaffold noise. When the best intelligence costs everyone the same, you cannot sell access to it any more. So we stopped selling subscriptions and started taking a cut of the savings. The deal, the risk, and the proof: 14:00 CEST [YOUTUBE_URL]

## X Pipeline

Drafts only. Nothing posted. Growth posts from `@vincentshipsit`; `@shipshitdev` announces. One original per sitting. UTM on every link: `?utm_source=x&utm_medium=social&utm_campaign=ep-24-output-first-pricing`.

Trend check, 2026-09-07: four X trend cards on the Astra versus Fable fight, Hacker News carrying the Astra system card, an Ask HN, a code-review writeup and the ARC-AGI-3 result; Fable threads centred on writing style and the science benchmark. Every one of them argues which model wins. None argues what it does to pricing. That gap is the post. The app's `/trends` X feed was not used; `X_BEARER_TOKEN` is not set on this machine.

### Pre-stream Announcement (@shipshitdev, day before)

> Two frontier models shipped three days apart at the identical price, with scores you cannot separate without arguing about scaffolds.
>
> Everyone asked which one won. Wrong question.
>
> If the best intelligence costs everyone the same, selling access to it is over. Tomorrow 14:00 CEST: what we charge instead, and the contract that pays us only when the savings show up.
>
> [YOUTUBE_URL]?utm_source=x&utm_medium=social&utm_campaign=ep-24-output-first-pricing

### Live Now (@shipshitdev, only after broadcast is live)

> Live now. Why we stopped quoting subscriptions: two models, one price, and a contract that pays us ~15% of the savings with no management fee.
>
> Plus the risk nobody prices in — on an outcome contract, a stalled model is our margin, not the client's annoyance.
>
> [YOUTUBE_URL]?utm_source=x&utm_medium=social&utm_campaign=ep-24-output-first-pricing

### Single post — the thesis (@vincentshipsit, own sitting)

> Fable 5.1 and GPT-6 Astra both cost $10 in / $50 out. Three days apart. Same price to the cent.
>
> Their benchmark tables barely overlap, and where they do it is two points, which a better scaffold buys.
>
> So the model you picked is not a reason to hire you. The number you moved is.

### Single post — the deal (@vincentshipsit, later sitting)

> We stopped quoting subscriptions.
>
> Three asks instead: what the process cost before, access to the data, and a contract that pays only when the spend drops and the result holds.
>
> ~15% of the difference. Zero management fee. We carry the risk.
>
> Clients stopped getting pitched and started pitching us.

### Single post — the determinism take (@vincentshipsit, third sitting)

> Task-agents that improvise the same job every morning drift.
>
> Prototypes die in production when a nondeterministic token sits where a fixed path belonged.
>
> Give the experts AI and let them ship deterministic software instead. You stop speeding up the old process and start changing what the firm produces.

### Quote post — OpenAI's SOTA list

Quote: https://x.com/ChatGPT/status/2095597504226267333

> Six categories where it is state of the art, at the same price as the competitor that shipped three days earlier.
>
> That is not a product announcement, that is a commodity price notice.
>
> Stop selling access to it. Sell the number it moved.

### Recap post (flagship day, fill from the site — no invented numbers)

> Two models at one price is the end of selling access.
>
> Ran both on a real backlog: [MODEL] closed [N] of 3 for $[X], [MODEL] closed [N] for $[X].
>
> The instrument we bill against is public and MIT: https://benchmark.shipshit.dev?utm_source=x&utm_medium=social&utm_campaign=ep-24-output-first-pricing

### X Article

Draft: `.agents/drafts/2026-09-08-article-output-first-pricing.md` (Vincent's piece, edited to the article contract and carrying the new commodity receipt). Announce with one post, own sitting:

> Every AI vendor in the room quotes seats. We quote a share of the savings and nothing else.
>
> Why the two launches this week make that the only honest way left to sell it: [ARTICLE_URL]

### Cadence

- Pre-stream announcement from `@shipshitdev` as soon as the YouTube event exists.
- Vincent's three single posts across three separate sittings, never stacked, thesis first.
- Live Now only once the broadcast is actually live.
- The ten paste-live lines one at a time as each segment lands.
- Recap on flagship day with real numbers. Article announcement once the release is in.
- Reply to real replies in the first hour. No second original in that hour.

## LinkedIn Pipeline

Buyer register per `skills/linkedin-pipeline`: no swearing, no bare version numbers, every technical term translated, outcome first. Posted from personal profiles, never the company page. UTM: `?utm_source=linkedin&utm_medium=social&utm_campaign=ep-24-output-first-pricing`.

The same argument as the X article, rewritten for an operator who does not follow AI news. This is the lead channel for this episode — the thesis is a buying conversation, so LinkedIn matters more than usual here.

### Post 1 — Build Recap (Vincent, flagship day)

> A buyer came to us last month with an expensive process and no idea where the money was going.
>
> Every vendor in the room quoted the same thing: licences, seats, monthly fees, hours.
>
> We refused, and asked for three things instead.
>
> What the process cost before. Access to the data. And a contract that pays us nothing unless the cost actually drops and stays down.
>
> When it did, we took about fifteen percent of the difference. No monthly fee. They kept the rest.
>
> Here is why we can do that now: the two best AI systems available both launched this week, three days apart, at exactly the same price. When the tool costs your competitor what it costs you, nobody can charge a premium for having it. The only thing left worth paying for is the result.
>
> The full session, including the parts of this that are still unfinished:
> [YOUTUBE_URL]?utm_source=linkedin&utm_medium=social&utm_campaign=ep-24-output-first-pricing
>
> If your process is expensive and nobody can point at where the money goes, that is the conversation. Send me a message.

### Post 2 — Playbook (Vincent, flagship day +2)

> How to buy AI work without paying for a promise. Five decisions, in order.
>
> 1. Write down what the process costs today. If nobody can, that is your first project, not your second.
> 2. Ask the supplier to be paid on the difference, not on access. Watch what happens to the conversation.
> 3. Give them the data, or accept that nothing can be measured.
> 4. Insist that what gets left behind is ordinary software your own experts own. Systems that improvise the same job every morning drift, and the savings go with them.
> 5. Agree who verifies the number before anyone signs. Not the supplier. Not the budget holder.
>
> We run our own measurement in the open, including the runs that failed:
> https://benchmark.shipshit.dev?utm_source=linkedin&utm_medium=social&utm_campaign=ep-24-output-first-pricing

### Post 3 — Lesson (Vincent, flagship day +4)

> The hardest part of an AI project is not choosing the technology. It stopped being that this year.
>
> It is holding one chain together: the context, the data, the output, the result, and finally the productivity.
>
> Miss one link and you have made an expensive process slightly faster. That is not a saving, that is a demo.
>
> Hold all five and you can remove a cost that was never sitting under the right budget line in the first place, put that money somewhere useful, and turn a cut into growth.
>
> That is the whole job. The technology underneath is our problem, not the client's.

### Mitchell variant — Build Recap (agency lens, flagship day +1)

> I have reviewed a lot of AI proposals for clients this year. Almost none of them could name the cost being removed.
>
> They name a tool, a number of licences, and a monthly figure. Then everyone hopes.
>
> The proposal I would actually sign looks different: what the process costs today, who verifies the new number, and a fee that only exists if the number moves.
>
> We recorded the argument, including the part where I pushed back on our own pricing:
> [YOUTUBE_URL]?utm_source=linkedin&utm_medium=social&utm_campaign=ep-24-output-first-pricing

### Cadence

- Build Recap on flagship day from Vincent. Mitchell's variant the following day, different angle, never the same text.
- Playbook at +2, Lesson at +4.
- One link per post, at the end of the body, UTM tagged.
- Check the engagement wording against `## Verify Live Before Quoting` before publishing. The tense must match reality.
