---
title: "Anthropic's Worst Week Ever — Leaks, Bans & Backlash"
slug: "anthropic-meltdown"
source: "HN, X, YouTube, Reddit, GitHub"
status: "done"
date: "2026-04-07"
thumbnail_prompt: null
---

## Summary
Can you leak your own source code, ban your biggest community tools, AND have your product called unusable on Hacker News — all in the same week? Apparently yes. Anthropic just speedran a PR disaster. I'm gonna show you everything — the tweets, the code, the drama.

## Talking Points — The Source Code Leak (March 31)
- EXPLAIN TO CHAT: What is a source map? When you write TypeScript and bundle it for production, the original source gets minified. A .map file maps it BACK to the original source — it's for debugging. You should NEVER ship it publicly. Anthropic left a 59.8 MB .map file in their npm package that pointed to a public R2 bucket with ALL the original TypeScript source.
- Root cause: Anthropic acquired Bun (the JS runtime) in late 2025. Bun generates source maps BY DEFAULT. Someone forgot to add *.map to .npmignore. That's it. One missing line leaked 512K lines of code.
  - [TWEET: Matt Pocock — "~512K lines, ~1,900 files. HugOps to the Anthropic team, this is brutal"](https://x.com/mattpocockuk/status/2038933558740308017)
- Chaofan Shou (@Fried_rice), an intern at Solayer Labs, found it at 3:23 AM. The tweet got 34.8 MILLION views and 12K retweets.
  - [TWEET: @Fried_rice — original discovery "Claude code source code has been leaked via a map file in their npm registry!"](https://x.com/Fried_rice/status/2038894956459290963)
  - [TWEET: @theo (t3.gg) — "Claude Code just got open sourced again!"](https://x.com/theo/status/2038898807212224994)
- Within 2 HOURS: fastest repo in GitHub history to hit 50K stars. Eventually 84K+ stars, 82K+ forks. Code was mirrored, rewritten in Python and Rust.
  - [TWEET: @Amank1412 — "$2.5B+ revenue run rate. 2x growth in months. 2026 just got crazy."](https://x.com/Amank1412/status/2038913392950616091)
  - [TWEET: Julian Goldie — "A researcher opened an npm package. What he found broke the internet."](https://x.com/JulianGoldieSEO/status/2039041692209410103)
- WHAT PEOPLE FOUND INSIDE — 1,906 TypeScript files, 512K lines. Not model weights, but the ORCHESTRATION layer — how Claude Code thinks, plans, and acts:
  - [TWEET: @kuberwastaken — "I broke down everything we weren't supposed to know. Every system prompt, internal codename, unreleased feature"](https://x.com/kuberwastaken/status/2038954625374781900)
  - [TWEET: @om_patel5 — "one guy spent hours going through all of it. here's everything he found"](https://x.com/om_patel5/status/2039120010803843505)
  - [TWEET: @socialwithaayan — "You can now see exactly how they built the entire agent: complete tool-calling system, bash, file write, computer use"](https://x.com/socialwithaayan/status/2038940499009315215)
- Revealed "KAIROS" — autonomous daemon mode, always-on background agent. Mentioned 150+ times in source. Named after the Greek concept "at the right time." Claude running 24/7 on your machine as a background service.
  - [TWEET: @tur24tur — "Anthropic is building a daemon mode called KAIROS — runs as a persistent daemon worker, manages sessions via daemon.json"](https://x.com/tur24tur/status/2039075907160187132)
  - [TWEET: @itsolelehmann — "i can't believe more people aren't talking about this part. KAIROS is an always-on, proactive Claude that does things without you asking"](https://x.com/itsolelehmann/status/2039018963611627545)
  - [TWEET: @birdabo — "kairos: unreleased autonomous daemon mode with background sessions and memory consolidation"](https://x.com/birdabo/status/2038914105436954980)
  - [TWEET: @eeelistar — "Holy shi. KAIROS autonomous daemon mode, Buddy System tamagotchi-style, Undercover Mode"](https://x.com/eeelistar/status/2038930694723019144)
- Revealed "Undercover Mode" — auto-activated when Claude contributes to public repos. Stops AI from leaking Anthropic's internal info. They were secretly contributing to open-source.
  - [TWEET: @rohanpaul_ai — "The Undercover Mode is so interesting. It's a safety system that kicks in automatically for GitHub PRs"](https://x.com/rohanpaul_ai/status/2039022199282282926)
  - [TWEET: @testingcatalog — "UNDERCOVER MODE. The code references an unreleased model named Capybara"](https://x.com/testingcatalog/status/2038950629658214722)
- Internal codenames exposed: Capybara = Claude 4.6, Fennec = Opus 4.6, Numbat = unreleased model
- 44 feature flags for unshipped features found — fully built, sitting behind flags
  - [TWEET: @atomsbitsX — "the product roadmap was sitting inside it. Kairos, Conway standalone agent environment, Buddy tamagotchi system"](https://x.com/atomsbitsX/status/2038919897107792321)
- A dev found a comment left in production code: "The memoization here increases complexity by a lot, and im not sure it really improves performance"
  - [TWEET: @vedolos — "@olliewd40 left this confession in production. Performance? Unsure. Shipped? Absolutely."](https://x.com/vedolos/status/2038948552592994528)
- SIMULTANEOUS supply chain attack: malicious axios package infected installs between 00:21-03:29 UTC March 31
  - [TWEET: @TheHackersNews — "giving attackers a clear map to study and exploit"](https://x.com/TheHackersNews/status/2039225707881173420)
  - [TWEET: @DailyDarkWeb — "The leak includes extensive internal scripts, unreleased AI features, and references to upcoming models"](https://x.com/DailyDarkWeb/status/2038917695609917448)
- Anthropic DMCA'd 8,100 GitHub repos — way too broad. Hit devs who just forked the PUBLIC repo. Then retracted calling it "accidental."
  - [TechCrunch: Anthropic took down thousands of repos](https://techcrunch.com/2026/04/01/anthropic-took-down-thousands-of-github-repos-trying-to-yank-its-leaked-source-code-a-move-the-company-says-was-an-accident/)
  - [TWEET: @theo — "Claude Code being closed source is the biggest bag fumble in the AI era. If CC was on GitHub, these things would be trivial to fix."](https://x.com/theo/status/2038740065300676777)
- Elon Musk called Anthropic "misanthropic" — says they stole training data, paid settlements, and now aggressively police leaks while opposing open-source AI

## Talking Points — The OpenClaw Ban (April 4)
- As of April 4 at 12pm PT, subscription OAuth tokens blocked in all third-party tools. Boris Cherny (Head of Claude Code) announced it himself.
  - [TWEET: Boris Cherny — "Starting tomorrow at 12pm PT, Claude subscriptions will no longer cover usage on third-party tools like OpenClaw"](https://x.com/bcherny/status/2040206440556826908)
- 135,000+ OpenClaw instances affected globally. Users facing cost increases up to 50x.
- Rumors Anthropic built their own OpenClaw internally — leaked source code revealed "Conway" standalone agent environment
  - [TWEET: @daniel_mac8 — "anthropic has built its own openclaw. then you have rumors about Conway and Kairos from the leaked source"](https://x.com/daniel_mac8/status/2040245869413380552)
- OpenClaw creator Peter Steinberger joined OpenAI on Feb 14 — timing suspicious
- Steinberger's response: "first they copy popular features into their closed harness, then they lock out open source"
- The subscription rules are confusing AF
  - [TWEET: Matt Pocock — "Anthropic's rules on using subscriptions are very simple: Claude Code = OK, Agent SDK = OK... ish? CI = ?? Oh,"](https://x.com/mattpocockuk/status/2040536403289764275)
- Anthropic offered a one-time credit equal to monthly plan cost (expires April 17) — insulting
- Some users already rebuilt their $200/mo OpenClaw setups for $15 using direct API calls
  - [Medium: Rebuilt my $200/mo setup for $15](https://medium.com/@rentierdigital/anthropic-just-killed-my-200-month-openclaw-setup-so-i-rebuilt-it-for-15-9cab6814c556)
- Timeline: Jan 9 server-side blocks → Feb 20 TOS update → April 4 full enforcement
  - [HN: Anthropic officially bans subscription auth](https://news.ycombinator.com/item?id=47069299)
  - [HN: Tell HN — No longer allowing subscriptions for OpenClaw](https://news.ycombinator.com/item?id=47633396)

## Talking Points — Claude Code "Unusable" (HN #1)
- GitHub issue #42796: "Claude Code is unusable for complex engineering tasks with Feb updates"
  - [GitHub Issue #42796](https://github.com/anthropics/claude-code/issues/42796)
- Hit #1 on Hacker News with 1,252 points and 690 comments
  - [HN Front Page (April 6)](https://news.ycombinator.com/front)
- Real devs on X backing it up:
  - [TWEET: @CFDevelop — "Claude Code is basically unusable for me. Everything results in 95%+ context usage within a few prompts. I'm on the max plan."](https://x.com/CFDevelop/status/2013897817048150485)
  - [TWEET: @DeryaTR_ — "Claude Code is unusable at this time. Even at max..."](https://x.com/DeryaTR_/status/2038822745178341578)
  - [TWEET: @balakhonoff — "I love Claude Code, but this feature is absolutely unusable at the moment. The speed is catastrophically low."](https://x.com/balakhonoff/status/2008840293508862029)
  - [TWEET: @matteocollina — "Claude Code moved from 'an experiment' to 'a tool I cannot work without'... extreme speed delivery has resulted in many bugs"](https://x.com/matteocollina/status/2019061136830673224)
- Worst possible timing — same week as the leak AND the ban
- Community trust taking massive hits from all three events simultaneously

## Hot Take
This is Anthropic's "New Coke" moment. In one week they managed to: accidentally leak their entire codebase (revealing they secretly contribute to open source repos in "undercover mode"), ban the open-source tools that evangelized their platform, AND have their flagship product called "unusable" on the front page of Hacker News. The indie dev community that built Anthropic's developer mindshare is feeling betrayed. The question isn't whether Claude is good — it's whether Anthropic can be trusted as a platform to build on.

## Livestream Notes
- [Livestream Replay](https://www.youtube.com/watch?v=MJp8l5ZBlI4)
