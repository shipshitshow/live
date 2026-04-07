---
name: stream-content
description: "Generate all content assets for a livestream topic — thumbnails, titles, descriptions, social posts"
version: 1.0.0
tags:
  - livestream
  - content
  - shipshitshow
---

# Stream Content

Generate all content assets for a selected livestream topic: thumbnail prompts, YouTube title/description, LinkedIn post, and tweets.

## When to Use
- "generate content", "create assets", "prep content for [topic]", "make thumbnails"
- After a topic is selected (status: in_progress)
- Before going live — need all social/YouTube assets ready

## When NOT to Use
- Researching topics (use `trend-scout`)
- Structuring the show (use `show-rundown`)

## Brand Guidelines — Ship Shit Show

**Visual Identity:**
- Primary color: `#ff2d20` (red)
- Background: `#0d0d0d` (near-black)
- Font: Space Grotesk
- Aesthetic: Dark, edgy, developer-focused
- Reference channels: Fireship, Theo (t3.gg), ThePrimeagen

**Voice:**
- Direct, no fluff
- Opinionated but informed
- Speaks to indie devs / solo founders
- Uses "I" not "we"
- Swears occasionally but not excessively
- Never corporate, never cringe

**Channel:**
- Main: @shipshitshow
- Clips: @ShipShitShowClips

## Content Fields

Generate ALL of the following for each topic. Save via the dashboard API: `PATCH /api/livestream/[slug]?date=YYYY-MM-DD` with `{ generated: { field: value } }`.

### 1. Thumbnail Prompts (3 variants)

Fields: `thumbnail_v1`, `thumbnail_v2`, `thumbnail_v3`

Each prompt should describe a YouTube clickbait thumbnail for Midjourney/DALL-E:

**Template:**
```
YouTube thumbnail, 1280x720, [visual style].

SCENE: [person/reaction description]. Background shows [relevant visual].

TEXT OVERLAY: "[2-5 WORD HOOK]" — [text rendering style]. Position: [placement].

ADDITIONAL: [source badges, arrows, brand elements]. Red accent #ff2d20.

MOOD: Urgent, dramatic, impossible to ignore.

STYLE: YouTube tech commentary, NOT stock photo. Fireship/Theo/ThePrimeagen aesthetic.
```

**V1:** Shocked/dramatic reaction style
**V2:** Split comparison or before/after style
**V3:** Bold text-forward with minimal scene

Rules:
- Text overlay is MAX 5 words (what you'd actually put on the thumbnail)
- Include the brand red `#ff2d20`
- Never generic — reference the specific topic

### 2. YouTube Title

Field: `youtube_title`

Rules:
- Under 60 characters
- Clickbait but honest — never promise what the video doesn't deliver
- Use power words: "just", "actually", "finally", "broke", "killed", "leaked"
- Pattern: `[Subject] Just [Did Something Dramatic] — [Consequence]`
- No ALL CAPS (YouTube penalizes)
- No clickbait question marks unless it's a genuine question

### 3. YouTube Description

Field: `youtube_description`

Structure:
```
[1-2 sentence hook matching the title angle]

[3-4 sentences expanding on what the video covers]

TIMESTAMPS:
0:00 - [Cold open hook]
2:00 - [Topic 1]
17:00 - [Topic 2]
...

LINKS MENTIONED:
- [Source 1](url)
- [Source 2](url)

FOLLOW:
X/Twitter: https://x.com/shipshitshow
YouTube: https://youtube.com/@shipshitshow

#AI #IndieDev #DevTools #VibeCoding
```

### 4. LinkedIn Post

Field: `linkedin_post`

Rules:
- 1200-1500 characters
- Professional but punchy — LinkedIn voice, not YouTube voice
- Open with a hook line (separated by line break)
- Use line breaks liberally (LinkedIn rewards readability)
- End with a question to drive comments
- No hashtag spam — max 3 hashtags at the end
- Include a CTA to the livestream/video

### 5. Livestream Tweet

Field: `livestream_tweet`

Rules:
- Under 280 characters
- "Going live" energy
- Include the hook/topic
- Include the YouTube live link placeholder: `[LIVE LINK]`
- Use urgency: "right now", "tonight", "just dropped"

**Template:**
```
[Hook about tonight's topic]

going live in 10 — [LIVE LINK]
```

### 6. Recap Tweet

Field: `recap_tweet`

Rules:
- Thread starter (just the first tweet, under 280 chars)
- Past tense — "here's what we covered"
- Tease the best moment/take from the stream
- Include video link placeholder: `[VIDEO LINK]`

**Template:**
```
[Most provocative take from the stream]

full breakdown just dropped — [VIDEO LINK]
```

## Workflow

1. Read the topic file from `data/livestream/YYYY-MM-DD/`
2. Extract: title, summary, talking points, hot take, source list
3. Generate all 8 content fields
4. Save each field via `PATCH /api/livestream/[slug]?date=YYYY-MM-DD` with body: `{ "generated": { "field_name": "content" } }`
5. Output a summary of what was generated

## Quality Checklist
- [ ] All 8 fields generated (3 thumbnails + title + description + linkedin + 2 tweets)
- [ ] YouTube title under 60 characters
- [ ] Tweets under 280 characters
- [ ] LinkedIn post 1200-1500 characters
- [ ] Thumbnail prompts reference the specific topic, not generic
- [ ] No ALL CAPS in YouTube title
- [ ] Description has timestamps matching show rundown
- [ ] Brand voice is consistent (direct, opinionated, indie dev focused)
