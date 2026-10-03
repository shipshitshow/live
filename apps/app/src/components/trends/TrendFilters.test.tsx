import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { TrendFilters } from './TrendFilters';

function render() {
  return renderToStaticMarkup(
    <TrendFilters
      active="all"
      onChange={() => {}}
      counts={{ all: 9, hackernews: 6, reddit: 3, youtube: 0 }}
    />,
  );
}

describe('TrendFilters', () => {
  test('source chips show the brand logo and keep an accessible name', () => {
    const markup = render();

    for (const [source, name] of [
      ['hackernews', 'Hacker News'],
      ['reddit', 'Reddit'],
      ['youtube', 'YouTube'],
    ]) {
      expect(markup).toContain(`data-source-logo="${source}"`);
      expect(markup).toContain(`<span class="sr-only">${name}</span>`);
    }
  });

  test('the All chip stays a text label', () => {
    expect(render()).toMatch(/>All<span[^>]*>9<\/span>/);
  });
});
