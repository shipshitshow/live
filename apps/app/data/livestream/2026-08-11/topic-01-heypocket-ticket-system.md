---
title: "[LIVE] We Turn Every Phone Call Into A Ticket"
slug: "heypocket-ticket-system"
source: "HeyPocket, Mantella, HeyPocket public API and webhook documentation"
status: "in_progress"
date: "2026-08-11"
announcement_tweet: null
thumbnail_prompt: null
---

## Sources — Livestream Notes

- Title: **[LIVE] We Turn Every Phone Call Into A Ticket**
- Build: HeyPocket call summaries → Mantella support tickets
- Start: **4:00 PM**
- Format: live build, English only, 60–90 minutes
- Artifact: working HeyPocket webhook + API fallback inside Mantella
- HeyPocket webhook documentation: https://docs.heypocketai.com/docs/api/webhooks
- Privacy rule: only process recordings created at or after `2026-08-11 14:00:00 Europe/Amsterdam`
- Never show `.env` values, the full production webhook URL, private historical calls, or real customer conversation content.

## Cold Open — Read This

> "A phone call ends. The notes exist. The action items exist. And then somebody still has to copy all of it into the ticket system by hand. That handoff is the problem. Today we are removing it live. We will take a HeyPocket call, wait for the summary, create the support ticket automatically, put the duration at the top, turn every action item into a to-do, and prove the same call cannot create two tickets. If it works, the integration ships. If it breaks, that is the show. Let's go."

## Summary

HeyPocket already turns a phone call into a transcript, summary, and action items. The missing piece is the operational handoff. Today we build that handoff live: a verified webhook creates an idempotent Mantella support ticket, an API sync command catches missed events, and a hard timestamp cutoff protects private historical recordings. The minimum proof is a ticket with call duration, summary, and two to-dos. The stretch proof links a customer, emails the summary, and creates a work task from the call.

## Talking Points — The Notes Exist But The Work Still Gets Lost

### Segment Thesis

The phone call is already captured; the expensive failure is everything that still happens manually after the call.

### Talking Points

- HeyPocket creates the transcript, summary, and action items after every call.
- Today those outputs still have to cross into the support system. That copy-and-paste handoff is where tasks disappear and follow-ups get delayed.
- The build target is simple to explain: call ends → summary completes → ticket appears.
- The ticket must show call duration first, then the summary, then each action item as a real ticket to-do.
- Pocket is not the customer database and does not give us reliable caller identification. Customer matching is our responsibility.
- Clip line: **"The call is recorded. The work is not — until it reaches the system where somebody can act on it."**
- Transition: the business problem is the handoff; now define the smallest system that removes it without leaking a private call.

### Host Notes

- Ask Mitchell: where do call notes disappear in a real agency or support workflow?
- Pull up: a blank Mantella ticket list, then the HeyPocket call summary.
- Don't pretend: automatic customer matching is solved. It is a stretch path with a manual fallback.

## Talking Points — Webhook First, API As Reconciliation

### Segment Thesis

The webhook makes the workflow fast; the API sync makes it trustworthy.

### Talking Points

- Primary event: `summary.completed` hits `POST /webhooks/heypocket`.
- Verify the webhook signature using the Pocket-documented headers and fail closed outside local development.
- Use `recording.id` as the idempotency key because webhook delivery is at least once, not exactly once.
- Enforce the minimum recording timestamp before ticket creation. Anything older returns HTTP 200 and creates nothing.
- Reuse the same ingest service for the webhook and `php artisan heypocket:sync`; one mapping, two delivery paths.
- Never log full transcripts at info level and never print API keys or webhook secrets.
- Clip line: **"Webhooks give you speed. Reconciliation gives you sleep."**
- Transition: once delivery and privacy are boring, the real proof is whether the ticket is useful without somebody cleaning it up.

### Host Notes

- Pull up: existing webhook route, controller, ticket, and to-do patterns in the Mantella codebase.
- Say plainly: idempotent means Pocket can send the event twice and Mantella still creates one ticket.
- Don't show: secret values or the full production webhook domain.

## Talking Points — A Useful Ticket, Not A Transcript Dump

### Segment Thesis

The artifact is not a transcript archive; it is a support ticket somebody can act on immediately.

### Talking Points

- Ticket source is `heypocket` and call duration is the first line of the description.
- The generated summary becomes the readable ticket body.
- Pocket action items become `ticket_todos`, not a paragraph somebody has to parse again.
- A duration badge and HeyPocket source indicator make the ticket recognizable at a glance.
- If customer matching is unclear, leave it unlinked and provide a visible manual link control.
- Stretch actions only start after the minimum ticket path works: email the clean summary and create a linked work task.
- Clip line: **"A transcript is evidence. A ticket is work."**
- Transition: the fake payload proves the system; the real call proves the workflow survives contact with the product.

### Host Notes

- Pull up: the created ticket and point at duration, summary, source, and two to-dos in that order.
- Ask Mitchell: what would a client need before trusting this in production?
- Don't pretend: the full transcript should be emailed by default. The summary is the safe default.

## Talking Points — One Real Call Is The Receipt

### Segment Thesis

The episode succeeds when a new call becomes one clean ticket and an older call becomes nothing.

### Talking Points

- Run the safe fake payload first so a slow Pocket summary cannot kill the demo.
- Re-send the identical payload and show there is still exactly one ticket.
- Make the real demo call after the privacy cutoff and wait for Pocket to generate the summary.
- Refresh Support → Tickets and show the call duration, summary, and action items.
- Optional privacy proof: send a payload from before the cutoff and show that no ticket appears.
- State what is rough: customer linking, email delivery, and task creation are stretch paths unless the minimum proof is green.
- Clip line: **"The best privacy demo is the record that never enters your system."**
- Transition: ship the working path, publish the playbook, and leave the polish for after the proof.

### Host Notes

- Demo line: "This is a demo call with Google about DNS settings for google.com. To-do: update the A record and reply to the customer."
- Pull up: the ticket list before the call and after the summary event.
- Recovery rule: if production delivery is slow, finish with the signed local payload and show the same ingest path.

## Closing Take

The problem was not recording a call. HeyPocket already did that. The problem was turning the result into work without another person copying it by hand. We built the webhook, the reconciliation path, the privacy cutoff, and the ticket mapping live. The artifact is this integration and playbook. Take the pattern, and if phone-call follow-up is still disappearing inside your business, reach out.

## Operator Card

### Live Build Order

- **1 · Fable:** create the implementation plan in read-only mode.
- **2 · Grok:** challenge the plan and return an approval verdict.
- **3 · Grok:** implement the minimum viable path.
- **4 · Fable:** review security, correctness, privacy, and demo readiness.
- **5 · Grok:** fix blocking findings only.
- **6 · Grok:** create and run the safe fake webhook test.
- **7 · Vincent:** make the real Pocket call after the privacy cutoff and show the ticket.
- **8 · Grok:** add customer actions only if the minimum path is green.
- **9 · Everyone:** keep `.env` values, full webhook domain, and private old calls off camera.

### Live Progress

- [ ] F1 plan done
- [ ] G1 approved
- [ ] G2 built
- [ ] F2 reviewed
- [ ] G3 fixed
- [ ] G4 fake ticket works
- [ ] Real Pocket call works
- [ ] Stretch customer actions work

## Pre-show Checklist

### Secrets — Never Paste Values On Stream

- `HEYPOCKET`: application programming interface Bearer key. Say: "The API key is already in `.env`."
- `HEYPOCKET_WEBHOOK_SECRET`: signature verification secret. Say: "The webhook secret is already in `.env`."
- Production webhook URL: say: "Our public webhook endpoint is already configured."

### Confirm Keys Exist With Values Masked

```bash
grep -E '^HEYPOCKET' .env | sed 's/=.*/=***/'
```

### Hard Privacy Rule

- Only process recordings with `createdAt >= 2026-08-11 14:00:00 Europe/Amsterdam`.
- Anything earlier must be ignored with HTTP 200 and no ticket.

### Open Before The Stream

- Integrated development environment on the Mantella repository.
- Terminal and application running.
- Pocket ready for a short call after the cutoff.
- Support → Tickets open.
- Fable and Grok sessions ready.
- This producer page open on the second screen.

## Definition Of Done

### Minimum Viable Build

- Ticket created on `summary.completed`.
- Creation is idempotent on `recording.id`.
- Call duration appears at the top of the ticket.
- Summary appears in the body.
- Action items become `ticket_todos`.
- Ticket source is `heypocket`.
- Private historical recordings are cut off.
- `php artisan heypocket:sync` provides an API fallback.
- All user-facing copy is English.

### Stretch

- Link or change the customer manually.
- Email the clean summary to the linked customer.
- Create a work task from the call ticket.
- Show a call-duration badge in the ticket header.

## Architecture Reference

### Existing Patterns To Copy

- Webhook route: `POST /webhooks/*` in `routes/web.php`.
- Cross-site request forgery exemption: scoped entry in `VerifyCsrfToken.php`.
- Controller style: `GitHubWebhookController`.
- Tickets and to-dos: `Ticket` and `TicketTodo`.
- Tasks: `Task` with `ticket_id`.
- Services: `App\Services\HeyPocket\...`.

### Suggested Files

```text
config/services.php
app/Services/HeyPocket/HeyPocketClient.php
app/Services/HeyPocket/HeyPocketIngestService.php
app/Http/Controllers/Webhooks/HeyPocketWebhookController.php
app/Console/Commands/HeyPocketSyncCommand.php
database/migrations/xxxx_heypocket_recordings.php
routes/web.php
app/Http/Middleware/VerifyCsrfToken.php
lang/en/support.php
resources/views/backend/support/tickets/...
```

### 60–90 Minute Run Of Show

- **0 · Intro · Vincent · 3 min:** problem and goal.
- **1 · Plan · Fable · 10–15 min:** design document.
- **2 · Plan check · Grok · 5–8 min:** approval verdict.
- **3 · Build · Grok · 25–35 min:** webhook and ticket minimum viable path.
- **4 · Review · Fable · 8–10 min:** security and correctness findings.
- **5 · Fix · Grok · 5–10 min:** blocking issues only.
- **6 · Live test · Vincent · 10–15 min:** call to ticket.
- **7 · Stretch · Grok · remaining time:** link, email, and task actions.

## Copy Paste Prompt — F1 Create Implementation Plan

```text
You are Fable, a senior software architect. Work in READ-ONLY / plan mode only. Do not implement code yet.

Context:
We are live-building a HeyPocket (heypocket.com / public.heypocketai.com) integration into this Laravel app's support ticket system.

Product goals (English UI only):
1) Webhook endpoint receives Pocket events (primary: summary.completed).
2) Create a support ticket with:
   - Call duration clearly at the top
   - Summary notes in the ticket body
   - Pocket action items as ticket to-dos (ticket_todos)
3) API client + artisan sync command as fallback / manual sync.
4) Customer linking when possible; if unclear, allow easy manual linking in the UI.
5) Easy action: send summary email to linked customer.
6) Easy action: create a Task from this call ticket.
7) Anything else that reduces friction after a phone call.

Hard constraints:
- Env already has HEYPOCKET (API key) and HEYPOCKET_WEBHOOK_SECRET. Never print secret values.
- Webhook route path: POST /webhooks/heypocket (CSRF exempt like other webhooks).
- Do NOT process recordings older than 2026-08-11 14:00 Europe/Amsterdam (privacy for the live demo). Ignore them with HTTP 200.
- Follow existing patterns: GitHubWebhookController, Ticket model, TicketTodo, routes/web.php webhooks section, VerifyCsrfToken $except, config/services.php.
- Prefer a small service layer (HeyPocketClient + HeyPocketIngestService).
- Idempotency on recording.id (at-least-once webhooks).
- Language: all user-facing strings English (use lang/en/* and __()).

Please explore the codebase (tickets, todos, existing webhooks, tasks, email sending) and produce a clear implementation plan that includes:
A) Feasibility confirmation against Pocket public docs (API + webhooks).
B) Exact files to add/change.
C) DB migration proposal.
D) Webhook verification approach (HMAC headers as documented by Pocket).
E) Payload → Ticket mapping.
F) Customer matching strategy (simple v1).
G) UI changes for: link customer, send summary, create task.
H) Test plan for the live demo (including a local fake payload test if Pocket is slow).
I) MVP scope vs stretch goals for a live stream.
J) Risks and mitigations.

Output format: structured markdown plan in English. No code files yet. End with a build checklist Grok can execute step by step.
```

## Copy Paste Prompt — G1 Review Fable's Plan

```text
You are Grok. Review the implementation plan Fable just produced for the HeyPocket → Tickets integration.

Goals of your review:
1) Confirm technical feasibility with Pocket's public API/webhooks.
2) Confirm the plan matches THIS Laravel codebase (Ticket, TicketTodo, webhook patterns).
3) Flag security issues (signature verification, secret handling, CSRF, mass assignment).
4) Flag demo risks (private recordings leaking → enforce min recording timestamp).
5) Flag scope creep that will kill a live demo.
6) Propose a strict MVP cut line for the live stream.

Hard rules you must enforce in the approved plan:
- Only recordings with createdAt >= 2026-08-11 14:00 Europe/Amsterdam
- Never log full transcripts with sensitive content at info level in production
- Never echo API keys or webhook secrets
- Idempotent ticket creation on recording.id
- English UI strings only

Output:
- Verdict: APPROVE / APPROVE WITH CHANGES / REJECT
- Required changes (bullet list, prioritized P0/P1/P2)
- Final MVP build order (numbered steps for implementation)
- Stretch goals after MVP

Do not implement code in this step.
```

## Copy Paste Prompt — G2 Implement MVP

```text
You are Grok, implementation agent. Implement the APPROVED HeyPocket MVP in this Laravel codebase.

MVP scope (do these first, fully working):
1) config/services.php heypocket section:
   - api_key from env HEYPOCKET
   - webhook_secret from env HEYPOCKET_WEBHOOK_SECRET
   - base_url https://public.heypocketai.com/api/v1
   - min_recording_at default 2026-08-11T14:00:00+02:00
2) Migration for idempotency + duration (prefer heypocket_recordings table OR unique heypocket_recording_id on tickets — pick one and stick to it).
3) HeyPocketClient: authenticated GET recordings / recording by id.
4) HeyPocketIngestService:
   - parse summary.completed payload
   - enforce min_recording_at cutoff (ignore older)
   - create ticket with English subject/body
   - duration line at top of description
   - create ticket_todos from action items
   - idempotent on recording id
   - source = heypocket
5) HeyPocketWebhookController:
   - verify signature using webhook secret (follow Pocket docs; fail closed in production)
   - handle summary.completed (and optionally recording.created as no-op or deferred)
   - return sensible JSON responses
6) Route POST /webhooks/heypocket + CSRF except entry.
7) Artisan command: php artisan heypocket:sync --since=... that pulls API and runs same ingest rules.
8) English lang keys for any new UI strings.
9) Minimal ticket UI indicators: show call duration if present; badge/source label for heypocket.

Also implement if still fast:
10) Manual "Link customer" already exists? Reuse it; otherwise add a simple customer select on the ticket for unlinked Pocket tickets.
11) Button: "Send summary to customer" (only if customer_id is set) — email via existing mail patterns.
12) Button: "Create task from ticket" — create Task linked to ticket + customer.

Quality bar:
- PSR-12, match existing style
- No secrets in code
- Feature test or at least a unit/feature test for: signature fail, cutoff ignore, idempotent double delivery, happy path ticket + todos
- php artisan migrate works
- Do not process or display private historical recordings

After implementation, print:
- files changed
- how to test with a sample JSON payload via curl (use a FAKE recording id and a createdAt AFTER the cutoff)
- how to run heypocket:sync
- remaining stretch items

Start implementing now.
```

## Copy Paste Prompt — F2 Code Review

```text
You are Fable, code reviewer. Review the uncommitted HeyPocket integration changes.

Check for:
1) Security: webhook signature, CSRF exemption scoped correctly, no secret leakage, request size/DoS basics.
2) Correctness: duration mapping, todos, summary body, idempotency, cutoff 2026-08-11 14:00 Europe/Amsterdam.
3) Code quality: service boundaries, error handling, logging (no sensitive dumps).
4) Product completeness vs MVP: ticket creation, todos, duration at top, API sync command.
5) English-only UI.
6) Missing tests or fragile demo paths.
7) Whether "link customer", "send summary", and "create task" exist or are safely deferred.

Output a review in English:
- Summary (2–3 sentences)
- Blocking issues (must fix before live test)
- Non-blocking improvements
- Test commands to run
- Explicit GO / NO-GO for live Pocket test

Do not rewrite the whole feature unless blocking; prefer a short fix list for Grok.
```

## Copy Paste Prompt — G3 Apply Review Fixes

```text
You are Grok. Apply Fable's blocking review findings for the HeyPocket integration.
Do not expand scope. Fix P0/P1 only, re-run relevant tests, and confirm the demo curl path still works.
When done, give a short English "ready for live test" checklist.
```

## Copy Paste Prompt — G4 Local Fake Webhook Test

```text
Create a safe local test payload for POST /webhooks/heypocket that:
- uses event summary.completed
- has recording.createdAt AFTER 2026-08-11 14:00 Europe/Amsterdam
- has duration 754 seconds
- has a short English summary and 2 action items
- title mentions "Google" so customer matching can try demo customer Google
- does NOT contain real private conversation content

Then:
1) Show me the curl command that signs the body with HEYPOCKET_WEBHOOK_SECRET if required (or how to call in local/dev if signature bypass exists only for local).
2) Run the request against the local app if possible.
3) Confirm a ticket was created with duration, summary, and 2 todos.
4) Also send a second identical request and confirm idempotency (no duplicate ticket).

All output in English.
```

## Copy Paste Prompt — G5 Customer Actions UX

```text
Implement the remaining UX for HeyPocket tickets (English only):

1) On ticket show, if source=heypocket and customer_id is null:
   - prominent "Link customer" control (dropdown of customers)
2) If customer linked:
   - button "Email summary to customer" that sends a clean English email with the call summary (not full private transcript by default)
3) Button "Create task from this call":
   - creates a Task with title from ticket subject, links ticket_id and customer_id, sensible defaults
4) Show call duration badge near the ticket header.

Keep styling consistent with existing ticket UI (shiny silver action buttons / existing patterns).
Add lang/en strings. Brief testing steps at the end.
```

## Live Test Script

### A · Fake Payload First

- Run the G4 signed request.
- Open Support → Tickets.
- Show the duration, summary, and two to-dos.
- Send the same request again and show that there is still one ticket.

### B · Real Pocket Call After The Cutoff

- Put the call on speaker or use the contact microphone.
- Say: "This is a demo call with Google about DNS settings for google.com."
- Say: "To-do: update the A record and reply to the customer."
- Stop the call and wait for Pocket to finish the summary.
- Refresh the ticket list and show the result.
- If available, link the customer, email the summary, and create a task.

### C · Optional Privacy Proof

- Send a safe payload with `createdAt` before the cutoff.
- Show that no ticket is created.

## Safe Sample Payload

```json
{
  "event": "summary.completed",
  "timestamp": "2026-08-11T14:30:00.000Z",
  "user": {
    "id": "user_demo",
    "email": "demo@example.com"
  },
  "recording": {
    "id": "rec_demo_yt_001",
    "title": "Demo call with Google about DNS",
    "description": "YouTube live demo call",
    "duration": 754,
    "language": "English",
    "createdAt": "2026-08-11T14:20:00.000Z"
  },
  "summarizations": {
    "sum_demo": {
      "v2": {
        "summary": {
          "title": "Demo call with Google about DNS",
          "markdown": "Summary: Discussed DNS A-record updates for google.com and next steps for the change window.",
          "bulletPoints": [
            "Confirm current A record",
            "Schedule change window"
          ]
        },
        "actionItems": {
          "actionItems": [
            {
              "id": "ai_1",
              "title": "Update A record for google.com",
              "dueDate": null,
              "status": "TODO",
              "isCompleted": false
            },
            {
              "id": "ai_2",
              "title": "Reply to customer with confirmation",
              "dueDate": null,
              "status": "TODO",
              "isCompleted": false
            }
          ]
        }
      }
    }
  },
  "transcript": [
    {
      "speaker": "Host",
      "text": "Demo call with Google about DNS.",
      "start": 0.0,
      "end": 2.0
    }
  ]
}
```

## Local Curl Template

- Verify the exact signature headers and signed content against the HeyPocket documentation before the live request.
- Keep the real secret in the shell environment and off camera.

```bash
# Local only — do not paste the real secret on camera.
BODY='{"event":"summary.completed", ...}'
SECRET="$HEYPOCKET_WEBHOOK_SECRET"
SIG=$(printf %s "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

curl -sS -X POST "http://127.0.0.1:8000/webhooks/heypocket" \
  -H "Content-Type: application/json" \
  -H "X-HeyPocket-Signature: $SIG" \
  -H "X-HeyPocket-Timestamp: $(date -u +%Y-%m-%dT%H:%M:%S.000Z)" \
  -d "$BODY"
```

### Expected Ticket Body Start

```text
Call duration: 12 min 34 sec

Summary:
Discussed DNS A-record updates for google.com and next steps for the change window.
```

## On-stream Recovery

- **Webhook not hitting production:** show the local signed request first, then debug delivery.
- **Signature mismatch:** check the Pocket documentation; only use a bypass when it is strictly local.
- **Pocket summary is slow:** use the safe fake payload and return to the real call later.
- **Duplicate tickets:** stop and fix idempotency or the unique index.
- **Wrong language:** move user-facing copy into `lang/en` and confirm the user language is English.
- **Private old recording appears:** stop immediately and fix the cutoff before continuing.
- **Customer is not linked:** use the manual link control or defer customer actions.

## Success Criteria

### Must Have

- [ ] Fable planned and Grok challenged the plan.
- [ ] Grok built and Fable reviewed the code.
- [ ] A fake or real summary created one ticket.
- [ ] Duration is visible at the top.
- [ ] At least one to-do exists.
- [ ] Old recordings are ignored.
- [ ] No secrets or private historical calls appeared on camera.

### Stretch

- [ ] Customer linked.
- [ ] Summary emailed.
- [ ] Task created from the ticket.

## Tweets — Paste Live

> "Every call already has notes. The broken part is turning those notes into work. Today we are wiring HeyPocket into our ticket system live."

> "Webhooks give you speed. Reconciliation gives you sleep."

> "A transcript is evidence. A ticket is work."
