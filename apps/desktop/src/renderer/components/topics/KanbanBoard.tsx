import type { Topic, TopicStatus } from '@shipshitshow/types';
import { Button } from '@shipshitshow/ui';
import { useCallback, useEffect, useState } from 'react';
import { KanbanColumn } from './KanbanColumn';

const COLUMNS: TopicStatus[] = ['backlog', 'in_progress', 'done'];

function todayLocalDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function KanbanBoard() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => todayLocalDate());
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    try {
      const dates = await window.electronAPI.topics.listDates();
      setAvailableDates(dates);

      const resolvedDate = dates.includes(date) ? date : dates[0] || date;
      if (resolvedDate !== date) setDate(resolvedDate);

      const result = await window.electronAPI.topics.list(resolvedDate);
      setTopics(result);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  async function handleStatusChange(slug: string, status: TopicStatus) {
    setTopics((prev) =>
      prev.map((t) => (t.slug === slug ? { ...t, status } : t)),
    );
    await window.electronAPI.topics.updateStatus(date, slug, status);
  }

  function handleSelect(_slug: string) {
    // Topic detail view — future phase
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Loading topics...
      </div>
    );
  }

  const selectedCount = topics.filter((t) => t.status === 'in_progress').length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
        <div>
          <p className="text-sm font-medium text-text-primary">
            {date} · {selectedCount}/{topics.length} selected
          </p>
        </div>
        <div className="flex items-center gap-3">
          {availableDates.length > 1 && (
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-8 rounded-md border border-surface-border bg-surface-card px-2 text-xs text-text-secondary"
            >
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}
          <Button
            onClick={fetchTopics}
            className="h-8 text-xs text-text-secondary"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {topics.length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface-border bg-surface-card/30 p-8 text-center">
            <p className="text-sm text-text-primary">No livestream topics yet.</p>
            <p className="text-xs text-text-muted mt-2">
              Add topics via the Trends tab or create markdown files under{' '}
              <code>data/livestream/{date}/</code>.
            </p>
          </div>
        ) : (
          <div className="flex gap-6">
            {COLUMNS.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                topics={topics.filter((t) => t.status === status)}
                onStatusChange={handleStatusChange}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
