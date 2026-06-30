---
title: "Masterclass: Set Up Open Models For AI Coding"
slug: "open-models-escape-hatch"
source: "Anthropic, OpenAI, AWS Bedrock, Ollama, LM Studio, vLLM, Artificial Analysis, Aider, Reddit, X, YouTube, How I AI, NVIDIA, EIA, Energy.gov, OpenRouter"
status: "in_progress"
date: "2026-06-30"
announcement_tweet: null
thumbnail_prompt: "YouTube livestream thumbnail, 16:9, Ship Shit Show house style. Two host cutouts on left and right reacting toward one central topic panel. Center panel split by lightning: left side cool blue/cyan local AI logo grid with monochrome white/off-white model icons, right side warm orange/red cloud/server inference icon. Dark charcoal background, dramatic glow, clean simple composition. Only text allowed: #21 in top-right. No title text, no model-name labels, no UI labels, no official brand wordmarks."
---

## Cold Open — Read This

> "The best model is useless if you cannot call it."
>
> "Fable is blocked. GPT-5.6 is preview. So tonight is practical."
>
> "How do we set up open models for coding?"
>
> "Local. Bedrock. Benchmarks. One real coding test."

## Summary

Red line: this is not "open beats closed." This is routing. Frontier for hard work. Hosted open for fallback. Local for control and cheap repetition.

## Hot Take

The smartest model you cannot call is dead weight.

## Sources — Livestream Notes

- Title: **[LIVE] Masterclass: Set Up Open Models For AI Coding**
- [YouTube livestream](https://www.youtube.com/watch?v=h0EzR9Sqkz0)
- [Restream studio](https://studio.restream.io/eue-pcqd-vbw)
- Stream path: access problem -> local setup -> hardware/bill check -> Bedrock setup -> benchmarks -> same repo test.
- Live test: one small coding task, local vs hosted, score the diff.
- Main rule: do not sell open models as magic. Sell them as a fallback layer.

## Talking Points — Access Is The Real Problem

### Segment Thesis

The best model only matters if your loop can use it.

### Talking Points

- Pull up [Claude Fable/Mythos](https://www.anthropic.com/news/claude-fable-5-mythos-5). Point: access is the story.
- Pull up [GPT-5.6 preview](https://openai.com/index/previewing-gpt-5-6-sol/). Point: preview is not a production plan.
- Red line: if the model can disappear, it is a dependency risk.
- Clip line: **"A model you can't call is not infrastructure."**

### Host Notes

- Ask Mitchell: what breaks first if the default model silently changes?

## Talking Points — Open Models Are Routing

### Segment Thesis

Open models give you deployment choices.

### Talking Points

- Pull up [gpt-oss](https://openai.com/index/introducing-gpt-oss/). Point: open-weight is now mainstream.
- Local route: [Ollama](https://docs.ollama.com/api/openai-compatibility), [LM Studio](https://lmstudio.ai/docs/developer/core/server), [vLLM](https://docs.vllm.ai/en/latest/getting_started/quickstart/).
- Hosted route: [AWS Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html), [Bedrock model catalog](https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html), [Converse API](https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html).
- Red line: local is control. Bedrock is convenience. OpenRouter is fast routing.
- Clip line: **"Open weights move the bill. They don't delete it."**

### Host Notes

- Ask Mitchell: what would you route local-first tomorrow?
- Do not get stuck installing live. Show the paths, then test.

## Talking Points — The Bill Picks The Route

### Segment Thesis

Local is not free. It changes where the bill lands.

### Talking Points

- Pull up [OpenAI gpt-oss](https://openai.com/index/introducing-gpt-oss/). Point: 20B wants 16GB memory, 120B wants an 80GB GPU.
- Pull up [Ollama FAQ](https://docs.ollama.com/faq). Run `ollama ps`; if it spills to CPU, the workflow is not really GPU-fast.
- Pull up [NVIDIA RTX 4090 specs](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/). Receipt: 450W total graphics power, 19W idle, 850W recommended system power.
- Estimate: `(watts / 1000) * hours * kWh price`. Example: 450W for 4h/day at $0.14/kWh is about $7.50/month GPU-only. 800W 24/7 is about $81/month.
- Hosted check: [AWS Bedrock pricing](https://aws.amazon.com/bedrock/pricing/) and [OpenRouter pricing](https://openrouter.ai/pricing). Token bills scale with loops; electricity scales with hours and watts.
- Clip line: **"The local bill moved from Stripe to the power company."**

### Host Notes

- Ask Mitchell: would you rather debug GPU heat or token invoices?
- Don't pretend local is cheaper until the machine is measured.

## Talking Points — Benchmarks Pick The Shortlist

### Segment Thesis

Benchmarks shortlist models. The repo decides.

### Talking Points

- Pull up [Artificial Analysis](https://artificialanalysis.ai/leaderboards/models). Use it to filter speed, price, quality.
- Pull up [Aider leaderboard](https://aider.chat/docs/leaderboards/). Use it for coding edits.
- Pull up [SWE-bench](https://www.swebench.com/). Use it for repo repair context.
- Red line: if it cannot patch your repo and recover from failure, the leaderboard does not matter.
- Clip line: **"Benchmarks get the model an interview. Your repo hires it."**

### Host Notes

- One chart, then terminal. Do not table-read.

## Talking Points — The Live Test

### Segment Thesis

One small repo task. Same ask. Compare the damage.

### Talking Points

- Task: inspect repo, patch one small thing, run test, explain risk.
- Path A: local via Ollama / LM Studio.
- Path B: hosted via Bedrock / OpenRouter.
- Score: right files, clean diff, tests, recovery, latency, cost.
- If it fails, good. That shows where frontier still earns the bill.
- Clip line: **"The diff is the benchmark."**

### Host Notes

- Keep the task small. A huge live refactor turns into setup pain.
- Don't let chat turn it into "my favorite model is better." Keep it workflow-scored.

## Closing Take

> "Open models are not replacing frontier models tonight."
>
> "They are the fallback layer."
>
> "Use frontier when the work is hard. Use hosted open when you need managed fallback. Use local when you need control."
>
> "The architecture is routing, not loyalty."

## Sources — Primary Receipts

### Model Access And Availability

- [Anthropic: Claude Fable 5 and Claude Mythos 5](https://www.anthropic.com/news/claude-fable-5-mythos-5) — official Fable/Mythos page. Pull up current availability state and pricing/access language.
- [OpenAI: Previewing GPT-5.6-Sol](https://openai.com/index/previewing-gpt-5-6-sol/) — official GPT-5.6 preview framing. Use this as the "exists, but not generally usable by everyone" receipt.
- [OpenAI: Introducing gpt-oss](https://openai.com/index/introducing-gpt-oss/) — official open-weight model release. Pull up 20B/120B positioning.

### Local

- [OpenAI: Introducing gpt-oss](https://openai.com/index/introducing-gpt-oss/) — 20B memory target and 120B single-80GB-GPU framing.
- [Ollama: gpt-oss:20b](https://ollama.com/library/gpt-oss%3A20b) — Ollama model page and local memory framing.
- [Ollama: OpenAI compatibility](https://docs.ollama.com/api/openai-compatibility) — local OpenAI-compatible endpoint.
- [Ollama FAQ: check CPU/GPU split](https://docs.ollama.com/faq) — use `ollama ps` to verify whether the model is actually on GPU.
- [LM Studio: Local server](https://lmstudio.ai/docs/developer/core/server) — local server and API docs.
- [vLLM quickstart](https://docs.vllm.ai/en/latest/getting_started/quickstart/) — OpenAI-compatible serving path for GPU boxes.

### Hardware / Electricity

- [NVIDIA RTX 4090 official specs](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/) — use as a concrete 450W GPU / 850W system-power receipt.
- [NVIDIA-SMI manual](https://docs.nvidia.com/deploy/nvidia-smi/index.html) — use `power.draw`, `memory.used`, and utilization to measure the actual run.
- [Energy.gov: estimating electronic energy use](https://www.energy.gov/energysaver/estimating-appliance-and-home-electronic-energy-use) — formula for watts, hours, kWh, and cost.
- [EIA electricity monthly update](https://www.eia.gov/electricity/monthly/update/end-use.php) — current U.S. average revenue per kWh; use local rate for real math.
- [Omni electricity cost calculator](https://www.omnicalculator.com/everyday-life/electricity-cost) — fast on-stream calculator for watts, hours, rate, monthly cost.
- [Seasonic PSU wattage calculator](https://seasonic.com/wattage-calculator/) — sanity-check total system power before recommending a local GPU build.

### Hosted

- [AWS Bedrock: What is Amazon Bedrock?](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html) — managed model service framing.
- [AWS Bedrock pricing](https://aws.amazon.com/bedrock/pricing/) — model/provider/tier-specific hosted cost reference.
- [AWS Bedrock: Supported foundation models](https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html) — model catalog.
- [AWS Bedrock: Converse API](https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html) — one API surface across chat models.
- [OpenRouter pricing](https://openrouter.ai/pricing) — pay-as-you-go hosted-routing pricing reference.

### Benchmarks

- [Artificial Analysis model leaderboard](https://artificialanalysis.ai/leaderboards/models) — broad intelligence, price, speed comparison.
- [Aider LLM leaderboard](https://aider.chat/docs/leaderboards/) — code editing benchmark; use as practical coding filter.
- [SWE-bench](https://www.swebench.com/) — code repair benchmark context.

## Sources — Social Proof

### X / Twitter To Pull Up

- [The New Stack on Fable/open-weight response](https://x.com/thenewstack/status/2067608410611229186) — bridge from blocked Fable to open models.
- [Claire Vo on GLM 5.2 as Claude Code default](https://x.com/clairevo/status/2069828122640548204) — builder switching signal.
- [Hooeem: GLM 5.2 with Claude Code / Anthropic SDK / LM Studio](https://x.com/hooeem/status/2068989788485480682) — practical setup/social proof.
- [Mark Watson: Claude Code with gpt-oss-20b on Ollama](https://x.com/mark_l_watson/status/2014694705288638611) — local coding workflow angle.
- [Tomasz Tunguz: burned Claude Code credits, considered GPT-OSS local](https://x.com/ttunguz/status/1988725222309347487) — legit cost-pressure receipt.
- [Rohit Ghumare: Claude Code locally with Ollama](https://x.com/ghumare64/status/2013974925694914941) — setup/social proof.
- [ayemojubar: local LLM orchestration layer for Claude Code powered by Ollama](https://x.com/ayemojubar/article/2066488612745523372) — routing-layer example.
- [rewind: AI bill to electricity bill anecdote](https://x.com/rewind02/status/2070090064453828624) — viral cost framing; verify live before treating as fact.

### Credible Non-X Local Receipts

- [Simon Willison: LLM 0.26 tools with local models from Ollama](https://simonw.substack.com/p/large-language-models-can-run-tools) — credible local-model tool-use receipt.
- [Simon Willison: gpt-oss write-up](https://simonwillison.net/2025/Aug/5/gpt-oss/) — open-weight model context from a serious practitioner.
- [Tomasz Tunguz LinkedIn mirror](https://www.linkedin.com/posts/tomasztunguz_by-monday-lunch-i-had-burned-through-my-activity-7394492130787954688-XmKE) — readable version of the Claude credits / GPT-OSS local cost post.

### Reddit Threads To Pull Up

- [r/LocalLLaMA: I'm tired of Claude limits, what's the best alternative?](https://www.reddit.com/r/LocalLLaMA/comments/1pggss8/im_tired_of_claude_limits_whats_the_best/) — audience pain.
- [r/LocalLLaMA: Real-world open source alternatives to Opus 4.6](https://www.reddit.com/r/LocalLLaMA/comments/1sw2gew/realworld_open_source_alternatives_to_the_now/) — reality check, not just hype.
- [r/LocalLLaMA: Best Local LLMs - Apr 2026](https://www.reddit.com/r/LocalLLaMA/comments/1sknx6n/best_local_llms_apr_2026/) — hardware/model picks.
- [r/LocalLLaMA: coding agent software for local models](https://www.reddit.com/r/LocalLLaMA/comments/1rbmnw7/is_there_any_good_coding_agent_software_for_use/) — tools around local models.

### YouTube Videos To Pull Up

- [How I AI: GLM 5.2 is SO GOOD (and almost free)](https://www.youtube.com/watch?v=ZoBfQZ5utQk) — the reference vibe for this episode: set up an open model, run it against real code, then talk cost and capability.
- [How to use GPT-OSS locally, step by step](https://www.youtube.com/watch?v=tiW3e9sNlGY) — beginner install reference.
- [OpenAI's Opensource OSS 120B and 20B, fully tested](https://www.youtube.com/watch?v=w_1ZIXdDxlQ) — model test reference.
- [FREE Local AI Coding FOREVER](https://www.youtube.com/watch?v=Y3oe0QTSJgE) — local coding workflow hook.
- [Connect LM Studio Models to VS Code](https://www.youtube.com/watch?v=l3hcewcrYjo) — IDE setup path.
- [Best Open-Source Coding Model? GLM vs DeepSeek vs MiniMax vs Kimi](https://www.youtube.com/watch?v=0SZ6mVWTxQA) — benchmark battle segment.
- [Deploy a fine-tuned LLM from Hugging Face to Amazon Bedrock](https://www.youtube.com/watch?v=r0YCm8XWO7I) — Bedrock deployment path.

## Tweets — Paste Live

> Fable is blocked. GPT-5.6 is preview. The best model is useless if you cannot call it. Tonight: local models, Bedrock, benchmarks, one repo test.

> Open models are not magic. They are routing. Frontier for hard work. Hosted open for fallback. Local for control.

> Open weights move the bill. They do not delete it.

> Benchmarks tell you who gets an interview. Your repo decides who gets the job.

> The diff is the benchmark.
