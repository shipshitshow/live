import { describe, expect, test } from 'bun:test';
import { getTopicSummary, parseTopicSources } from '@/lib/topic-card-content';

describe('parseTopicSources', () => {
  test('splits short platform labels on commas', () => {
    expect(parseTopicSources('HN, Reddit, GitHub')).toEqual([
      'HN',
      'Reddit',
      'GitHub',
    ]);
  });

  test('keeps commas inside parenthesised citation details', () => {
    expect(
      parseTopicSources(
        'Artificial Analysis X posts (Opus 5.5, Sonnet 5.5, Coding Agent Index), @claudeai and @ClaudeDevs launch posts',
      ),
    ).toEqual([
      'Artificial Analysis X posts (Opus 5.5, Sonnet 5.5, Coding Agent Index)',
      '@claudeai and @ClaudeDevs launch posts',
    ]);
  });

  test('keeps commas inside quoted titles and nested brackets', () => {
    expect(
      parseTopicSources(
        `Theo 'Pacing, again' 27 Sep, X (@a, [b, c]), "Ship, Shit", HN`,
      ),
    ).toEqual([
      `Theo 'Pacing, again' 27 Sep`,
      'X (@a, [b, c])',
      '"Ship, Shit"',
      'HN',
    ]);
  });

  test('does not treat apostrophes inside words as quotes', () => {
    expect(parseTopicSources(`Dario's essay, Theo's video`)).toEqual([
      `Dario's essay`,
      `Theo's video`,
    ]);
  });

  test('drops empty fragments and returns nothing for a missing source', () => {
    expect(parseTopicSources(' HN, , Reddit, ')).toEqual(['HN', 'Reddit']);
    expect(parseTopicSources('')).toEqual([]);
    expect(parseTopicSources('   ')).toEqual([]);
  });

  test('parses the 2026-09-29 long-source episode into real citations', () => {
    const source =
      "Theo (t3.gg) 'So much for Pacing the Frontier' 27 Sep, Dario Amodei 'We Must Pace the Frontier' 12 Sep, Artificial Analysis X posts (Opus 5.5, Sonnet 5.5, Coding Agent Index), @claudeai and @ClaudeDevs launch posts, claude.dev blog (Getting the most out of Opus 5.5, What a task costs on Opus 5.5), Thariq @trq212 X article Spending your effort, X timeline use cases, release sweep 8-28 Sep, channel stats via yt-dlp 29 Sep";

    expect(parseTopicSources(source)).toEqual([
      "Theo (t3.gg) 'So much for Pacing the Frontier' 27 Sep",
      "Dario Amodei 'We Must Pace the Frontier' 12 Sep",
      'Artificial Analysis X posts (Opus 5.5, Sonnet 5.5, Coding Agent Index)',
      '@claudeai and @ClaudeDevs launch posts',
      'claude.dev blog (Getting the most out of Opus 5.5, What a task costs on Opus 5.5)',
      'Thariq @trq212 X article Spending your effort',
      'X timeline use cases',
      'release sweep 8-28 Sep',
      'channel stats via yt-dlp 29 Sep',
    ]);
  });
});

describe('getTopicSummary', () => {
  test('uses the first paragraph of the Summary section, not earlier notes', () => {
    const content = [
      '## Sources — Livestream Notes',
      '',
      '- Start: 14:00 CEST.',
      '',
      'Small numbers, and older videos have had longer to collect views, so read the ranking loosely.',
      '',
      '## Summary',
      '',
      'Anthropic shipped **Claude Opus 5.5** and [Sonnet 5.5](https://example.com). Here is the question.',
      '',
      'Second paragraph that should not be used.',
      '',
      '## Talking Points',
      '- point',
    ].join('\n');

    expect(getTopicSummary(content)).toBe(
      'Anthropic shipped Claude Opus 5.5 and Sonnet 5.5. Here is the question.',
    );
  });

  test('skips a list or table opening the Summary section', () => {
    const content = [
      '## Summary',
      '',
      '| a | b |',
      '|---|---|',
      '',
      '- a bullet',
      '',
      'The actual framing sentence.',
    ].join('\n');

    expect(getTopicSummary(content)).toBe('The actual framing sentence.');
  });

  test('falls back to the segment thesis when there is no Summary', () => {
    const content = [
      '## Talking Points — Livestream Notes',
      '',
      'Some long logistics paragraph that is not the topic.',
      '',
      '## Talking Points — Segment Thesis',
      '',
      'Harnesses are the new dev platform.',
    ].join('\n');

    expect(getTopicSummary(content)).toBe(
      'Harnesses are the new dev platform.',
    );
  });

  test('reads a ### Segment Thesis sub-section', () => {
    const content = [
      '## Talking Points — Capsule 1',
      '',
      '### Segment Thesis',
      '',
      'Opus 5.5 is a reliability upgrade.',
      '',
      '### Talking Points',
      '',
      '- detail',
    ].join('\n');

    expect(getTopicSummary(content)).toBe('Opus 5.5 is a reliability upgrade.');
  });

  test('skips generated placeholder theses', () => {
    const content = [
      '## Talking Points — Episode Context',
      '',
      '### Segment Thesis',
      '',
      'Okay, so this segment is about Episode Context.',
      '',
      '## Talking Points — The Counter-Take (4 min)',
      '',
      '### Segment Thesis',
      '',
      'Okay, so this segment is about The Counter-Take (4 min).',
    ].join('\n');

    expect(getTopicSummary(content)).toBeNull();
    expect(
      getTopicSummary(
        `${content}\n\n## Talking Points — Real\n\n### Segment Thesis\n\nA written thesis.`,
      ),
    ).toBe('A written thesis.');
  });

  test('returns null instead of an arbitrary note paragraph', () => {
    const content = [
      '## Sources — Livestream Notes',
      '',
      'Small numbers, and older videos have had longer to collect views.',
      '',
      '## Talking Points — The Setup',
      '',
      'A talking point paragraph.',
    ].join('\n');

    expect(getTopicSummary(content)).toBeNull();
    expect(getTopicSummary('')).toBeNull();
    expect(getTopicSummary('## Summary\n\n- only bullets\n- here')).toBeNull();
  });
});
