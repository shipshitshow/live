import { describe, expect, mock, test } from 'bun:test';
import type { TrendItem } from '@shipshitshow/types';
import {
  describeTopicPersistResult,
  persistTrendTopics,
} from '@/lib/research-topics';

function buildItem(id: string): TrendItem {
  return {
    commentCount: 3,
    id,
    score: 42,
    source: 'hackernews',
    timestamp: '2026-10-02T10:00:00.000Z',
    title: `Story ${id}`,
    url: `https://news.ycombinator.com/item?id=${id}`,
  };
}

function respondWith(...responses: Array<Response | Error>) {
  let call = 0;
  return mock(async () => {
    const next = responses[call++];
    if (next instanceof Error) throw next;
    return next;
  }) as unknown as typeof fetch & ReturnType<typeof mock>;
}

describe('persistTrendTopics', () => {
  test('marks nothing as added when topic creation is rejected', async () => {
    const fetchImpl = respondWith(
      Response.json(
        {
          error:
            'Writable livestream storage requires BLOB_READ_WRITE_TOKEN on Vercel',
        },
        { status: 503 },
      ),
    );

    const result = await persistTrendTopics(
      [buildItem('a')],
      '2026-10-02',
      fetchImpl,
    );

    expect(result.addedIds).toEqual([]);
    expect(result.failures).toEqual([
      {
        item: buildItem('a'),
        message:
          'Writable livestream storage requires BLOB_READ_WRITE_TOKEN on Vercel',
      },
    ]);
  });

  test('reports partial batch success item by item', async () => {
    const fetchImpl = respondWith(
      Response.json({ slug: 'a' }, { status: 201 }),
      new TypeError('Failed to fetch'),
      new Response('<html>Bad gateway</html>', { status: 502 }),
      Response.json({ slug: 'd' }, { status: 201 }),
    );
    const items = ['a', 'b', 'c', 'd'].map(buildItem);

    const result = await persistTrendTopics(items, '2026-10-02', fetchImpl);

    expect(result.addedIds).toEqual(['a', 'd']);
    expect(result.failures.map((failure) => failure.item.id)).toEqual([
      'b',
      'c',
    ]);
    expect(result.failures[0]?.message).toBe('Failed to fetch');
    expect(result.failures[1]?.message).toBe('Request failed (502)');
  });

  test('creates topics one at a time with the chosen date', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const bodies: unknown[] = [];
    const fetchImpl = mock(async (_url: string, init?: RequestInit) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      bodies.push(JSON.parse(String(init?.body)));
      await new Promise((resolve) => setTimeout(resolve, 1));
      inFlight--;
      return Response.json({}, { status: 201 });
    }) as unknown as typeof fetch;

    await persistTrendTopics(
      [buildItem('a'), buildItem('b')],
      '2026-10-02',
      fetchImpl,
    );

    expect(maxInFlight).toBe(1);
    expect(bodies).toHaveLength(2);
    expect(bodies[0]).toMatchObject({ date: '2026-10-02', title: 'Story a' });
  });
});

describe('describeTopicPersistResult', () => {
  test('returns null when every topic was added', () => {
    expect(describeTopicPersistResult({ addedIds: ['a'], failures: [] })).toBe(
      null,
    );
  });

  test('names a single failed topic and the server reason', () => {
    expect(
      describeTopicPersistResult({
        addedIds: [],
        failures: [{ item: buildItem('a'), message: 'Storage offline' }],
      }),
    ).toBe('Could not add “Story a” to the livestream: Storage offline');
  });

  test('summarizes a partially failed batch', () => {
    expect(
      describeTopicPersistResult({
        addedIds: ['a'],
        failures: [
          { item: buildItem('b'), message: 'Storage offline' },
          { item: buildItem('c'), message: 'Storage offline' },
        ],
      }),
    ).toBe('Added 1 of 3 topics. 2 could not be added: Storage offline');
  });
});
