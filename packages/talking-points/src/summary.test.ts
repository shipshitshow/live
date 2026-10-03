import { afterEach, describe, expect, mock, test } from 'bun:test';
import { fetchHNTrending } from './hackernews';
import { fetchRedditTrending } from './reddit';
import { toPlainTextSummary } from './summary';

const GEMINI_STORY_TEXT =
  'Google shipped <i>Gemini 4 Argon</i> today.<p>Release notes: ' +
  '<a href="https:&#x2F;&#x2F;blog.google&#x2F;gemini-4-argon" rel="nofollow">' +
  'https:&#x2F;&#x2F;blog.google&#x2F;gemini-4-argon</a><p>It&#x27;s fast &amp; cheap.';

describe('toPlainTextSummary', () => {
  test('keeps plain text unchanged', () => {
    expect(toPlainTextSummary('Just a plain summary.')).toBe(
      'Just a plain summary.',
    );
  });

  test('turns imported HTML into readable text with paragraph boundaries', () => {
    expect(toPlainTextSummary(GEMINI_STORY_TEXT)).toBe(
      'Google shipped Gemini 4 Argon today.\n\n' +
        'Release notes: https://blog.google/gemini-4-argon\n\n' +
        "It's fast & cheap.",
    );
  });

  test('keeps a link destination when the anchor text hides it', () => {
    expect(
      toPlainTextSummary(
        'Read <a href="https://example.com/post">the post</a>',
      ),
    ).toBe('Read the post (https://example.com/post)');
  });

  test('decodes named, decimal and hex entities exactly once', () => {
    expect(
      toPlainTextSummary(
        '&quot;A&quot; &#8211; &#x2F;b&#x2F; &amp;lt;tag&amp;gt;',
      ),
    ).toBe('"A" – /b/ &lt;tag&gt;');
  });

  test('drops executable markup and never revives escaped tags as markup', () => {
    const summary = toPlainTextSummary(
      'Hi<script>alert(1)</script><style>p{}</style>' +
        '<img src=x onerror="alert(2)"> ' +
        '<a href="javascript:alert(3)">click</a> &lt;script&gt;',
    );
    expect(summary).toBe('Hi click <script>');
    expect(summary).not.toContain('alert');
    expect(summary).not.toContain('onerror');
    expect(summary).not.toContain('javascript:');
  });

  test('drops a tag cut off by upstream truncation', () => {
    expect(
      toPlainTextSummary('Launch notes <a href="https:&#x2F;&#x2F;exa'),
    ).toBe('Launch notes');
  });

  test('truncates the readable text, not the markup, on a word boundary', () => {
    const html = `<p>${'word '.repeat(80)}</p>`;
    const summary = toPlainTextSummary(html, 50);
    expect(summary?.length).toBeLessThanOrEqual(50);
    expect(summary?.endsWith('word…')).toBe(true);
    expect(summary).not.toContain('<');
  });

  test('returns undefined for empty or markup-only input', () => {
    expect(toPlainTextSummary(null)).toBeUndefined();
    expect(toPlainTextSummary('')).toBeUndefined();
    expect(toPlainTextSummary('<p></p>')).toBeUndefined();
  });
});

describe('source ingestion', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function mockJson(body: unknown) {
    globalThis.fetch = mock(async () =>
      Response.json(body),
    ) as unknown as typeof fetch;
  }

  test('Hacker News summaries are normalized before truncation', async () => {
    mockJson({
      hits: [
        {
          author: 'pg',
          created_at: '2026-10-02T10:00:00.000Z',
          num_comments: 4,
          objectID: '1',
          points: 10,
          story_text: `${'<i>x</i> '.repeat(40)}${GEMINI_STORY_TEXT}`,
          title: 'Gemini 4 Argon',
          url: null,
        },
      ],
    });

    const [item] = await fetchHNTrending();
    expect(item.summary).toBeDefined();
    expect(item.summary).not.toContain('<');
    expect(item.summary).not.toContain('&#x');
    expect(item.summary?.startsWith('x x x')).toBe(true);
  });

  test('Reddit selftext entities are decoded', async () => {
    mockJson({
      data: {
        children: [
          {
            data: {
              author: 'dev',
              created_utc: 1_790_000_000,
              id: 'abc',
              num_comments: 2,
              score: 30,
              selftext: 'Claude &amp; Codex &gt; manual &lt;3',
              subreddit: 'LocalLLaMA',
              title: 'Agents',
              url: '/r/LocalLLaMA/comments/abc',
            },
          },
        ],
      },
    });

    const items = await fetchRedditTrending({ subreddits: ['LocalLLaMA'] });
    expect(items[0]?.summary).toBe('Claude & Codex > manual <3');
  });
});
