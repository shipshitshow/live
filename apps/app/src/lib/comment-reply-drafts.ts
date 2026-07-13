// OpenAI-compatible chat endpoint. Point OPENAI_BASE_URL at OpenRouter
// (https://openrouter.ai/api/v1) or any compatible gateway; defaults to OpenAI.
const API_BASE_URL = (
  process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1'
).replace(/\/+$/, '');
const CHAT_COMPLETIONS_URL = `${API_BASE_URL}/chat/completions`;
const IS_OPENROUTER = API_BASE_URL.includes('openrouter.ai');

interface DraftReplyInput {
  videoTitle: string;
  commentText: string;
  channelLabel: string;
  authorDisplayName: string;
}

interface DraftReplyPayload {
  drafts: string[];
}

function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  // On OpenRouter, model ids are provider-prefixed (e.g. google/gemini-2.0-flash-001).
  const model =
    process.env.OPENAI_MODEL ??
    (IS_OPENROUTER ? 'google/gemini-2.0-flash-001' : 'gpt-4o-mini');
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');
  return { apiKey, model };
}

function extractJson(raw: string): DraftReplyPayload {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI response did not return JSON');
  }

  const parsed = JSON.parse(
    raw.slice(start, end + 1),
  ) as Partial<DraftReplyPayload>;
  const drafts = Array.isArray(parsed.drafts)
    ? parsed.drafts.reduce<string[]>((acc, draft) => {
        if (typeof draft === 'string') {
          const trimmed = draft.trim();
          if (trimmed) acc.push(trimmed);
        }
        return acc;
      }, [])
    : [];

  if (drafts.length === 0) {
    throw new Error('AI response did not include any drafts');
  }

  return { drafts: drafts.slice(0, 3) };
}

export async function generateCommentReplyDrafts(
  input: DraftReplyInput,
): Promise<string[]> {
  const { apiKey, model } = getOpenAIConfig();
  const prompt = [
    'You write reply drafts for the Ship Shit Show YouTube channel.',
    'Voice: sharp, founder-level, direct, high-signal, not corporate, not cringe, not needy.',
    'Rules:',
    '- Write exactly 3 distinct reply options.',
    '- Keep each reply under 280 characters.',
    '- Sound human and specific to the comment.',
    '- Do not use emojis.',
    '- Do not mention being AI.',
    '- If the comment is praise, reply with appreciation and one specific angle.',
    '- If the comment is criticism, reply calmly and credibly.',
    '- If the comment asks a question, answer it directly.',
    '- Return JSON only in the form {"drafts":["...","...","..."]}.',
    '',
    `Channel: ${input.channelLabel}`,
    `Video title: ${input.videoTitle}`,
    `Comment author: ${input.authorDisplayName}`,
    `Comment: ${input.commentText}`,
  ].join('\n');

  const res = await fetch(CHAT_COMPLETIONS_URL, {
    body: JSON.stringify({
      messages: [
        {
          content:
            'You generate concise YouTube creator replies and follow output format exactly.',
          role: 'system',
        },
        { content: prompt, role: 'user' },
      ],
      model,
      temperature: 0.8,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      // Optional attribution for OpenRouter's dashboard/leaderboards.
      ...(IS_OPENROUTER
        ? {
            'HTTP-Referer': 'https://show.shipshit.dev',
            'X-Title': 'Ship Shit Show',
          }
        : {}),
    },
    method: 'POST',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API ${res.status}: ${body}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('OpenAI response did not include message content');
  }

  return extractJson(content).drafts;
}
