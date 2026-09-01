# Never Pay for AI Models Again

Everybody telling you to buy a Mac Mini to run local models is solving a problem you do not have.

I know, because I almost had that problem. Then I looked at my OpenRouter account. Lifetime spend: about twelve cents. And I'm sitting on a thousand requests a day.

Here's the setup, and it's stupidly small. You put ten dollars on OpenRouter — once, ever. You point OpenCode at a route that ends in `:free`. Done. The model runs on OpenRouter. The editor is OpenCode. Same picker, same session, zero dollars per token.

No new hardware. No quantized 7B gasping on your laptop. No Mac Mini with a fan you can hear from the next room.

Tomorrow on Ship Sh!t Show we prove it the only way that counts: no paid model touches the build. A free OpenRouter model writes every line. OpenCode is the cockpit. Including the parts that fail — especially those.

But first, the receipts.

---

## 419 models. 21 are free. I counted while writing this.

I pulled OpenRouter's public models API while writing this paragraph. Not a blog post, not a screenshot from March. The live list.

Four hundred and nineteen models on the catalogue. Twenty-one of them are zero per token.

And these are not toys. Some of the twenty-one have a **million tokens of context**. Two Gemma 4 free routes take video. Nemotron 3 Nano Omni takes audio. MiniMax M3 free takes image, video, and a million tokens of text — for free, through an API key you already have.

Read that again. There are people paying $200 a month for less context than the free tier of a model you've never tried.

Which twenty-one are free rotates. Today it's these. I'll pull the same list live on camera tomorrow, and if a name has moved, we say so on air.

---

## What "free" actually is — because this is where everyone quits

Okay, so here's the part every "free AI" thread skips, and it's the part that decides whether this works for you.

OpenRouter's own rate-limit page. Not vibes, their docs:

- **Free tier:** 50 requests a day, 20 a minute.
- **Once you've bought more than $10 of credits, ever:** 1,000 requests a day. Still 20 a minute.

Fifty a day is nothing. An agentic coding loop burns fifty requests before the first feature compiles. That's where people try this, fail in ten minutes, and conclude free models are useless. They're not wrong about the experience. They're wrong about the diagnosis.

The honest headline is not "free forever." It's **ten dollars once, then a real working budget.** I bought credit a while back. I've spent twelve cents of it. The ten dollars was never fuel — it was the ticket through the door.

One more thing they actually admit in the docs: free routes share upstream capacity. A 429 on a free model is often the pool being busy, not your account being cut off. You are not rate-limited. You are in line. There's a difference, and you can route around a line.

---

## The twenty-one, grouped so you can actually pick

Context numbers are from the API, pulled just now. Links go to the routes.

### The router — start here

**`openrouter/free`** is the auto-picker. 200K context. It spreads your request across the free routes, so when one is throttled, this one usually still answers. It's the cheapest insurance in OpenCode: one entry in the picker that almost never dead-ends.

### MiniMax — the headliner, and right now, the promo

**`minimax/minimax-m3:free`** — a million tokens, text plus image plus video. This is the one that makes the Mac Mini crowd go quiet.

**`minimax/minimax-m2.7:free`** — about 197K, text only. OpenRouter's own M2.7 page posts 56.2 on SWE-Pro, 57.0 on Terminal Bench 2, 1495 ELO on GDPval-AA. I did not run those benches. That's what the page says, and I'm telling you where I read it.

And there's a window open right now: GMI Cloud and MiniMax posted a fourteen-day **unlimited** run — August 24 to September 6 — M3 and M2.7, plus Speech 2.8 and Music 3.0, via a GMI key or straight through OpenRouter.

https://x.com/MiniMax_AI/status/2091948930124947941?s=20

https://x.com/gmi_cloud/status/2091925007756857368

That window sits on top of the standing `:free` slugs. Tomorrow we can point OpenCode at M3 and not spend a token. Windows close. The `:free` slug may stay or go. On stream we'll say exactly which one we set.

### NVIDIA — the pile that looks like a cluster

**`nvidia/nemotron-3-ultra-550b-a55b:free`** — 550B parameters total, 55B active, one million context. Free. A 550B model with a million-token window, priced at zero. I keep re-reading that line too.

**`nvidia/nemotron-3.5-lightning:free`** — 30B total, 3B active, one million context, built for throughput.

https://x.com/OpenRouter/status/2087166520564834482

**`nvidia/nemotron-3-nano-omni:free`** — 256K, and it takes text, image, video, and **audio**.

**`nvidia/nemotron-3-super:free`** — 262K, text. **`nvidia/nemotron-3.5-content-safety:free`** — 128K, text and image.

You don't need all five. You need one on the ladder, and one that can see or hear if the build needs eyes or ears.

### Google

**`google/gemma-4-31b-it:free`** and **`google/gemma-4-26b-a4b-it:free`** — both 262K, both take image and video. And Lyria 3 Clip and Lyria 3 Pro are sitting at a million context, text and image, priced at zero on the API right now without even wearing a `:free` suffix.

### The rest of the board

**`thinkingmachines/inkling:free`** — 975B total, 41B active, a million context, text-image-audio. **`inkling-small:free`** — same window, smaller. **`z-ai/glm-5.2:free`** — 256K, long-horizon coding. **`poolside/laguna-s-2.1:free`** and **`laguna-xs-2.1:free`** — both 262K. **`cohere/north-mini-code:free`** — 256K, code. **`dots-3-note-preview:free`** — 512K, text and image. **`liquid/lfm-2.5-2.6b:free`** — 65K, small and fast.

And then there's **`stealth/ox-alpha`**. A stealth frontier model. Million-token context, text, image, video, zero on the API. OpenRouter announced it, and OpenCode is running it free with what they call "near unlimited usage" — they claim capacity for 100 trillion tokens a day:

https://x.com/OpenRouter/status/2090544970923184269?s=20

https://x.com/opencode/status/2090544355824038300?s=20

Somebody is paying for all of this. It just isn't you.

Now the honest part. I did not benchmark twenty-one models, and I won't pretend we did. What we did do is probe availability the morning we locked the episode: eight routes, two 429s. That number matters more than any leaderboard screenshot, because a model that doesn't answer has a benchmark score of zero.

---

## How I actually drive them from OpenCode

This is the whole workflow. It fits in four sentences.

Open the model picker in OpenCode. Point it at an OpenRouter route ending in `:free`. Say the model id out loud — that's the receipt. Start working.

If you want failover, start on `openrouter/free` and let it route around the busy pools.

The thing is, you have to declare your ladder **before** the first prompt, not while you're annoyed. Mine, if nothing moves by tomorrow: **MiniMax M3 free → Nemotron 3 Ultra free → `openrouter/free`.** You move down the ladder on a 429, on two consecutive failures on the same step, or on a loop that writes no files. Not because the output is ugly. Ugly output gets a better prompt. Dead routes get the next rung.

OpenCode also has its own free models under Zen — same picker, different door. On my screen right now: Nemotron 3.5 Lightning, Hy3, Nemotron 3 Ultra, MiMo V2.5, Big Pickle, Muse Spark 1.2, and Ox Alpha Free marked Unlimited. Tomorrow the rule is OpenRouter free, because that's the claim we're testing. Zen is the fire escape if a `:free` route dies mid-build and I refuse to pay on principle.

And understand the actual price. You do not pay for free models with money. **You pay in turns.** Twenty a minute, a thousand a day. That's the budget, and it changes how you build — which brings me to the part that actually matters.

---

## Where the model goes — and where it doesn't

Tomorrow's build is a YouTube distiller. Paste a link, the transcript lands, the clips pop out one by one.

Here's the request math, because the request math is the whole game:

- **yt-dlp pulls the captions.** Zero requests. It's a tool.
- **The model reads the entire transcript in one call.** A 47-minute video is about 15K tokens. M3 free has a million. Ultra free has a million. The whole video fits with room for sixty more.
- **ffmpeg cuts the clips.** Zero requests. The model never sees a frame.

One video. One request. At a thousand a day, that's a thousand videos, for nothing, on the laptop you already own.

That's the trick, and it's not the catalogue. **Put the model where judgment is needed and nowhere else.** Everything deterministic is a tool. People burn fifty requests asking a model to do what ffmpeg does for free, then blame the rate limit.

---

## Tomorrow

We pull the live free list on camera. We point OpenCode at a `:free` route and read the id out loud. We declare the ladder. Then we build the distiller — including the parts that 429, because those are the parts that teach you anything.

If you've been putting off a build because you thought the AI bill was the blocker: it was ten dollars, once, and you've spent more than that on coffee while reading this.

See you on the stream.

---

*Sources I actually opened: OpenRouter models API (419 models / 21 free, pulled while writing), OpenRouter's rate-limit docs (50/day and 20/min free; 1,000/day after $10 lifetime credit), OpenRouter's MiniMax M2.7 page (SWE-Pro 56.2, Terminal Bench 2 57.0, GDPval-AA 1495), the MiniMax and GMI Cloud posts from August 24, the OpenRouter and OpenCode Ox Alpha posts, and the talking points we locked for the stream.*
