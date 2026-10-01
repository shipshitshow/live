import { describe, expect, test } from 'bun:test';
import { parseYoutubeFeed } from '@/lib/youtube-feed';

const FEED = `<?xml version="1.0"?>
<feed>
  <entry>
    <yt:videoId>abc123XYZ_1</yt:videoId>
    <title>Fable &amp; Sonnet</title>
    <published>2026-09-29T18:00:00+00:00</published>
  </entry>
  <entry>
    <yt:videoId>def456</yt:videoId>
    <title><![CDATA[A later cut]]></title>
    <published>2026-09-22T18:00:00+00:00</published>
  </entry>
  <entry>
    <title>Missing id</title>
    <published>2026-09-01T18:00:00+00:00</published>
  </entry>
</feed>`;

describe('parseYoutubeFeed', () => {
  test('reads public uploads in feed order and skips incomplete entries', () => {
    expect(parseYoutubeFeed(FEED)).toEqual([
      {
        id: 'abc123XYZ_1',
        publishedAt: '2026-09-29T18:00:00+00:00',
        thumbnailUrl: 'https://i.ytimg.com/vi/abc123XYZ_1/hqdefault.jpg',
        title: 'Fable & Sonnet',
        url: 'https://www.youtube.com/watch?v=abc123XYZ_1',
      },
      {
        id: 'def456',
        publishedAt: '2026-09-22T18:00:00+00:00',
        thumbnailUrl: 'https://i.ytimg.com/vi/def456/hqdefault.jpg',
        title: 'A later cut',
        url: 'https://www.youtube.com/watch?v=def456',
      },
    ]);
  });
});
