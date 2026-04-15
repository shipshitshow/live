"use client";

import { Profiler, useEffect, useState, useCallback } from "react";
import { isErrorResponse } from "@/lib/api-types";
import type { LivestreamListResponse, Topic, TopicStatus } from "@/lib/livestream-types";
import { KanbanColumn } from "@/components/livestream/KanbanColumn";
import { todayLocalDate } from "@/lib/date";
import { logClientEvent, logClientPerf } from "@/lib/client-logger";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COLUMNS: TopicStatus[] = ["backlog", "in_progress", "done"];

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
      const data = (await res.json()) as LivestreamListResponse | { error: string };
      if (!res.ok || isErrorResponse(data)) {
        throw new Error(isErrorResponse(data) ? data.error : `API error ${res.status}`);
      }
      setTopics(data.topics);
      setDate(data.resolvedDate);
      setAvailableDates(data.availableDates);
      setIsFallback(data.isFallback);
      logClientPerf("livestream_board_fetch_topics", {
        requestedDate,
        resolvedDate: data.resolvedDate,
        topicCount: data.topics.length,
        durationMs: Number((performance.now() - startedAt).toFixed(2)),
        isFallback: data.isFallback,
      });
    } catch (fetchError) {
      setTopics([]);
      setAvailableDates([]);
      setIsFallback(false);
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load topics");
    } finally {
      setLoading(false);
    }
  }, [requestedDate]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  useEffect(() => {
    logClientEvent("livestream_board_view", { requestedDate });
  }, [requestedDate]);

  const handleProfilerRender = useCallback(
    (id: string, phase: "mount" | "update" | "nested-update", actualDuration: number, baseDuration: number) => {
      logClientPerf("react_render", {
        page: "livestream_board",
        component: id,
        phase,
        actualDuration: Number(actualDuration.toFixed(2)),
        baseDuration: Number(baseDuration.toFixed(2)),
        topicCount: topics.length,
      });
    },
    [topics.length]
  );

  async function handleStatusChange(slug: string, status: TopicStatus) {
    // Optimistic update
    setTopics((prev) =>
      prev.map((t) => (t.slug === slug ? { ...t, status } : t))
    );

    await fetch(`/api/livestream/${slug}?date=${date}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  function handleSelect(slug: string) {
    window.location.href = `/livestream/${slug}?date=${date}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface p-8 flex items-center justify-center">
        <p className="text-text-muted text-sm animate-pulse">Loading topics...</p>
      </div>
    );
  }

  const selectedCount = topics.filter((t) => t.status === "in_progress").length;
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
            <Button onClick={fetchTopics} className="h-8 text-xs text-text-secondary">
              Refresh
            </Button>
          </div>
        </div>
        {availableDates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface-border bg-surface-card/30 p-8 text-center">
            <p className="text-sm text-text-primary">No livestream topics yet.</p>
            <p className="text-xs text-text-muted mt-2">
              Add markdown topic files under <code>data/livestream/YYYY-MM-DD/</code>.
            </p>
          </div>
        ) : (
          <Profiler id="LivestreamBoardColumns" onRender={handleProfilerRender}>
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
          </Profiler>
        )}
      </main>
    </div>
  );
}
