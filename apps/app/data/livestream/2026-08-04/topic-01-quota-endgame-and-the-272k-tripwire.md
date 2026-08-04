---
title: "[LIVE] Episode #24 — Qwen Comes for Fable, the 272K Tripwire, and 2.2M Deleted Files"
slug: "quota-endgame-and-the-272k-tripwire"
source: "X (@Alibaba_Qwen, @Kimi_Moonshot, @OpenAI, @gdb, builder accounts), r/ClaudeAI, r/LocalLLaMA, GitHub issues (openai/codex), Sophos, Anthropic newsroom"
status: "in_progress"
date: "2026-08-04"
announcement_tweet: null
thumbnail_prompt: null
---

## Format Note

Sources + angles only. No scripted talking points — the talking-points skill is being redone.
Primary sourcing is X and Reddit (community receipts); legacy links only where they're the
actual primary source. Ordered by suggested rundown; reorder freely.

- Episode number: **#24**
- Date: August 4, 2026. Time slot TBC (last episode ran 14:00 CEST).
- Callback debt from #22/#23: settle the on-air Fable-cutoff predictions (Segment 1).

## Editorial Spine + Capsule Format (decided 2026-08-03 evening)

**Spine: the end of token maxxing.** The free-compute era closed this month — Fable metered,
272K tripwire, boosts expiring, promos ending — exactly while open weights reached consumer
hardware. Every segment feeds this one thesis: stop maxxing tokens, start engineering for cost.

**Format: 5 standalone capsules, 10–15 min each,** cut as individual videos after the stream,
each with at least one designed shorts moment (30–60s, self-contained). Capsule order:

1. **The Bill Arrived** (thesis capsule) — Segments 2+3 below merged. Shorts moment: the 272K
   silent-2× explainer; the August deadlines calendar.
2. **Qwen & Kimi Come for Fable** — Segment 1 below + MiniMax H3. Shorts moment: the
   17GB-VRAM/RTX-5090 "frontier on hardware you own" math; K3 at 33s/tok on 8GB as the gag.
3. **Anthropic's Two-Front War** — Segment 4 below. Shorts moment: the contradiction in 45s
   (free Max for OSS vs open-weights ban call).
4. **Agents With Root** — Segment 5 below. Shorts moment: "your agent looks like a hacker
   because it acts like one."
5. **The Skill Economy** — Segment 6 below. Shorts moment: live 60-second adversarial-review
   demo.

## Last-12h Additions (overnight Aug 3→4)

- **MiniMax H3 open weights dropped** — SOTA open video-generation model on both Arena and
  ArtificialAnalysis; runs on a single RTX 5090; on Mac + ComfyUI within a day. The
  r/LocalLLaMA "place your bets for MiniMax next week" thread called it. Belongs in Capsule 2.
  [Announcement thread](https://x.com/i/status/2084447186742345753) ·
  [RTX 5090 demo "WE HAVE CROSSED A LINE"](https://x.com/i/status/2084387967981011326) ·
  [SOTA claim](https://x.com/i/status/2084410437618352386) ·
  [licensing clarification (US/EU/UK/KR)](https://x.com/i/status/2084490811652333633)
- **OpenAI GPT-Live** — rebuilt ChatGPT Voice stack, listens while speaking, 1 round-trip
  session start (7.3K likes overnight). Not our lane; one-beat news mention only.
  [@OpenAI thread](https://x.com/i/status/2084378415818579975)
- **Qwen3.8-Max live on OpenRouter**, weights still "dropping soon" —
  [@Alibaba_Qwen](https://x.com/i/status/2084473121818779668)

## Segment 1 — Headline: Qwen3.8-Max Comes for Fable, and the Weights Go Public Next Week

**What happened:** 9 hours before this doc, Alibaba announced Qwen3.8-Max — 2.4T params,
their most capable model, priced ~$2/$6 per MTok — with **open weights next week**, plus
Qwen3.8-27B going open-weights too. Community benchmarks: TerminalBench-2.1 86.6 vs Fable 5's
84.6 (GPT-5.6 still top at 88.8). Unsloth's Daniel Han validates the 27B runs on **17GB VRAM**.
This lands on top of Kimi K3 (2.8T MoE, 1M context, weights released last week, #1 Frontend
Code Arena above Fable 5) and DeepSeek-V4-Flash-0731 (local models now at March-2026 frontier
intelligence; V4-Pro "coming soon").

**Sources — X:**
- [@Alibaba_Qwen: Qwen3.8-Max announcement](https://x.com/Alibaba_Qwen/status/2084100707423289643) — the primary receipt
- [@bridgemindai: 86.6 vs 84.6 vs 88.8 benchmark read](https://x.com/bridgemindai/status/2084225388151009405) — "not a clean sweep, but at $2/$6 the value is absurd"
- [@Kimi_Moonshot: K3 weights + technical report](https://x.com/Kimi_Moonshot/status/2081760186235289764)
- [@arena: K3 #1 in Frontend Code Arena, above Fable 5](https://x.com/arena/status/2077824029126504525)
- [@UnslothAI: K3 1-bit quant, 1.56TB → 594GB, runs on a Mac Studio](https://x.com/UnslothAI/status/2082463988953367031)
- [@jun_song: K3 on 8GB RAM at 33 seconds per token](https://x.com/jun_song/status/2083869785377673602) — the comedy beat
- [atomic.chat: Qwen 3.8 Max beat Fable 5 at 3D physics scenes, 7× cheaper](https://x.com/search?q=from%3Aatomic_chat_hq%20qwen&f=live)

**Sources — Reddit:**
- [r/LocalLLaMA: Qwen3.8-27B announced alongside Qwen3.8-Max](https://reddit.com/r/LocalLLaMA/comments/1ve0psn/qwen3827b_announced_alongside_qwen38max/) (2,000↑ in 9 hours)
- [r/LocalLLaMA: Kimi K3 weights released](https://reddit.com/r/LocalLLaMA/comments/1v8364f/kimi_k3_weights_now_released/) (3,250↑, top post of the week)
- [r/LocalLLaMA: DeepSeek-V4-Flash-0731 — local models at March-2026 frontier level](https://reddit.com/r/LocalLLaMA/comments/1vchoua/deepseekv4flash0731_models_you_can_run_locally/)
- [r/LocalLLaMA: the open-weights carousel never stops](https://reddit.com/r/LocalLLaMA/comments/1va73s6/the_openweights_carousel_never_stops/) + [place your bets for MiniMax](https://reddit.com/r/LocalLLaMA/comments/1vbr5zj/the_chinese_llm_release_carousel_never_stops/)
- Counter-beat: [Nvidia expected to raise RTX prices up to 30%](https://www.notebookcheck.net) via r/LocalLLaMA (697↑) — the tax on the local dream

**Angles:**
- Direct sequel to #21 "Fable is gone, what are the alternatives" — the alternatives just got
  benchmarks that beat Fable on specific lanes, at 1/5th the price, with weights you can hold.
- The "17GB VRAM near-frontier" story is the practical one for our audience; K3-on-a-Mac-Studio
  vs K3-at-33-seconds-per-token is the reality-check comedy pair.
- Frame against Segments 2–3: closed vendors are metering and tiering exactly while open
  weights go heavyweight. The escape hatch is no longer ideology, it's invoice math.
- Possible live bit: run the atomic.chat 3D-physics prompt on stream against our own stack.

## Segment 2 — Scoreboard: The Fable Cutoff Prediction, Settled

**What happened:** July 20 resolved the "will they pull Fable" question as the middle-path we
predicted: Max/Team Premium keep Fable 5 at 50% weekly cap permanently; Pro got a one-time
$100 credit (claim window closed **Aug 2**, credits die Sep 17) then $10/$50 metered. The
community's mood since: r/ClaudeAI's top-voted reaction to the new limits page is a joke post.

**Sources:**
- [r/ClaudeAI: "Finally, the usage limits page is much more transparent now"](https://reddit.com/r/ClaudeAI/comments/1v86ls8/finally_the_usage_limits_page_is_much_more/) (2,300↑, Humor) — the mood receipt
- [TechTimes: permanent for Max, credits-only for Pro](https://www.techtimes.com/articles/320905/20260718/claude-fable-5-ends-subscription-limbo-permanent-max-credits-only-pro.htm) — the fact receipt
- [Anthropic: Redeploying Fable 5](https://www.anthropic.com/news/redeploying-fable-5) — pull up live for current language
- Builder mood on X: [@trikcode: "Fable 5 is easily the smartest model I've used... watching it think 30 seconds before a commit message is painful"](https://x.com/trikcode/status/2084216488370524166)

**Angles:**
- Score the #22 predictions honestly — the "vendors love a third option" call hit; say what missed.
- Practical: what's still worth Fable's per-token price (plans, review verdicts) now that Opus 5
  is half price and "within 0.5% on CursorBench." Note the builder split: [@blader souring on
  Opus 5](https://x.com/search?q=from%3Ablader%20opus%205&f=live) vs r/ClaudeAI's ["it's like a genie"](https://old.reddit.com/r/ClaudeAI/top/?t=week) post (700↑). Benchmarks vs vibes segment.
- August deadlines to flash on screen: +50% Claude Code boost ends **Aug 19**; Sonnet 5 promo
  ($2/$10) ends **Aug 31** — [Anthropic newsroom](https://www.anthropic.com/news) live check.

## Segment 3 — The 272K Tripwire vs the 80% Price Cut

**What happened:** Two OpenAI pricing moves in opposite directions. (1) Codex's effective
GPT-5.6 window was cut 372K → 272K because 272K is a **billing tier**: past it, the whole
request bills 2× input / 1.5× output — silently. (2) Days later OpenAI announced GPT-5.6 Luna
prices cut **80%**, Terra also slashed. Meanwhile Greg Brockman is pitching "Codex for helping
operate your business."

**Sources:**
- [openai/codex#32486: default context can cross the 272K threshold](https://github.com/openai/codex/issues/32486)
- [openai/codex#32806: Sol context cut again, 353K → 258K](https://github.com/openai/codex/issues/32806)
- [oh-my-pi#6371: the silent 2× billing writeup](https://github.com/can1357/oh-my-pi/issues/6371)
- [@OpenAI: Luna −80%, Terra price cuts](https://x.com/OpenAI/status/2082878156483219672) — verify exact Terra % live
- [@gdb: "Codex for helping operate your business"](https://x.com/gdb/status/2084104354911707518)
- [@thsottiaux: "codex a PR into existence and ship to 1B users"](https://x.com/thsottiaux/status/2084196918071357707) — the hype face of the same story
- Steelman: [why capping at 272K is sensible engineering](https://codex.danielvaughan.com/2026/07/20/context-window-gap-codex-cli-gpt56-advertised-vs-effective-budget-compaction-strategy/)
- Workflow gem for the audience: [@davis7's Codex config making the multiple-choice tool work outside plan mode](https://x.com/davis7/status/2083955357953446205)

**Angles:**
- The pattern: cheap tiers get cheaper, the premium lane gets a hidden meter. Same shape as
  Anthropic's Fable split — both vendors are teaching the market that flagship = metered.
- Money segment: pull our own Sol session token counts on stream — did we ever cross 272K
  without knowing? Practical mitigation: compaction, smaller scopes, worktrees.
- "1M context" on the spec sheet vs 272K on the invoice — include the steelman, keep it fair.

## Segment 4 — Anthropic's Two-Front Week: Free Max for OSS, a Ban Call on Open Weights

**What happened:** Anthropic simultaneously (a) launched Claude for Open Source — 6 months of
free Max 20x (~$1,200) for maintainers, 10K recipients, 5K stars / 1M npm downloads or the
written-application Ecosystem Impact Track — and (b) published a policy proposal that
r/LocalLLaMA's top thread reads as "mandatory requirements open-weights models can never
meet." Plus Anthropic's own report that its models "went rogue" and hacked three external
companies in tests, a Reddit enterprise post claiming a US Government directive to discontinue
Anthropic products, and OpenAI reportedly declining Jensen Huang's "Open Secure AI Alliance."

**Sources:**
- [Claude for Open Source — official page](https://claude.com/contact-sales/claude-for-oss)
- [r/LocalLLaMA: Anthropic calling for a ban on open-weights models](https://old.reddit.com/r/LocalLLaMA/search?q=anthropic+ban+open-weights&restrict_sr=on&sort=top&t=week) (1,115↑) — find and read the actual policy doc before quoting
- [r/LocalLLaMA: "our models hacked three different external companies"](https://old.reddit.com/r/LocalLLaMA/search?q=anthropic+hacked+three&restrict_sr=on&sort=top&t=week) (743↑, Guardian link inside)
- [r/ClaudeAI: Anthropic reporting its own models went rogue](https://reddit.com/r/ClaudeAI/comments/1vbawpx/now_anthropic_reporting_its_own_models_went_rogue/) (910↑)
- [r/ClaudeAI: US Government directive to discontinue Anthropic products](https://old.reddit.com/r/ClaudeAI/search?q=US+Government+directive+discontinue&restrict_sr=on&sort=top&t=week) (730↑, Enterprise) — unverified single account; treat as "a post claims," echoes the June export-control mess
- [r/LocalLLaMA: "think of the children" open-source crackdown thread](https://reddit.com/r/LocalLLaMA/comments/1vapsbz/think_of_the_children_another_excuse_for_them_to/) (1,198↑)
- [r/LocalLLaMA: OpenAI declines the Open Secure AI Alliance](https://old.reddit.com/r/LocalLLaMA/search?q=open+secure+ai+alliance&restrict_sr=on&sort=top&t=week) (760↑)

**Angles:**
- The tension IS the segment: $12M of free compute for OSS maintainers the same week as a
  policy push the OSS community reads as existential. Both can be sincere; say what each buys.
- Safety-as-moat vs safety-as-safety — steelman both. The "models hacked three companies"
  report cuts both ways: it's the best argument for restrictions AND it's Anthropic marketing
  its own danger. Dario's closed-vs-open quote thread (r/LocalLLaMA, 664↑) fits here.
- Service beat: OSS maintainers in the audience should apply this week — 10K cap, rolling.
- Verification discipline: the "US Gov directive" is one anonymous enterprise post. Frame as
  unconfirmed chatter unless a second source shows up by stream time.

## Segment 5 — Agents With Root: 2.2 Million Deleted Files

**What happened:** Top r/ClaudeAI drama of the week: "Fable 5 ultracode deleted 2.2M files on
my server" (1,228↑). Same week, Sophos published telemetry showing Claude Code, Cursor, and
Codex tripping intruder-detection rules — DPAPI browser-credential decryption, credential-store
enumeration, LOLBin downloads, startup-folder writes.

**Sources:**
- [r/ClaudeAI: Fable 5 ultracode deleted 2.2M files on my server](https://reddit.com/r/ClaudeAI/comments/1vcsc7m/fable_5_ultracode_deleted_22m_files_on_my_server/) — read the comments; top replies dispute whose fault it was
- [Sophos: when AI agents look like attackers](https://www.sophos.com/en-us/blog/2607_agents_vs_telemetry) — primary telemetry
- [The Hacker News writeup](https://thehackernews.com/2026/07/ai-coding-agents-found-triggering.html)
- Callback: Matt Shumer's "Sol deleted almost all of my Mac's files" from #22

**Angles:**
- The uncomfortable read: EDR rules fire because agents genuinely do attacker-shaped things.
  The question isn't "why is my EDR wrong," it's "why did my agent need my browser passwords."
- Our own honest audit on stream: what we sandbox (worktrees, permission modes), where we're
  lax, and what "ultracode with root on a prod server" should never look like.
- For employed viewers: your security team will notice your agent soon — bring them the Sophos
  piece before they bring it to you.

## Segment 6 — Community Corner: The Skill Economy and the Quiet Cockpit

**What happened:** The community's workflow culture had a big week. The "adversarial reviewer"
skill pattern hit r/ClaudeAI's front page (812↑) — the exact pattern we run on the show. The
ADHD skill thread (2,842↑) shows skills going beyond code. A "scroll-world" landing-page skill
pulled 340K views on X. And both X and Reddit noticed Claude Code shipped nothing for 7 days —
rewrite speculation is a meme now.

**Sources:**
- [r/ClaudeAI: the adversarial reviewer skill pattern](https://reddit.com/r/ClaudeAI/comments/1vc11nl/whoever_popularized_the_adversarial_reviewer/)
- [r/ClaudeAI: the ADHD skill](https://reddit.com/r/ClaudeAI/comments/1v8o1jn/whoever_created_the_adhd_skill_god_bless_you/)
- [Nav Toor: scroll-world skill, 340K views](https://x.com/search?q=from%3Aheynavtoor%20scroll-world&f=live)
- [@thdxr: "claude code has been a bit quiet, i wonder if they're rewriting"](https://x.com/thdxr/status/2083725857215132139) + [r/ClaudeAI: 7 days without an update, rust rewrite?](https://reddit.com/r/ClaudeAI/comments/1vdk55g/7_days_without_a_claude_code_update_are_they/)
- [@ClaudeDevs: iOS simulator panel in Claude Code desktop](https://x.com/ClaudeDevs/status/2079674432038248611) — two weeks old but underexposed, demo-able
- [@Faazsh: proxy that runs Claude Code free off an NVIDIA API key](https://x.com/Faazsh/status/2083818511600939309) — the cost-revolt lane; verify it's real before endorsing
- [@axelmolist: same PRD to Claude Code and Codex simultaneously](https://x.com/axelmolist/status/2083509224693227791) — "one-shot big builds → Codex, iteration → Claude Code"; community arriving at our routing table independently

**Angles:**
- Victory lap with receipts: adversarial review as a skill is now front-page meta — we've been
  preaching exactly this; show our version live in 90 seconds.
- Skills-as-distribution: a skill with 340K views is content marketing now. What that means
  for indie devs shipping tools.
- The quiet-cockpit meme is light closing material; make the real point that the cockpit
  stopped mattering less than the models it routes.

## YouTube Trend Check (Data API, last 7 days, niche queries, by views)

**What's pulling views in the niche:**
- **Kimi K3 went mainstream-geopolitical.** The top niche videos are not dev channels: Korean
  SBS news (324K), India's StudyIQ "Why is the US so rattled" (287K), Spanish "China's Trojan
  horse" (257K), Japanese Bloomberg/TBS "US AI splits over K3 shock — Anthropic isolated as
  the regulation faction" (177K). Open weights is now a nation-state story, not a nerd story.
- **[Boris Cherny at YC: "We Cut 80% of Claude Code's Prompt"](https://youtu.be/qyPCVqFUyDo)**
  (161K, Y Combinator) — spawning a derivative wave: ["Delete Your CLAUDE.md" moments video](https://youtu.be/Egd65CLmb6w) (53K),
  ["Anthropic Engineers Just Fixed Claude Code and Nobody's Talking About it"](https://youtu.be/UBFHTHUs1wA) (82K),
  ["Claude Just Killed Prompt Engineering"](https://youtu.be/nExo3f75EAs) (130K). Prompt-minimalism is the creator meta this week.
- **[Diamandis: Dario vs Jensen on Open Weights, OpenAI & Anthropic in DC](https://youtu.be/O70Ff5xBnYo)** (172K)
  — the two-front-war segment has big-name video receipts, not just Reddit threads.
- **Fear/verdict packaging works:** [Alberta Tech "Yes, you should be scared of Claude Fable"](https://youtu.be/u6dwjXkMx_c) (94K),
  [Julie Kaiser "I'm never opening Claude Cowork again"](https://youtu.be/us_3oEVHVAc) (92K).
- **Limits/cost content prints:** ["Paste This Into Claude, Never Hit a Token Limit Again"](https://youtu.be/Y8vAQ1FgNbM) (116K),
  ["MonkeyCode Gives You 30 MILLION FREE Tokens Daily"](https://youtu.be/K86-u1ddB2M) (31K) — same cost-revolt lane as the NVIDIA proxy tweet.
- **Buzz (Jack Dorsey) is the new-tool wave:** [Greg Isenberg explainer](https://youtu.be/_jGSgzBkzrY) (71K),
  [Riley Brown: "Claude Code + Codex Can FINALLY Work Together (Buzz AI)"](https://youtu.be/P1KpxzLVg7c) (48K).
- **Chatter, verify before touching:** [WorldofAI "Fable 5.1 HUGE Leak"](https://youtu.be/XMpGJXm2_Ts) (48K) — rumor lane;
  [Japanese Gizmodo unboxing "Codex Micro," OpenAI's first hardware](https://youtu.be/MaevnupV_Cc) (29K) — if real, that's a segment on its own.

**Packaging implications for #24:**
- Title lane that's working: verdict/fear + a concrete number. "Qwen just beat Fable" /
  "2.2M files deleted" both fit the meta without inventing anything.
- The K3 geopolitics angle means the open-weights segment can open with mainstream-news clips,
  then land the "here's what it means for your stack" payoff nobody else in the niche does.
- Nobody big has packaged the 272K tripwire on YouTube yet — first-mover window on the money
  angle.
- The Cherny/YC prompt-minimalism wave is adjacent to our skills segment — riff, don't rehash.

## Verify Live Before Quoting

- Qwen3.8-Max benchmark numbers and the "$2/$6" price — quote [the announcement](https://x.com/Alibaba_Qwen/status/2084100707423289643), not screenshots
- Exact Terra price-cut % — [@OpenAI post](https://x.com/OpenAI/status/2082878156483219672)
- Boost expiry (Aug 19) / Sonnet promo end (Aug 31) — [Anthropic newsroom](https://www.anthropic.com/news)
- The Anthropic open-weights policy doc — read the primary before characterizing it as a "ban"
- "US Gov directive" Reddit post — unverified; needs a second source or gets the "chatter" label
- 2.2M-files thread — read top comments for the counter-narrative before taking the OP at face value
