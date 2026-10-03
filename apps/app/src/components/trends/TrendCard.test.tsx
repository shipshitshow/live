import { describe, expect, test } from 'bun:test';
import type { TrendItem } from '@shipshitshow/types';
import { renderToStaticMarkup } from 'react-dom/server';
import { TrendCard } from './TrendCard';

const ITEM: TrendItem = {
  commentCount: 12,
  id: 'hn-1',
  score: 340,
  source: 'hackernews',
  summary: 'Release notes for the new model.',
  timestamp: new Date().toISOString(),
  title: 'Gemini 4 Argon',
  url: 'https://blog.google/gemini-4-argon',
};

function render(props: Partial<Parameters<typeof TrendCard>[0]> = {}) {
  return renderToStaticMarkup(
    <TrendCard
      item={ITEM}
      selected={false}
      onToggle={() => {}}
      onPreview={() => {}}
      previewControls="research-preview"
      {...props}
    />,
  );
}

function previewButton(markup: string): string | undefined {
  return markup.match(
    /<button[^>]*data-trend-preview[^>]*>[\s\S]*?<\/button>/,
  )?.[0];
}

describe('TrendCard preview control', () => {
  test('exposes preview as a native button so Enter and Space open it', () => {
    const button = previewButton(render());

    expect(button).toBeDefined();
    expect(button).toContain('type="button"');
    expect(button).toContain('Gemini 4 Argon');
    expect(button).toContain('aria-controls="research-preview"');
    expect(button).toContain('focus-visible:');
  });

  test('marks the previewed card for assistive technology', () => {
    expect(previewButton(render({ previewed: true }))).toContain(
      'aria-current="true"',
    );
    expect(previewButton(render({ previewed: false }))).not.toContain(
      'aria-current',
    );
  });

  test('keeps a named link to the original source', () => {
    expect(render()).toContain('aria-label="Open source: Gemini 4 Argon"');
  });

  test('related-content cards without preview keep the title as a link', () => {
    const markup = render({ compact: true, onPreview: undefined });

    expect(previewButton(markup)).toBeUndefined();
    expect(markup).toContain('href="https://blog.google/gemini-4-argon"');
  });
});

describe('TrendCard source badge', () => {
  test('shows the brand logo with the source name kept for assistive tech', () => {
    const badge = render().match(
      /<span[^>]*data-source-logo="hackernews"[\s\S]*?<\/span><\/span>/,
    )?.[0];

    expect(badge).toBeDefined();
    expect(badge).toContain('<svg');
    expect(badge).toContain('aria-hidden="true"');
    expect(badge).toContain('title="Hacker News"');
    expect(badge).toContain('<span class="sr-only">Hacker News</span>');
  });

  test('drops the visible text-only source badge', () => {
    expect(render()).not.toMatch(/>HN<\/span>/);
  });
});
