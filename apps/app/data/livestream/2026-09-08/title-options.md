# Title options — 2026-09-08 (stream day)

Format is now a **comparison stream**: Claude Fable 5.1 vs GPT-6 Astra. Vincent's steer: something in the shape of "Fable 5.1 vs GPT Astra: Did we reach AGI?"

The AGI hook is real and sourced. OpenAI shipped Astra on 3 September and Greg Brockman called it a generational leap that could eventually be seen as the arrival of artificial general intelligence. Chase AI, who tested it first-hand, refuses the word: "I'm not going to say like AGI, because who even like the definition of AGI changes day by day." That tension is the episode.

Frontmatter holds option 1 as a placeholder. Vincent picks. Draft only.

## The ten

1. `[LIVE] Fable 5.1 vs GPT-6 Astra: Did We Just Reach AGI?` (55)
2. `[LIVE] They Called It AGI. We Spent $65 Finding Out.` (52)
3. `[LIVE] Fable 5.1 vs Astra: Three Testers, Three Winners` (55)
4. `[LIVE] Is GPT-6 Astra AGI? We Ran It On Our Own Tests.` (54)
5. `[LIVE] Astra vs Fable 5.1: The Prettier One Failed The Audit` (61)
6. `[LIVE] We Ran GPT-6 Astra For 67 Minutes. It Cost $65.` (54)
7. `[LIVE] Fable 5.1 vs GPT-6 Astra: Nobody Agrees Who Won` (54)
8. `[LIVE] $10,000 On Fable 5.1 In One Week. Was It Worth It?` (57)
9. `[LIVE] Fable 5.1 vs Astra: We Ran The Test Nobody Ran` (53)
10. `[LIVE] AGI Or A $65 Invoice? Fable 5.1 vs GPT-6 Astra` (53)

## Which to pick

- **Recommendation: option 1.** It is Vincent's own framing, it carries the launch-week search term, and the episode genuinely answers it with first-hand evidence rather than vibes.
- **Option 5 is the differentiated one.** It is the only title on YouTube today that could be backed by our result: Astra's front-end work is the thing every reviewer praised, and it failed our automated accessibility gates on two of three front-end tasks. Nobody else ran that check.
- **Option 3 and 7** sell the honest finding: three careful testers published three different verdicts in the same week.
- Option 8 leans on BridgeMind's spend, which is his number, not ours. Only use it if we are clearly quoting him on screen.

## The evidence behind the titles

First-hand, from our own run on the Mac Studio this morning, `v2026.09`, `codex:gpt-6-astra@high`, all 7 tasks, one attempt:

| task | status | cost | min | gates | failed gate |
|---|---|---|---|---|---|
| backend/inventory-api | gate_failed | $3.63 | 6.7 | 1/2 | migrate |
| bugfix/date-range-overlap | ok | $3.04 | 1.9 | 2/2 | — |
| frontend/issue-board-filters | ok | $11.98 | 6.5 | 4/4 | — |
| planning-audit/planted-defects | ok | $3.75 | 6.6 | 0/0 | — |
| signature/landing-hero | ok | $10.70 | 7.3 | 2/2 | — |
| taste/landing-page-themes | ok | $14.29 | 18.7 | 2/3 | axe-themes |
| ux-ui/pricing-page | gate_failed | $18.11 | 19.5 | 2/3 | axe-pricing |

**$65.50 total, 67.2 minutes, 5 of 7 clean, 2 gate failures.** Two of the three failed gates are accessibility. Objective score of 100 on the bug fix, 55.6 on the frontend build.

Caveat that must be said on air: this is Astra at **high** effort against a smoke release that ran Codex on the previous model at **low** effort for $18.45. Those are not comparable numbers. Fable 5.1 has not been run yet, because the Studio does not have the Claude CLI installed.

Do not pick in this file. Vincent picks.
