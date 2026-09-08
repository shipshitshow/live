<!--
DRAFT. Not posted.

Source: Vincent's output-first piece (pasted 2026-09-07; the original lived at
/workspace/fde-ai-output-first-article.md on another machine and is not in this repo).

Edits made against `skills/x-pipeline` article contract:
- opening now leads with the 2026-09 price convergence, the receipt the original asserted
  but never proved
- products/layers separated before the story so the take cannot be misread
- close carries the rule the reader can run tomorrow, plus the artifact
- clip lines extracted at the bottom
- SEGMENTATION FIX (Vincent, 2026-09-07): the original said "stop selling subscriptions as
  the product" and an earlier draft framed restofront's EUR49/month as us being one
  iteration behind our own thesis. Both were too broad. The target is selling ACCESS
  (seats, licences, resold usage), and the SaaS line stays because it serves a different
  customer. Added the three-part test (baseline / data access / saving worth measuring)
  as the rule that picks the pricing model per ICP. Vincent's closing line was changed
  from "subscriptions" to "access" for this reason - revert if you disagree.

BEFORE PUBLISHING — resolve the tense. The piece is written in the past tense about a
buyer. Decide which is true and edit accordingly: delivered engagement / live pilot /
signed with savings not yet verified / offer shape being taken to market. Never name the
client, the sector, or an identifying number. This is the one thing readers will judge.

LinkedIn cut of the same argument lives in `## LinkedIn Pipeline` of
apps/app/data/livestream/2026-09-08/topic-01-output-first-pricing.md (buyer register,
no jargon, no swearing).
-->

# Stop Selling Access. Sell The Number That Moved.

Two of the best AI models on earth shipped three days apart this month. Claude Fable 5.1 on the first. GPT-6 Astra on the third.

They cost exactly the same. Ten dollars per million tokens in, fifty out. To the cent.

Pull up their benchmark tables and they barely overlap — each vendor published its own exam and graded its own paper. On the handful of rows they share, the gap is about two points, which is inside the swing you get from a better scaffold.

Everyone spent the week arguing about which one won. That is the wrong question, and the right one is uncomfortable:

If the best intelligence available costs everyone the same, then having it is not a business. Selling access to it is definitely not a business.

So we stopped selling access. Not recurring revenue — access. The difference between those two is the second half of this piece, and it is where most people take this argument too far.

---

## The pitch every buyer is getting

A buyer came to us with a boring problem dressed up as an AI project.

Their process was expensive. Nobody on the board could say exactly where the money went. Every vendor in the room wanted to sell the same thing: seats, subscriptions, agent workflows, billed hours — process on top of process — and hope the P&L moved later.

Look at what is actually being sold there. The model underneath is a commodity that costs every one of those vendors the same. So the product is the wrapper: the licence count, the monthly fee, the dashboard. A seat tax with a chatbot around it.

Nobody in that room could name the cost being removed. That is why demos do not close. A demo proves the tool works. It does not prove the money went away, and nobody signs a cheque for a capability.

We refused the subscription.

---

## What we asked for instead

Three things: the old cost of the process, access to the data, and a contract that only paid us when the number moved.

When the spend dropped and the result stuck, we took a share of the difference. They kept the rest. Interests aligned on one line: performance.

Roughly fifteen percent of the performance. Zero management fee. We took the risk. We only won when they did.

That is the deal. Not a demo. Not a seat tax with a chatbot wrapped around it. A performance check when the savings show up.

They did not buy our stack. They bought the output. Especially the effect on EBITDA. Which model sat underneath was our problem, not theirs — and that sentence is only sayable now, because the two best models on the market are the same price and score within noise of each other.

Under that contract the conversation stopped being about agents and started being about money. Clients stopped getting pitched. They started pitching us. The only question left was whether we would put skin in the game on their savings line.

It is the fastest qualification tool we have. Anyone unwilling to share the upside was never going to sign.

---

## The risk that moves onto our side of the table

Be honest about what this contract costs us, because most people writing about outcome pricing skip it.

On a subscription, everything that goes wrong is the client's annoyance. On a performance contract, it is our margin.

Both vendors now ship a gated public model. Anthropic's public model blocks exploit development outright and redirects that work elsewhere. OpenAI's launch post says users outside its trusted programs may hit "slowdowns, pauses or blocks, sometimes during unrelated work."

Read that as a supplier carrying delivery risk. Your ticket is the unrelated work.

The mundane version is worse because it is constant: developers on Hacker News burned a five-hour usage limit in fifteen messages, and measured around forty-five seconds per step on computer-use tasks, with stops mid-job.

Rate limits are cost of goods sold now. Price them in or eat them.

So the spec sheet for a model in 2026 has four lines: price in, price out, cache price, and what makes it stop. Three of them are on the launch page.

---

## The chain that has to hold

The hard work was not picking the hottest model. It was holding one chain together: context, then data, then output, then result, then productivity.

Miss a link and you are optimizing demos. Hit all of them and you can kill a legacy cost that never even showed up under the right budget line, reallocate it, and turn a cut into growth.

That last move matters more than the saving. Pure cost-cutting gets you thanked once. Reallocation gets you back in the room next year.

We also did not rent them task-agents that improvise the same job every day. Those drift. Prototypes die in production when nondeterministic tokens sit where you needed a fixed path.

The useful move was giving their experts AI so they could ship deterministic software that automated the craft. When that happens, you are not speeding up the old process. You are changing the firm's output.

This is not engineering taste. It is commercial self-defence. A drifting agent is a saving that reverses, and a saving that reverses is an invoice we do not get to send.

It is also why the model choice stopped mattering. The determinism lives in the software the experts own, not in the model. Swap the model underneath and the savings survive.

---

## You cannot invoice a saving you cannot measure

A contract that pays on a delta needs a defensible way to say what a unit of work costs. Otherwise "savings" is just the supplier marking its own homework.

So we built the measurement in the open. Same task suite, every model, deterministic gates first, hidden tests, then a blind rubric judged by lanes from three different model families where no judge scores its own family. Cost is never the invoice — it is token counts times a dated price list, the same formula for every vendor.

The runs that failed are published too. One vendor's row on the last release says "did not run", and the JSON gives the reason: a 402, payment required, balance exhausted. Five point eight seconds, zero tool calls.

That is a billing result, not an intelligence result. We published it because a benchmark that hides the vendor who failed to start is a marketing page — and so is a savings report that hides the month it went backwards.

If we would not accept a vendor's self-graded exam, we cannot hand a client a self-graded saving.

---

## The part everyone gets wrong: this is a segmentation rule, not a religion

We sell software on a monthly fee too, and we are keeping it.

Our restaurant product charges forty-nine euros a month for a finished, hosted, maintained website. That is not a contradiction of anything above, and the reason matters more than the thesis does.

You can only sell a share of savings when three things exist:

A baseline the buyer will sign off on. Access to the data that proves it. And a saving worth more than the cost of measuring it.

Run a restaurant through that. There is no documented cost of "our website is bad." There is no data, there is a PDF menu and a phone number. And the entire contract is forty-nine euros a month, so any honest measurement costs more than the deal is worth. Nought for three. Savings-share there is not merely a bad idea, it is arithmetically impossible.

Run the enterprise buyer through the same test. A process cost someone can name. Data we can reach. A delta worth real money. Three for three.

Same company, same models, opposite pricing model, and the customer chose it, not us.

The failure modes run in both directions, and that is the part worth writing down. Take savings-share to a small local business and you will spend more measuring than you earn, and you will never agree a baseline. Take seats to an enterprise and you are charging a premium for a commodity input, in a room where four other vendors quote the same thing at the same price.

What stays constant across both lines is narrower than "no subscriptions," and it is the only rule I would actually defend: nobody ever pays us for access to a model. The restaurant pays for a finished website. The enterprise pays for a number that moved. Neither is billed per login or per token.

But it is not savings-share, and the honest version of our own argument would price it on bookings recovered. We have not done that yet. If outcome pricing is right, it is right for our own products, and we are one iteration behind our own thesis.

Saying so is cheaper than being caught.

---

## The rule you can run tomorrow

Stop selling process. Stop selling access as the product. Sell the output, align incentives, and get paid on what AI removed from the cost of the old process. Everything else is decoration.

And stop before you take that to every room. Run the three-part test first. Where it passes, price on the difference. Where it fails, sell a finished product at a flat price and never say the word savings.

If you are buying rather than selling, five questions in order. What does this process cost today, and if nobody knows, that is project one. Will the supplier be paid on the difference instead of on access. Do they get the data, or is nothing measurable. Is what gets left behind ordinary software your own experts own. And who verifies the number — not the supplier, not the budget holder.

Lazy take: more SaaS, more agents, more hours.

Useful take: share the performance check when the savings stick.

The measurement instrument is public and MIT licensed at benchmark.shipshit.dev, failed runs included. If your process is expensive and nobody can tell you where the money goes, that is the conversation.

---

*Clip lines to pull as standalone posts:*

- "When the best intelligence costs everyone the same, having it is not a business."
- "A seat tax with a chatbot wrapped around it."
- "Nobody buys a capability. They buy a number that moved."
- "On a subscription, a stalled model is the client's annoyance. On our contract, it's our margin."
- "Prototypes die in production when nondeterministic tokens sit where you needed a fixed path."
- "If we wouldn't accept a self-graded exam, we can't hand a client a self-graded saving."
- "Two customers, two pricing models. The mistake is having one and taking it to every room."
- "No baseline, no data, no size. Savings-share isn't wrong there, it's impossible."
