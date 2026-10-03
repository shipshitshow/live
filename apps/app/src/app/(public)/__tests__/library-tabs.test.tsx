import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { LibraryTabs } from '../LibraryTabs';

const markup = renderToStaticMarkup(
  <LibraryTabs
    tabs={[
      {
        allHref: 'https://www.youtube.com/@shipshitshow/streams',
        allLabel: 'All episodes on YouTube',
        content: <p>episode rows</p>,
        id: 'episodes',
        label: 'Episodes',
      },
      {
        allHref: 'https://www.youtube.com/@shipshitshow/videos',
        allLabel: 'All videos on YouTube',
        content: <p>video rows</p>,
        id: 'videos',
        label: 'Videos',
      },
    ]}
  />,
);

function element(id: string): string {
  return markup.match(new RegExp(`<[^>]*id="${id}"[^>]*>`))?.[0] ?? '';
}

describe('Homepage library tabs (#95)', () => {
  test('exposes a labelled tablist', () => {
    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('aria-label="Library"');
  });

  test('Episodes is selected and the only tab in the tab order', () => {
    const episodes = element('library-tab-episodes');
    const videos = element('library-tab-videos');
    expect(episodes).toContain('aria-selected="true"');
    expect(episodes).toContain('tabindex="0"');
    expect(videos).toContain('aria-selected="false"');
    expect(videos).toContain('tabindex="-1"');
  });

  test('each tab controls a panel labelled by that tab', () => {
    expect(element('library-tab-episodes')).toContain(
      'aria-controls="library-panel-episodes"',
    );
    const episodesPanel = element('library-panel-episodes');
    const videosPanel = element('library-panel-videos');
    expect(episodesPanel).toContain('aria-labelledby="library-tab-episodes"');
    expect(episodesPanel).not.toContain('hidden');
    expect(videosPanel).toContain('aria-labelledby="library-tab-videos"');
    expect(videosPanel).toContain('hidden');
  });

  test('every panel links to its full YouTube list', () => {
    expect(markup).toContain(
      'href="https://www.youtube.com/@shipshitshow/streams"',
    );
    expect(markup).toContain(
      'href="https://www.youtube.com/@shipshitshow/videos"',
    );
  });
});
