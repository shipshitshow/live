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
