# Three Models Ran My Company For A Day. Only One Number Mattered.

Everybody posted a side-by-side this week. Pelicans. LEGO bridges. A first-person-shooter map. GPT-6 Astra versus Claude Fable 5.1 trended on X four separate times.

I did not post one. I gave all three models a company instead.

Here is what that looks like, what it cost, and why the row for Grok says "did not run."

---

## First, separate the things

Three releases in one week, and they are not the same kind of thing.

**Claude Fable 5.1** is Anthropic's new model, September 1. $10 per million tokens in, $50 out. Cache reads dropped 75% to $0.25. There is a twin called Mythos 5.1: same weights, fewer restrictions, only for vetted security and biology labs.

**GPT-6 Astra** is OpenAI's new model, September 3 to trusted partners, September 4 to paid plans. Same $10 in, $50 out. Cache reads $1.00. A 1.05-million-token window that charges double input above 272K. It is the first OpenAI model at their "critical" cyber threshold, which means the public version can slow down, pause, or block "sometimes during unrelated work." Their words.

**Grok 4.6** is SpaceXAI's model from August 12. $2 in, $6 out. **Grok Bot** is a different product: a worker with its own cloud computer that logs into your tools. It launched inside a $300 plan on August 11 and was on the $20 Cursor Pro plan by August 27. iPad and Android on September 4. There is no Grok Bot spend cap yet.

So: two models at the identical sticker, one at a fifth of it, and one worker whose price fell 15x in three weeks. That last one tells you where the revenue is. It is not the seat. It is the meter.

---

## The lazy take and the useful one

The lazy take is "which one is smartest." Artificial Analysis has Fable in Claude Code at 70 on their coding agent index and Astra in Codex at 67, while Astra wins Terminal-Bench 4.0 and DeepSWE. Split decision. You could argue it all week and people are.

The useful take is "which one finishes a ticket on my repo, and what did the ticket cost." That is not a leaderboard question. It is a hiring question. So you run it the way you would run a hire: same work, same rules, watch what comes back.

---

## The company

cornershop.dev is an open-source website factory for local businesses. The first thing it sells is restofront.com: a finished restaurant website, your menu, your photos, your existing bookings on OpenTable or SevenRooms or TheFork, €49 a month, no setup fee, pay only when you claim it.

It has a backlog, CI, a paid product, and customers who do not care which model wrote the code. That is the whole qualification.

One rule in that codebase that matters here: the system never sends outreach mail on its own. An operator has to record consent evidence first. An "autonomous company" with a hard gate on the one action that can get you fined is not a limitation. It is the design.

---

## The run

Same three issues, picked for size. One frontend, one backend, one bug.

Three lanes:

- Claude Code with Fable 5.1, high effort
- Codex CLI with GPT-6 Astra, high effort
- Grok Build with Grok 4.6

Each lane gets its own worktree and its own issue claim on GitHub. Three writers in one directory is how you lose a day and blame the model.

Ops is one Grok Bot, read-only. Every 30 minutes it looks at CI, review comments, and conflicts, and writes a note. It merges nothing. It emails nobody.

Caps are identical and borrowed from our benchmark: 70 turns, $12, 35 minutes. An agent that cannot close a frontend ticket inside that is not autonomous. It is expensive.

---

## The benchmark, because vibes are not a score

benchmark.shipshit.dev is the controlled half. Seven fixed tasks: a pricing page, issue-board filters, an inventory API, a planted-defect audit, a date-range bug, a taste test on landing page themes, and a signature task that is weighted zero because it is the showpiece.

The scoring is boring on purpose. Deterministic gates first; fail a gate and you get zero on the subjective layer. Hidden tests. Then a blind rubric judged by three read-only lanes from three model families, and no judge ever scores its own family. Judges see A, B, C. No names.

Cost is never the invoice. It is token counts times a dated price list, the same formula for every vendor, labelled "API-equivalent." The harness is disclosed on every score: CLI, version, model, effort, permission mode, budget. That is the line every public leaderboard skips, and it swings SWE-bench scores by 4 to 10 points depending on the scaffold.

MIT licensed. JSON in the repo.

---

## What the smoke run already said

Before this week's models, the plumbing run on September 6 had three rows.

Codex on GPT-5.6 Sol, low effort: **89.5**, $18.45, 28 minutes 31 seconds.

Claude Haiku, low effort: **77.6**, $1.31, 16 minutes 55 seconds. Fourteen times cheaper for twelve points. That is a real decision a real company makes every month.

Grok 4.6: **did not run.**

Open the JSON and it is not mysterious. Status `error`. Duration 5.8 seconds. Zero tool calls. Notes: `API error (status 402 Payment Required): Grok Build usage balance exhausted`.

That is not an intelligence result. It is a billing result. We published it anyway, because a benchmark that quietly drops the vendor that failed to start is a marketing page.

---

## What I would not trust any of them with yet

Merging. All three open pull requests. None of them get the merge button. A bot's confidence score is not a review.

Mail. Already gated in the code. Stays gated.

The gated twins. Two of the three vendors now ship a public model that can stop for reasons unrelated to your ticket. If that fires at minute 30 of a 35-minute cap, the ticket stalls and the meter does not.

---

## The rule you can run tomorrow

Stop reading side-by-sides. Take three tickets from your own backlog, one of each size. Run each model on all three inside the same caps. Write four numbers per model on one line: price in, price out, cache price, and what made it stop. Then read the line, not the leaderboard.

If the fourth number is blank, you have not tested it yet.

The release with this week's models is at benchmark.shipshit.dev as v2026.09. Whatever ran is there. Whatever 402'd is there too. The cornershop pull requests are on GitHub with the model named in the branch.

If this is your problem and you want the setup, reach out. I do this every week.

---

*Clip lines:* "Same sticker price. Different bill." / "Everybody benchmarked the pelican. Nobody benchmarked the invoice." / "Grok didn't lose. Grok didn't show up. The invoice says why." / "A pull request that merges is the only benchmark your customer runs." / "Four lines on the spec sheet now: price in, price out, cache price, and what makes it stop."

*Fill before publishing:* the v2026.09 rows for Fable 5.1, Astra and Grok 4.6, read off the site. The merged / stalled count per lane. Do not publish with the smoke rows as the only receipt if the real release has landed.
