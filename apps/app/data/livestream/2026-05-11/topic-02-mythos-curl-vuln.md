---
title: "AI Found a Bug in curl. Hackers Found a Zero-Day. Same Week."
slug: "mythos-curl-vuln"
source: "Daniel Stenberg, HN, Google Threat Intelligence, Bloomberg"
status: "backlog"
date: "2026-05-11"
thumbnail_prompt: null
---

## Talking Points — Episode Context

### Segment Thesis

Okay, so this segment is about Episode Context.

### Talking Points

Segment 2 of 5. Pivots from "AI can't write code" to "AI can read code better than humans." The security angle — AI offense vs defense.

**Thread from Seg 1:** Backlash says AI coding is broken → but AI is finding real bugs in foundational software
**Thread to Seg 3:** "So AI is finding bugs, AI is exploiting bugs, and the companies building these tools are spending billions to scale them. SpaceX just gave Anthropic 220,000 GPUs. Elon's also buying Cursor for $60 billion. Let me explain why."

---

### Host Notes

- Ask Mitchell:
- Pull up:
- Don't pretend:

## Cold Open

"Daniel Stenberg created curl 28 years ago. It runs on every device on earth. Your phone, your server, your car, your TV. Billions of installs.

Today he wrote a blog post: 'Mythos finds a curl vulnerability.'

Anthropic's Claude Mythos model found a real bug in curl. Not a hallucination. A real, confirmed vulnerability.

Same day — Google's threat intelligence team confirms hackers used AI to discover a zero-day and exploit it at scale. First time ever.

AI is now finding bugs faster than humans. On both sides of the fence."

## Sources

- Daniel Stenberg blog (today): https://daniel.haxx.se/blog/2026/05/11/mythos-finds-a-curl-vulnerability/
  - HN: 587 points, 244 comments
- Google/Bloomberg — hackers used AI for zero-day (today): https://www.bloomberg.com/news/articles/2026-05-11/hackers-used-ai-to-build-zero-day-attack-google-researchers-say
- EU regulatory push: OpenAI offering GPT-5.5 Cyber for testing, Anthropic less cooperative
- White House drafting exec order to vet AI models (May 7): FDA-style approval process

## Talking Points — Mythos + curl (4 min)

### Segment Thesis

Okay, so this segment is about Mythos + curl (4 min).

### Talking Points

- Claim: AI models are finding real vulnerabilities in foundational open-source software.
- Receipt: Claude Mythos found a real vuln in curl. Daniel Stenberg confirmed and blogged it today. 587 points on HN.
- curl runs on billions of devices. This isn't a toy repo. This is infrastructure.
- Mythos is Anthropic's most controversial model — 244-page system card, sandbox escape tests (covered on our April 7 show). Now it's finding real bugs.
- Context: AI has been claimed to find bugs before. The difference is the curl maintainer himself confirmed this one. That's signal.
- Why it matters: If AI can audit curl, it can audit any codebase. Security review cost just dropped to near-zero. But so did the cost of finding exploitable bugs.

### Host Notes

- Ask Mitchell:
- Pull up:
- Don't pretend:

## Talking Points — The Other Side: Google Zero-Day (3 min)

### Segment Thesis

Okay, so this segment is about The Other Side: Google Zero-Day (3 min).

### Talking Points

- Claim: Hackers used AI to discover AND exploit a zero-day at scale. First confirmed case.
- Receipt: Google Threat Intelligence, reported by Bloomberg today.
- Not just AI-written malware. AI found the vulnerability itself. New capability threshold.
- Same week: US government announced deals with Google, Microsoft, xAI to test AI models before public release (May 5). White House drafting "FDA-style" vetting for new AI models (May 7).
- EU pushing for regulatory access to frontier models. OpenAI offering GPT-5.5 Cyber for testing. Anthropic "less cooperative."
- Stakes: This is why governments are scrambling. Offense capabilities are scaling faster than defense.

### Host Notes

- Ask Mitchell:
- Pull up:
- Don't pretend:

## Talking Points — What This Means for Devs (3 min)

### Segment Thesis

Okay, so this segment is about What This Means for Devs (3 min).

### Talking Points

- Connects back to Segment 1: People worried AI can't write code. The bigger worry might be that AI can READ your code too well.
- Every codebase is now a target surface for AI-powered auditing — by security researchers AND by attackers.
- Cursor had a patched vuln this month: malicious git repo could trigger arbitrary code execution through the AI agent. New attack class: poisoning repos that AI tools read.
- Operator take: Ship with AI, but also audit with AI. The tools cut both ways.
- Clip line: "curl got audited by Claude. Your codebase is next. Question is: who gets there first — your security team or someone else's AI?"

### Host Notes

- Ask Mitchell:
- Pull up:
- Don't pretend:

## Talking Points — Transition to Segment 3

### Segment Thesis

Okay, so this segment is about Transition to Segment 3.

### Talking Points

"So AI is finding real bugs. AI is being weaponized. The capability is scaling fast. And the companies know it. That's why the money is insane right now. This week, Anthropic partnered with SpaceX to get 220,000 GPUs. Elon Musk has a $60 billion option to buy Cursor. Nvidia passed $40 billion in AI bets this year. Let me show you the numbers."

### Host Notes

- Ask Mitchell:
- Pull up:
- Don't pretend:

## Talking Points — Host Notes

### Segment Thesis

Okay, so this segment is about Host Notes.

### Talking Points

- Push on: The dual nature — same capability, offense vs defense.
- Avoid: Don't oversell doom. Mythos finding a curl bug is genuinely good for security.
- Pull up: Daniel Stenberg's blog post, Bloomberg headline.

### Host Notes

- Ask Mitchell:
- Pull up:
- Don't pretend:
