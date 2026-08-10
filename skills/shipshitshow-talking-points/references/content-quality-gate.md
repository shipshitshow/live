# Content Quality Gate

Use this gate to decide whether a Ship Shit Show topic, transcript, livestream, or edited video is worth publishing, clipping, or rewriting.

## Verdict Levels

- **Publish:** Strong hook, clear thesis, enough receipts, useful viewer takeaway.
- **Publish after trim:** Good material exists, but replay value is hurt by setup, drift, or buried thesis.
- **Clip only:** One or two strong moments, but the full piece lacks structure or payoff.
- **Rewrite:** Topic has potential, but the audience value is not clear yet.
- **Drop:** No distinctive operator insight beyond generic AI commentary.

## Minimum Publish Gate

The piece must answer all six:

1. **Whose problem is this?** A business problem, stated the way the person with it would state it.
2. **What did we build?** The thing made on air, including what failed.
3. **Does it run?** A demo result, plus an honest account of what is rough.
4. **What is the receipt?** A number, quote, demo, bill, transcript moment, failure, or first-hand test.
5. **What is the artifact?** The repo, template, playbook, or deployed demo that exists afterwards, and where it is published.
6. **What should the viewer do?** Take the artifact, copy the approach, or reach out.

If any answer is missing, fix the segment before publishing.

An episode with a great take and no artifact is **Clip only** at best under this gate. Under the previous format it would have passed — that is the change.

## Jargon Gate

Applies to every piece, and hard-blocks clips.

- Any spoken line containing a bare model version ("4.8", "4.6", "K2") or an unexplained acronym (MCP, RAG, CLI) is not clippable. Clip selection must skip it or the clip is unusable outside the AI audience.
- A first mention that spells the term out, followed by shorthand, is fine.
- If more than a handful of lines in a transcript fail this, mark the piece **Publish after trim** and list the offending terms so the next episode fixes them at the source.

The producer dashboard scores this automatically once the plain-language criterion lands in the transcript scorecard.

## Scoring Lens

Use the transcript rate-card categories:

| Category | Pass Standard |
| --- | --- |
| Hook | The first 30-45 seconds create tension or a clear promise. |
| Structure | Each segment proves one thing and transitions cleanly. |
| Signal | Useful insight beats filler, setup, and repeated explanation. |
| Specificity | Named tools, dates, numbers, costs, failures, repos, or quotes appear early. |
| Delivery | Spoken flow is direct enough to survive replay and clips. |
| Audience Value | Viewer leaves with a decision, workflow rule, warning, or usable frame. |

## Replay Penalties

These do not always hurt live viewers, but they hurt replay:

- "Are we live?" before the thesis.
- audio checks, streaming checks, retweeting, chat greetings in minute one.
- "How was your week?" before the topic.
- explaining why there is no intro.
- host confusion about the opening.
- jokes that delay the claim instead of sharpening it.

If the first minute has two or more replay penalties, mark as **Publish after trim** at best.

## Clip Potential Test

Every segment should produce at least one line that can stand alone.

Good clip lines:

- make a claim
- contain a concrete noun
- compress the thesis
- can become a tweet/title
- do not require five minutes of context

Weak clip lines:

- "It's insane."
- "That's crazy."
- "We'll see."
- "It depends."
- "AI is moving fast."

## Rewrite Recipe

When a piece is good but buried:

1. Pull the strongest claim from anywhere in the transcript.
2. Move it to the first sentence.
3. Add the best receipt immediately after it.
4. Cut live logistics from the replay opening.
5. Rebuild segments as `Claim -> Receipt -> Operator take -> Clip line -> Transition`.
6. End with the decision or warning, not a summary.

## Editorial Bar

Worth viewing means the audience gets proof of competence they cannot get from a launch post or a consultant's deck.

The show should never merely say:

```text
This launched. Here are the features. It is cool.
```

It should say:

```text
Here is a problem that costs businesses money. We built the fix live, it broke here, it runs like this, it costs this much a month, and the code is public — take it.
```

The old bar — "we tried the launch and here is where it lies" — is still valid **inside** a build episode as a reaction segment. It is no longer sufficient on its own.
