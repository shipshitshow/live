"use client";

import { Profiler, useEffect, useState, useCallback } from "react";
import type { Topic, TopicStatus } from "@/lib/livestream-types";
import { KanbanColumn } from "@/components/livestream/KanbanColumn";
import { todayLocalDate } from "@/lib/date";
import { logClientEvent, logClientPerf } from "@/lib/client-logger";
import { AppHeader } from "@/components/AppHeader";

const COLUMNS: TopicStatus[] = ["backlog", "in_progress", "done"];

interface LivestreamResponse {
  topics: Topic[];
  requestedDate: string;
  resolvedDate: string;
  availableDates: string[];
  isFallback: boolean;
}

export default function LivestreamPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedDate, setRequestedDate] = useState(() => todayLocalDate());
  const [date, setDate] = useState(() => todayLocalDate());
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isFallback, setIsFallback] = useState(false);

  const fetchTopics = useCallback(async () => {
    const startedAt = performance.now();
    const res = await fetch(`/api/livestream?date=${requestedDate}`);
    const data: LivestreamResponse = await res.json();
    setTopics(data.topics);
    setDate(data.resolvedDate);
    setAvailableDates(data.availableDates);
    setIsFallback(data.isFallback);
    setLoading(false);
    logClientPerf("livestream_board_fetch_topics", {
      requestedDate,
      resolvedDate: data.resolvedDate,
      topicCount: data.topics.length,
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
      isFallback: data.isFallback,
    });
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
              <select
                value={date}
                onChange={(e) => {
                  setLoading(true);
                  setRequestedDate(e.target.value);
                }}
                className="text-xs font-medium px-3 py-1.5 rounded-md bg-surface-card border border-surface-border text-text-secondary"
              >
                {availableDates.map((availableDate) => (
                  <option key={availableDate} value={availableDate}>
                    {availableDate}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={fetchTopics}
              className="text-xs font-medium px-3 py-1.5 rounded-md bg-surface-card border border-surface-border text-text-secondary hover:text-text-primary transition-colors"
            >
              Refresh
            </button>
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
