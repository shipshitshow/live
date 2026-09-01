# We Gave a Bot One Job: Find Us a Customer. It Came Back With Their New Website.

You've seen the post. Everyone's written it this month.

"If my company went bankrupt tomorrow and I needed $100K by the end of the month, here's exactly what I'd do."

Then a thread. Then a system. Then a bot roster with names like Scout and Quill and Ledger. Then a bookmark, and nothing.

Nobody runs the thing.

So last night we ran it on stream. Live. One bot, one job, a thirty-minute clock, and a two-minute cap per task so it couldn't hide behind a long think.

The job: find us a real customer who will pay us to build them a website.

We named the bot King. Because King was going to be king of lead gen and go get us money.

By the end it had found a real local business, worked out why their web presence was costing them work, produced the replacement site, and drafted the email that sends it to them. Then it scheduled itself to do the whole thing again every weekday morning.

Here's how, and which part of it actually matters — because it's not the part the threads are selling you.

---

## First, get the products straight

This is where 90% of the takes fall apart, so let's separate them before anything else.

**Grok 4.6** is the brain. SpaceXAI's newest model, released August 12, 500,000-token context, tuned for long-running agents. $2 per million tokens in, $6 out. That's it. It's a model.

**Grok Build** is the coding harness. Terminal agent, spawns up to eight sub-agents on separate branches. It writes code.

**Grok Bot** is the thing this article is about, and it is a completely different animal. Launched August 11. It's a persistent worker with **its own computer in the cloud**. Browser, filesystem, terminal, real logins to your real accounts. It keeps working after you shut your laptop. xAI says one account runs up to 50 bots.

And here's the part almost nobody says out loud: **the computer it runs on is Cursor's.** Grok Bot sits on Cursor Cloud Agents — the infrastructure Cursor built so agents "control their own computers," take a remote desktop, test their own work and hand back videos, screenshots and logs. Same login opens both. It's why the $200 Cursor Ultra plan and the $300 SuperGrok Heavy plan both get you Grok Bot: they're not two products bundled, they're one machine with two doors.

Which means the worker holding your Gmail session is running on infrastructure SpaceX bought in August. That's not a hot take, that's just the org chart.

Model, coding agent, worker with your credentials, and Cursor's cloud underneath all of it. Four layers, four completely different trust decisions. When someone says "Grok is insane right now," ask which layer they mean, because the risk profile ranges from "costs us two dollars" to "is currently signed into our email, on a rocket company's hardware."

Access, as of writing: SuperGrok Heavy at $300/month, Cursor Ultra at $200/month, or Cursor Teams Premium at $120/seat. There's no cheap door in.

---

## The setup: hire a company, not a chatbot

The mistake people make is typing a request. A request is a prompt. A bot is a **role**.

So we didn't ask it to do a task. We staffed a company.

Chief of staff at the top. Under it, a CTO, a marketing officer, an inbox manager, a sales inbound bot, a QA engineer. We talk to the chief of staff. It hires the rest when a new need shows up.

And the agent-to-agent chatter is genuinely the best-executed part of the product. You watch chief of staff hand work to inbox manager, inbox manager kick something to sales inbound, ownership actually moving between them. Nobody had that six months ago. That's not a demo trick, that's an org chart that runs itself.

One rule we put in from the start, and you should too: **scope every bot to one project.**

Not because it's tidy. Because the alternative is a bot with a fuzzy mandate wandering into your email at 2am. So we made a project manager bot per project with a hard boundary: anything not related to this project, you don't touch. Nothing. Not the inbox, not the other repo, not "while I'm here."

---

## The run: thirty minutes, lead to finished website

Here's the actual sequence, in order, live on camera.

**Step 1 — we gave it the target, not the method.**

Find three companies a day that don't have a proper website, or have one bad enough that we can obviously improve it. Small businesses, 2 to 8 people, in or around our area. No multinationals. No chains. For the demo, one is enough.

Notice what's missing: we didn't tell it *where* to look or *how* to qualify. That's the whole point of delegating.

**Step 2 — it reasoned about the market before it searched.**

It came back with: plumbers, electricians, small technical shops. Trades where the operator bills a high hourly rate, so there's money, but building a website is the last thing on earth they want to do.

That's not a search result. That's a segmentation call, and it's the correct one. We've paid consultants for worse.

**Step 3 — it went to Google itself.**

Not an API. Not a scraped list. You watch its cloud desktop open a browser, type a search, and start reading results the way you would.

It surfaced a one-person IT shop. Site had a logo about ten pixels tall and two links on it. Perfect target: real business, real money, embarrassing web presence.

Then it did something we didn't expect — it put the qualifying details on screen and told us what to read out to the audience. Fine, bot. We don't have a choice.

**Step 4 — it wrote the brief and shipped it to the factory.**

The bot doesn't hand-code a website, and it shouldn't. It writes the spec — what this business does, who buys from them, what the current site fails to say, what the new one has to do — and passes it to the thing that builds.

That's **CornerShop.dev**, our own website factory. It's the piece we've been building all summer for exactly this reason: a brief goes in, a real site comes out, no human in the middle. The bot finds and qualifies. The factory produces.

This is the handoff that makes the whole thing work, and it's the step every "AI agent army" thread skips. An agent that can search but can't deliver is a research assistant. An agent wired to something that actually ships is a business.

**Step 5 — the email, and the moment it asked permission.**

"Send this lead a proper proposal."

And it stopped. Gave us a picker — Outlook, Gmail, whatever — and asked to authenticate.

That's the correct behavior and it's worth calling out, because earlier versions of these tools would just ask you to paste something and fire. The bot gets a session. It does not get your password. You type the credential yourself, in the takeover window, never into a chat message.

Then think about what that email actually is. Not "hi, we do websites, here's our portfolio, book a call." It's *here is your new website. We already built it. Tell us what to change.*

Cold outreach where the work is already done is a different product than cold outreach.

**Step 6 — the part that's actually the product.**

"Turn this into a routine. Run it daily."

Done. Weekdays, 8:56 AM, description auto-written from the prompt, test-run button, deactivate toggle, full run history.

And *that* is the entire thing. Steps 1 through 5 are a party trick you run once. Step 6 is a company.

---

## Why the routine is the whole argument

Do this by hand and here's your actual day.

You find leads. You write emails. Somewhere between email five and email ten, you're done — not tired, done. And every yes creates a website you now have to build, which eats the day you'd have used to find the next lead. So you land one or two clients and one or two clients is not an income.

That second bottleneck is the one everybody underestimates. Prospecting that works is worse than prospecting that doesn't, because now you owe people websites.

Which is why the factory has to exist before the bot does. Automate outreach without automating delivery and you've built a machine for generating obligations.

With both ends closed, the math inverts. Every weekday morning: three fresh leads, three finished sites, three emails that send finished work to people who didn't ask. Forever, whether anyone's motivated or not. Humans show up for replies and judgment calls. Then you ask the happy ones for references and it compounds into a real business instead of a hustle.

Same pattern works for anything with a referral or affiliate program, by the way. Point it at apps that pay for signups and let it run.

---

## The other setup nobody's talking about: the QA engineer

Everyone's writing about the sales bot. The one we actually use every day is a QA engineer.

It tests the app straight against production. If something throws an error, or a Sentry alert fires, we push it to the bot — it reproduces it, confirms it, and opens a GitHub issue. On stream we pointed it at our feed agent and told it to break the thing. Generate one image, upload it to the whiteboard. Broke in seconds.

Deploy to production, QA bot gets notified, replays the same request, clicks retry, fires a new one, watches whether it breaks again, monitors the errors, files what it finds. No prompting from us.

That's the unglamorous version and it's worth more than the lead gen.

---

## Show it once, it runs forever

Open the bot's Linux desktop, hit record, and do the task yourself while it watches. It saves your steps as a named skill and runs it the same way every day.

It's Excel macros. That's it. That's the mental model. You click here, you click there, and the macro repeats your exact steps forever — except now the spreadsheet is the entire internet and every app you're logged into.

Best first candidate: something you do at least weekly, that touches two or more tools, where the steps rarely change. Recurring, multi-tool, stable. If it hits all three, it's a routine waiting to be lifted off you.

---

## Now the part the threads leave out

**Everything shares one computer.**

Separate bot names are not separate security boundaries. One account, one shared cloud machine, shared files, shared browser sessions, shared logins. Connect Gmail once and every bot you ever create can reach it. xAI's own material calls it a blast radius, which is not a phrase you usually pick for your own product.

**The UI is raw.** Genuinely raw. But it works out of the box, and that's the real trade against something like Cursor: there you assign the project, the folder, the guardrails, and you decide how it's done. Here you drop a task and it just fixes it, and you don't get to see how.

Which means you have to trust it. Same as hiring a person. You hand a human a task and get a result back hours later, and you never watched the middle. This is that, and delegating properly is a skill most builders are genuinely bad at.

---

## How to start without setting yourself on fire

One narrow, reversible, read-only workflow. One concrete deliverable. Only the apps that task needs, scoped accounts where you can.

Everything with consequences goes behind explicit approval: sending, publishing, purchasing, deleting, permission changes, anything legal, anything in production. You type your own passwords, 2FA codes and CAPTCHAs during takeover — never into chat.

Make it draft first. Review the output. Only save it as a routine once the workflow is boring.

Here's the first-task template. Steal it:

```
Outcome: reconcile this week's campaign data.
Sources: these two dashboards.
Constraints: read-only. Do not message anyone. Do not change a budget.
Deliverable: a table with source links, current value,
proposed value, and expected impact.
Review point: stop and ask me before any external action.
```

And the charter for a bot you're going to leave running:

```
You are my [role].

// what you own
[the recurring job, in plain language]
[what it does daily without asking]

// what good looks like
[the format of the deliverable]
[one concrete quality bar]

// where you stop
Never send, publish, purchase, or delete without my approval.
If a reply mentions legal, money, or contract terms — stop and ask.
Anything outside [this project] is not yours. Don't touch it.
```

Bots that ask about everything are useless. Bots that never ask are dangerous. The charter is where you draw that line once, so you're not re-deciding it at 2am.

---

## The honest close

One prompt gets you an app. It doesn't get you a customer.

That line has been true all year, and it's the reason most of what you've watched this month is theatre. The demos are real. The businesses aren't. The gap between "an app exists" and "somebody pays for it every month" is filled with work nobody films.

What changed for us is that both ends of that gap are now machines. King finds the customer. CornerShop.dev builds the thing they're buying. The routine runs it at 8:56 every weekday whether we're awake or not.

What's still ours: the replies. The judgment calls. Deciding what the business is. Nobody's automating the moment a plumber emails back asking whether we're a scam, and honestly nobody should.

So give it the boring, reversible, every-morning half of your job. Watch the early runs closer than you think you need to. Let it off the leash only after it earns it.

The threads will tell you this replaces you. It doesn't. It replaces the part of you that was never going to do the outreach anyway.

---

We ran the whole thing live here:
https://youtu.be/zyQEwa5IYvk?utm_source=x&utm_medium=social&utm_campaign=ep-21-grok-week-stack-consolidation

Full episode — Grok 4.6, Grok Build, Grok Bot and Cursor Origin, plus what the SpaceX/Cursor deal means for your stack:
https://youtube.com/live/-qsSddwzjpY?utm_source=x&utm_medium=social&utm_campaign=ep-21-grok-week-stack-consolidation

The factory is at https://cornershop.dev

New episode every week. If you want the version where somebody actually runs the system instead of bookmarking it, that's the show.
