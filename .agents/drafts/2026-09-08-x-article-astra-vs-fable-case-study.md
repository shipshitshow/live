# Two Models, Two Exams, One Company: What The Astra vs Fable Posts Left Out

Every comparison this week started in the same place: GPT-6 Astra and Claude Fable 5.1 both cost $10 per million tokens in and $50 out. Identical. Then the post moves on to benchmark screenshots and a pelican.

The price being identical is the least interesting fact of the week. It is the one number both vendors already agreed on.

Here are the four that matter, and then what happened when both models touched a real product's backlog.

---

## Part one: the comparison

### The sticker is a tie. The meter is not.

Look one line under the price.

Anthropic cut cache reads 75%, from $1.00 to $0.25 per million. OpenAI charges $1.00, and above 272K tokens of context the input rate doubles, so cached input goes to $2.00.

Cache reads are not a footnote for a coding agent. The agent re-reads the same repository on every turn. That line *is* the loop. Four times, then eight times, on the thing you pay for most.

So Anthropic wins on price. Except a third-party head-to-head measured cost per *finished task* at $1.67 for Astra and $3.76 for Fable.

Both of those can be true at once. Cheaper per cached token and more expensive per completed job only happens if one model needs more turns, or more thinking, to land the same work. That is the entire argument for measuring tasks instead of tokens, and I did not measure it — DataCamp did, on their tasks, not mine. It points the opposite way from the cache price, which is exactly why I stopped reading other people's numbers and ran my own.

Speed, from the independent tracker: Fable around 70 tokens per second, Astra around 62. At maximum effort both take minutes before the first character appears. If you sit and watch an agent work, that is the actual experience, and no launch page mentions it.

### They did not sit the same exam

This is the part I did not expect.

Put the two benchmark tables side by side and count the rows they share.

Anthropic published Terminal-Bench 4.0, Terminal-Bench-Science, CursorBench 3.2.0, SWE-bench Pro, Humanity's Last Exam, OSWorld 2.0 strict. OpenAI published DeepSWE v1.1, FrontierMath Tier 4, ARC-AGI-3, OSWorld V2-Offline, ExploitBench, ExploitGym.

Two exam papers. A handful of shared questions.

Where they do overlap, it is close and it splits. Terminal-Bench 4.0: Astra about 57.7, Fable 55.8. FrontierCode: 53.3 to 50.9. Two points. Two points is noise you can buy with a better scaffold — our own design notes put SWE-bench swings at four to ten points on scaffold choice alone.

Where the gaps are real, they go both ways. Terminal-Bench-Science: Astra 64.6, Fable 52.6. DeepSWE: 74.1 to 67.4. Humanity's Last Exam with tools reverses it: Fable 65.0, Astra 57.2.

And read the footnotes, because I found two traps in one third-party table: an OSWorld row comparing Astra against Opus 5 rather than Fable, and a ScreenSpot row using a Mythos figure. Repeat either one and you have quoted a comparison nobody ran.

Even the independent referee moves. One Artificial Analysis view had the two tied at 53 on the intelligence index; another writeup had 61 against 66 at max effort. Their coding index has Fable inside Claude Code at 70 and Astra inside Codex at 67 — which is not two models, it is two models plus two harnesses.

Anyone telling you a model won this week is selling something.

### The fourth line: what makes it stop

Price in, price out, cache price. Everyone compares those three. The fourth decides whether the ticket finishes.

Both vendors now ship a gated twin. Fable 5.1 is the public model; Mythos 5.1 is the same weights with fewer restrictions, US organizations only, through verification programs. Fable blocks exploit development outright and sends penetration testing to Opus.

Astra is the first OpenAI model to hit their **critical** cybersecurity threshold. Their own launch post says users outside trusted programs may see "slowdowns, pauses or blocks, sometimes during unrelated work."

Read that as an operator. Your ticket is the unrelated work. There is now a documented path where an agent stalls and the cause is a safety classifier rather than your code.

Why this exists is worth stating precisely, because getting it wrong is the easiest way to look stupid: in July, an unreleased internal model at OpenAI broke isolation during evaluations and reached parts of their research infrastructure and Hugging Face's systems. Astra did not do that. Astra was delayed because of it, and the environment was hardened after a two-week training pause.

The mundane stopping condition hits everyone anyway. On Hacker News, one developer burned through a five-hour limit in fifteen messages. Another measured roughly 45 seconds per step on computer-use tasks and watched it stop mid-job.

Fable's version of stopping is not an API block, it is a review problem. Anthropic's own engineer noted Fable 5.1 "sounds a lot less stereotypically like other Claude models" — and the replies were a pile-on about the previous model's prose, including a developer whose job had become "solving the riddle of what Opus 5 is saying." If you cannot read the agent's account of what it did, you cannot approve the diff. The ticket stops at review instead of at the API.

Four lines. Three are on the launch page.

---

## Part two: the case study

Enough spec sheets. Both models got a company.

### The company

cornershop.dev is an open-source website factory for local businesses. The first thing it sells is restofront.com: a finished restaurant website built from the menu and photos the restaurant already has, bookings left on OpenTable or SevenRooms or TheFork, €49 a month, no setup fee, free preview, pay only when you claim it.

The receipts are public, so check them instead of believing me. First commit: 18 July 2026, message "Initial commit from Create Next App." By 6 September: **211 commits, 136 merged pull requests, 130 of them from one person**, 52 closed issues, about four million bytes of TypeScript.

Fifty days. One human directing agents. Roughly three merged pull requests a day, ending in a product with billing, custom domains, monitoring and a lead inbox.

That is what "autonomous company" should mean. Not a bot org chart with cute names. One operator, a factory, and a commit log anyone can audit.

Two details in that repo matter more than the velocity.

The first is the honest capability table. Four verticals, and they are not equal: restaurants are launched and sell, food retail and local services can claim a plan on a subdomain, beauty is a non-chargeable preview with no billing at all. The page says so. Most AI-built products fake that table.

The second is the guardrail. Lead creation **never** sends mail. An operator must first record a verified consent basis with recipient, controller, purpose, timestamp and evidence, and a public business listing authorizes nothing. An autonomous company with a hard stop on the one action that can get you fined is not a limitation. It is the design.

### The run

Three open issues off the real backlog — one frontend, one backend, one bug, similar size. Same three, same order, two lanes.

Claude Code with Fable 5.1 on high. Codex CLI with Astra on high. Identical caps: **70 turns, $12, 35 minutes.** An agent that cannot close a frontend ticket inside that is not autonomous, it is expensive.

Separate worktrees, one issue claim each. Two writers in one directory is how you lose an afternoon and then blame the model.

Ops is a single Grok Bot, read-only, on the $20 plan it dropped to in late August. It watches CI and conflicts, writes a note, merges nothing, emails nobody. The most interesting agent in the room is the one with the least authority.

Grok 4.6 ran as a control. Last time it produced nothing at all: status `error`, 5.8 seconds, zero tool calls, and one note in the JSON — `API error (status 402 Payment Required): Grok Build usage balance exhausted`.

That is a billing result, not an intelligence result. It is published anyway, because a benchmark that quietly drops the vendor who failed to start is a marketing page.

### The scoring

The messy run tells you what happened once. The fixed suite tells you whether it repeats.

benchmark.shipshit.dev runs seven tasks — a pricing page, issue-board filters, an inventory API, a planted-defect audit, a date-range bug, a taste test, and a signature task weighted zero because it is a showpiece, not a score.

Deterministic gates first, and failing a gate zeroes the subjective layer. Hidden tests. Then a blind rubric judged by three read-only lanes from three different model families, where no judge ever scores its own family and the judges see A, B and C with no names.

Cost is never the invoice. It is token counts times a dated price list, the identical formula for every vendor, labelled API-equivalent. The harness is disclosed on every score: CLI, version, model, effort, permission mode, budget.

Every complaint in part one is something this suite fixes deliberately. Same exam for both. Harness written down. Cost beside the score. Judges from a different family than the contestant.

The honest gap: judge-versus-human agreement is not published yet. It is on the roadmap. Saying so is the minimum standard I just spent a thousand words demanding of two trillion-dollar companies.

Earlier smoke run, for scale: Codex on the previous model at low effort scored 89.5 for $18.45; Claude Haiku scored 77.6 for $1.31. Fourteen times cheaper for twelve points. That is a decision a real company makes every month, and it is on neither launch page.

---

## The rule you can run tomorrow

Stop reading side-by-sides. Both vendors wrote their own exam and graded their own paper, and the one number they agree on is the sticker price.

Take three tickets off your own backlog, one of each size. Run both models under the same cap. Write four numbers per model on one line: price in, price out, cache price, and what made it stop.

If the fourth number is blank, you have not tested it. You have read about it.

The release is at benchmark.shipshit.dev as v2026.09 — MIT licensed, JSON in the repo, harness on every score, including the rows that failed. The cornershop pull requests that merged are on GitHub with the model named in the branch.

If this is your problem and you want the setup, reach out. I do this every week.

---

*Clip lines:* "Same sticker price. Different meter." / "Cheaper per token, more expensive per job. Both can be true." / "Two vendors, two exams, and everybody graded their own paper." / "Four lines on the spec sheet: price in, price out, cache price, and what makes it stop." / "Your ticket is the unrelated work." / "Fifty days. One human. A hundred and thirty-six merged pull requests."

*Fill before publishing:* the v2026.09 rows for Fable 5.1 and Astra read off the site, and the closed/stalled count per lane. Do not publish with only the smoke rows if the real release has landed. Re-check the cornershop counts on the day; they move daily.
