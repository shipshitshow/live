'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { KanbanColumn } from '@/components/livestream/KanbanColumn';
import { LivestreamBoardContentSkeleton } from '@/components/PageSkeletons';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { isErrorResponse } from '@/lib/api-types';
import { logClientEvent, logClientPerf } from '@/lib/client-logger';
import { todayLocalDate } from '@/lib/date';
import type {
  LivestreamListResponse,
  Topic,
  TopicStatus,
} from '@/lib/livestream-types';
import { parseJsonResponse } from '@/lib/parse-json-response';

const COLUMNS: TopicStatus[] = ['backlog', 'in_progress', 'done'];

export default function LivestreamPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestedDate, setRequestedDate] = useState(() => todayLocalDate());
  const [date, setDate] = useState(() => todayLocalDate());
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isFallback, setIsFallback] = useState(false);

  const fetchTopics = useCallback(async () => {
    const startedAt = performance.now();
    setError(null);
    try {
      const res = await fetch(`/api/livestream?date=${requestedDate}`);
      const data = await parseJsonResponse<
        LivestreamListResponse | { error: string }
      >(res);
      if (!res.ok) {
        throw new Error(
          isErrorResponse(data) ? data.error : `API error ${res.status}`,
        );
      }
      if (isErrorResponse(data)) {
        throw new Error(data.error);
      }
      const livestreamData = data as LivestreamListResponse;
      setTopics(livestreamData.topics);
      setDate(livestreamData.resolvedDate);
      setAvailableDates(livestreamData.availableDates);
      setIsFallback(livestreamData.isFallback);
      logClientPerf('livestream_board_fetch_topics', {
        durationMs: Number((performance.now() - startedAt).toFixed(2)),
        isFallback: livestreamData.isFallback,
        requestedDate,
        resolvedDate: livestreamData.resolvedDate,
        topicCount: livestreamData.topics.length,
      });
    } catch (fetchError) {
      setTopics([]);
      setAvailableDates([]);
      setIsFallback(false);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Failed to load topics',
      );
    } finally {
      setLoading(false);
    }
  }, [requestedDate]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  useEffect(() => {
    logClientEvent('livestream_board_view', { requestedDate });
  }, [requestedDate]);

  async function handleStatusChange(slug: string, status: TopicStatus) {
    // Optimistic update
    setTopics((prev) =>
      prev.map((t) => (t.slug === slug ? { ...t, status } : t)),
    );

    await fetch(`/api/livestream/${slug}?date=${date}`, {
      body: JSON.stringify({ status }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    });
  }

  function handleSelect(slug: string) {
    window.location.href = `/livestream/${slug}?date=${date}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface text-text-primary">
        <AppHeader subtitle="Livestream" activeHref="/livestream" />
        <LivestreamBoardContentSkeleton />
      </div>
    );
  }

  const selectedCount = topics.filter((t) => t.status === 'in_progress').length;
  const totalCount = topics.length;

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader subtitle="Livestream" activeHref="/livestream" />

      <main className="p-8 space-y-6">
        {error ? (
          <div className="rounded-xl border border-accent-red/20 bg-accent-red/5 p-4">
            <p className="text-sm text-accent-red">{error}</p>
          </div>
        ) : null}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">
              {date} · {selectedCount}/{totalCount} selected
            </p>
            {isFallback && (
              <p className="text-[11px] text-text-muted mt-1">
                No topics for {requestedDate}. Showing latest board instead.
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {availableDates.length > 0 && (
              <Select
                value={date}
                onValueChange={(value) => {
                  setLoading(true);
                  setRequestedDate(value);
                }}
              >
                <SelectTrigger className="h-8 text-xs font-medium text-text-secondary">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map((availableDate) => (
                    <SelectItem key={availableDate} value={availableDate}>
                      {availableDate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              onClick={fetchTopics}
              className="h-8 text-xs text-text-secondary"
            >
              Refresh
            </Button>
          </div>
        </div>
        {availableDates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface-border bg-surface-card/30 p-8 text-center">
            <p className="text-sm text-text-primary">
              No livestream topics yet.
            </p>
            <p className="text-xs text-text-muted mt-2">
              Add markdown topic files under{' '}
              <code>data/livestream/YYYY-MM-DD/</code>.
            </p>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto">
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
      </main>
    </div>
  );
}
