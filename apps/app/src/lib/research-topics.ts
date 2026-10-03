import { buildLivestreamTopicDraft } from '@shipshitshow/talking-points';
import type { TrendItem } from '@shipshitshow/types';

interface TopicPersistFailure {
  item: TrendItem;
  message: string;
}

export interface TopicPersistResult {
  addedIds: string[];
  failures: TopicPersistFailure[];
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json();
    if (
      body &&
      typeof body === 'object' &&
      'error' in body &&
      typeof body.error === 'string' &&
      body.error
    ) {
      return body.error;
    }
  } catch {}
  return `Request failed (${res.status})`;
}

/**
 * Creates one backlog topic per trend and reports exactly which ones were
 * persisted. Requests run sequentially because the topics store numbers each
 * new file from the current topic count, so parallel creates race.
 */
export async function persistTrendTopics(
  items: TrendItem[],
  date: string,
  fetchImpl: typeof fetch = fetch,
): Promise<TopicPersistResult> {
  const addedIds: string[] = [];
  const failures: TopicPersistFailure[] = [];

  for (const item of items) {
    try {
      const res = await fetchImpl('/api/topics', {
        body: JSON.stringify({ date, ...buildLivestreamTopicDraft(item) }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      if (res.ok) addedIds.push(item.id);
      else failures.push({ item, message: await readErrorMessage(res) });
    } catch (e) {
      failures.push({
        item,
        message: e instanceof Error ? e.message : 'Network request failed',
      });
    }
  }

  return { addedIds, failures };
}

export function describeTopicPersistResult({
  addedIds,
  failures,
}: TopicPersistResult): string | null {
  if (failures.length === 0) return null;

  const reason = failures[0].message;
  if (addedIds.length === 0 && failures.length === 1) {
    return `Could not add “${failures[0].item.title}” to the livestream: ${reason}`;
  }

  const total = addedIds.length + failures.length;
  return `Added ${addedIds.length} of ${total} topics. ${failures.length} could not be added: ${reason}`;
}
