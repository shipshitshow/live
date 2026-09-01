import { describe, expect, test } from 'bun:test';
import { isTopicMarkdownFile } from '@/lib/livestreams-files';

describe('isTopicMarkdownFile', () => {
  test('accepts the documented topic filename convention', () => {
    expect(isTopicMarkdownFile('topic-01-poteto-dr-eggbot.md')).toBe(true);
    expect(isTopicMarkdownFile('topic-12-another-topic.md')).toBe(true);
  });

  test('ignores markdown notes stored beside topic files', () => {
    expect(isTopicMarkdownFile('title-options.md')).toBe(false);
    expect(isTopicMarkdownFile('README.md')).toBe(false);
  });

  test('requires a zero-padded two-digit topic number', () => {
    expect(isTopicMarkdownFile('topic-1-poteto-dr-eggbot.md')).toBe(false);
    expect(isTopicMarkdownFile('topic-001-poteto-dr-eggbot.md')).toBe(false);
  });
});
