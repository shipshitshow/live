---
title: "Everyone Says AI Coding Is a Trap. Are They Right?"
slug: "agentic-coding-trap"
source: "Theo (t3.gg), Lars Faye, k10s devlog, HN"
status: "backlog"
date: "2026-05-11"
thumbnail_prompt: null
---

## Talking Points — Episode Context

### Segment Thesis

Okay, so this segment is about Episode Context.

### Talking Points

Segment 1 of 5. Opens the show. Sets up the central question of the episode: AI coding tools won — now the real problems start. Each segment explores a different angle of that thesis.

**Episode arc:** Backlash (Seg 1) → AI finds real bugs (Seg 2) → SpaceX/Cursor $60B deal + Anthropic compute (Seg 3) → Local AI revolt (Seg 4) → Is your career safe? (Seg 5)

**Thread to next segment:** "So people say AI coding is broken. But what if AI is actually better at finding bugs than writing code? That's literally what happened today with curl."

---

### Host Notes

- Ask Mitchell:
- Pull up:
- Don't pretend:

## Cold Open — READ THIS

"Theo just dropped a video called 'We all fell for it.' 116,000 views in one morning. 665 comments.

Hacker News has a post with 890 points: 'I'm going back to writing code by hand.'

Another blog going viral right now calls agentic coding a trap.

This is the biggest backlash wave against AI coding we've seen. And it all landed this weekend.

I ship an entire product — this dashboard, this show, everything — with zero hand-written code. Every line AI-generated. Claude Code, agents, the whole stack.

So either I'm the idiot, or they're missing something.

Today we're going to go through every big AI story from this week. Five segments. Each one tests whether AI coding actually works or whether we all fell for it. Let's find out."

## Sources

- Theo (t3.gg): "We all fell for it…" — 116K views, 665 comments, published today
  - https://www.youtube.com/watch?v=lNVa33qUzZ8
  - Reacting to: https://larsfaye.com/articles/agentic-coding-is-a-trap
- HN: "I'm going back to writing code by hand" — 890 points, 557 comments
  - Blog: https://blog.k10s.dev/im-going-back-to-writing-code-by-hand/
- Simon Willison (May 6): "Vibe coding and agentic engineering are getting closer than I'd like"
  - https://simonwillison.net/2026/May/6/vibe-coding-and-agentic-engineering/

## Talking Points — The Backlash Wave (3 min)

### Segment Thesis

Okay, so this segment is about The Backlash Wave (3 min).

### Talking Points

- Claim: Three separate pieces blew up today/this week saying agentic coding fails.
- Receipt: Theo 116K views in hours. HN post 890 points. Lars Faye blog viral. Simon Willison posted about it May 6.
- k10s author built Kubernetes TUI entirely with Claude. 234 commits, 1,690 lines. God object consumed itself.
- Five specific failures: no architecture, god objects, scope creep, positional data, unsafe concurrency.
- Lars Faye thesis: agentic coding is a trap — productive and fun but the downsides compound.
- Simon Willison (respected voice): "Vibe coding and agentic engineering are getting closer than I'd like" — worried the line between skilled and unskilled AI use is blurring.
- Why it matters: Not just randos. Theo (2M+ subs), Simon Willison, HN front page. The mainstream dev community is questioning AI coding this week.

### Host Notes

- Ask Mitchell:
- Pull up:
- Don't pretend:

## Talking Points — The Counter-Take (4 min)

### Segment Thesis

Okay, so this segment is about The Counter-Take (4 min).

### Talking Points

- Claim: The backlash isn't about AI coding failing. It's about AI coding without architecture failing.
- Receipt: k10s author's own fix — write architecture specs in CLAUDE.md before coding. That's literally what we do.
- Pull up our CLAUDE.md live. Show the architecture rules, typed packages, shared UI primitives.
- This product — the dashboard you're looking at right now — all AI-generated, all structured.
- Theo isn't anti-AI either. He shipped T3 Code (free open-source AI coding agent). He posted "how I use AI to code" for experienced devs — vibe coders took it personally in 5 minutes.
- The consensus forming: AI coding works when experienced devs drive it. Fails when nobody drives it.
- Operator take: Vibe coding without guardrails is driving without a seatbelt. The car isn't the problem.

### Host Notes

- Ask Mitchell:
- Pull up:
- Don't pretend:

## Talking Points — The Real Question (3 min)

### Segment Thesis

Okay, so this segment is about The Real Question (3 min).

### Talking Points

- The "80/20 problem": AI-generated code works brilliantly for the first 80%. Last 20% — edge cases, integrations, production hardening — is where projects die.
- That last 20% requires exactly the coding skills these tools promised you wouldn't need.
- February 2026: dev community consensus crystallized that vibe coding is a "Tier-2 tool."
- But: is that actually bad? A tool that does 80% and needs a skilled operator for 20% is still a massive productivity multiplier.
- Clip line: "Everyone blaming the tool. Nobody blaming the architect. Because there wasn't one."

### Host Notes

- Ask Mitchell:
- Pull up:
- Don't pretend:

## Talking Points — Transition to Segment 2

### Segment Thesis

Okay, so this segment is about Transition to Segment 2.

### Talking Points

"So the backlash says AI can't write good code. But here's the twist — what if AI is actually better at reading code than writing it? Because today, Daniel Stenberg — the guy who created curl 28 years ago — just confirmed that Anthropic's Mythos model found a real vulnerability in curl. And Google confirmed hackers used AI to find a zero-day. AI isn't just writing code now. It's auditing it. On both sides."

### Host Notes

- Ask Mitchell:
- Pull up:
- Don't pretend:

## Talking Points — Host Notes

### Segment Thesis

Okay, so this segment is about Host Notes.

### Talking Points

- Push on: Your zero-code workflow as living proof this works with guardrails.
- Avoid: Don't dunk on the k10s author — their conclusion (write CLAUDE.md first) is YOUR workflow. Agree with them.
- Pull up: Theo's video thumbnail, the HN thread, your own CLAUDE.md.

### Host Notes

- Ask Mitchell:
- Pull up:
- Don't pretend:

## Tweets — Paste Live

**Tweet 1:**
> Theo dropped "We all fell for it" today. 116K views. HN has "I'm going back to hand-coding" at 890 points. The agentic coding backlash hit this weekend. My take: the tool isn't the problem. The missing architect is.

**Tweet 2:**
> The k10s author's fix for "AI coding doesn't work" is literally: write architecture specs in CLAUDE.md before coding. That's exactly what we do. Every session. The backlash is proving the workflow right.
