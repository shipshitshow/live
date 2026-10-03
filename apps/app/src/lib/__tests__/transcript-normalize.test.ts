import { describe, expect, test } from 'bun:test';
import {
  decodeTranscriptEntities,
  normalizeTranscript,
} from '@/lib/transcript-normalize';

describe('decodeTranscriptEntities', () => {
  test('decodes named and numeric entities from caption imports', () => {
    expect(
      decodeTranscriptEntities(
        '&gt;&gt; Tom &amp; Jerry&nbsp;said &quot;hi&quot; &#39;ok&#39; &#x2014; &lt;3',
      ),
    ).toBe(`>> Tom & Jerry said "hi" 'ok' — <3`);
  });

  test('decodes in a single pass so escaped entities stay literal', () => {
    expect(decodeTranscriptEntities('&amp;gt;&amp;gt;')).toBe('&gt;&gt;');
  });

  test('leaves unknown entities untouched', () => {
    expect(decodeTranscriptEntities('a &bogus; b')).toBe('a &bogus; b');
  });
});

describe('normalizeTranscript', () => {
  test('splits wrapped caption lines into speaker turns at >> markers', () => {
    const raw = [
      'So, what did you do with Figma',
      '5?',
      '&gt;&gt; Everything.',
      '&gt;&gt; Yeah.',
      '&gt;&gt; I just I I don&#39;t check every project and',
      'then create a lot of documentation.',
      '&gt;&gt;',
    ].join('\n');

    const transcript = normalizeTranscript(raw);

    expect(transcript.hasSpeakerMarkers).toBe(true);
    expect(transcript.turns).toEqual([
      {
        paragraphs: ['So, what did you do with Figma 5?'],
        speakerChange: false,
      },
      { paragraphs: ['Everything.'], speakerChange: true },
      { paragraphs: ['Yeah.'], speakerChange: true },
      {
        paragraphs: [
          "I just I I don't check every project and then create a lot of documentation.",
        ],
        speakerChange: true,
      },
    ]);
  });

  test('splits inline markers in single-line imports', () => {
    const raw =
      'There is the culprit. &gt;&gt; That is a well done motherboard. [laughter] &gt;&gt; Yeah. Okay.';

    expect(normalizeTranscript(raw).turns).toEqual([
      { paragraphs: ['There is the culprit.'], speakerChange: false },
      {
        paragraphs: ['That is a well done motherboard. [laughter]'],
        speakerChange: true,
      },
      { paragraphs: ['Yeah. Okay.'], speakerChange: true },
    ]);
  });

  test('never leaves literal encoded or decoded markers in rendered text', () => {
    const raw =
      'a &gt;&gt; b\n&gt;&gt; c &amp;&amp; d\n&gt;&gt;&gt;&gt; e &nbsp; f';
    const { plainText, turns } = normalizeTranscript(raw);
    const rendered = turns.flatMap((turn) => turn.paragraphs).join('\n');

    expect(rendered).not.toContain('&gt;');
    expect(rendered).not.toContain('>>');
    expect(rendered).not.toContain('&nbsp;');
    expect(rendered).toContain('c && d');
    expect(plainText).not.toContain('>>');
  });

  test('breaks a long marker-free monologue into sentence paragraphs', () => {
    const sentence =
      'This is a sentence from a long monologue that keeps going for a while.';
    const raw = Array.from({ length: 24 }, () => sentence).join(' ');

    const { turns, hasSpeakerMarkers } = normalizeTranscript(raw);

    expect(hasSpeakerMarkers).toBe(false);
    expect(turns).toHaveLength(1);
    expect(turns[0].paragraphs.length).toBeGreaterThan(1);
    for (const paragraph of turns[0].paragraphs) {
      expect(paragraph.endsWith('.')).toBe(true);
      expect(paragraph.length).toBeLessThanOrEqual(700);
    }
    expect(turns[0].paragraphs.join(' ')).toBe(raw);
  });

  test('breaks unpunctuated caption runs between words', () => {
    const raw = Array.from({ length: 400 }, (_, i) => `word${i}`).join(' ');

    const [turn] = normalizeTranscript(raw).turns;

    expect(turn.paragraphs.length).toBeGreaterThan(1);
    for (const paragraph of turn.paragraphs) {
      expect(paragraph.length).toBeLessThanOrEqual(720);
    }
    expect(turn.paragraphs.join(' ')).toBe(raw);
  });

  test('keeps the captured wording, including uncertain names', () => {
    const raw = 'Figma is gone and you are missing it. Claude is click click.';
    expect(normalizeTranscript(raw).plainText).toBe(raw);
  });

  test('returns no turns for an empty transcript', () => {
    expect(normalizeTranscript('').turns).toEqual([]);
    expect(normalizeTranscript(' \n &gt;&gt; \n').turns).toEqual([]);
  });
});
