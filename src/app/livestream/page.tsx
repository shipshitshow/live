"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Topic, TopicStatus } from "@/lib/livestream-types";
import { KanbanColumn } from "@/components/livestream/KanbanColumn";

const COLUMNS: TopicStatus[] = ["backlog", "in_progress", "done"];

export default function LivestreamPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [date] = useState(() => new Date().toISOString().slice(0, 10));

  const fetchTopics = useCallback(async () => {
    const res = await fetch(`/api/livestream?date=${date}`);
    const data = await res.json();
    setTopics(data);
    setLoading(false);
  }, [date]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

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
      <header className="border-b border-surface-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-red flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81z" />
              <path d="M9.75 15.02V8.98L15.5 12l-5.75 3.02z" fill="#ff2d20" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary leading-none">Ship Shit Show</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Livestream &middot; {date} &middot; {selectedCount}/{totalCount} selected
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-4 text-xs text-text-secondary">
            <Link href="/" className="hover:text-text-primary transition-colors">Analytics</Link>
            <Link href="/review" className="hover:text-text-primary transition-colors">Unpublished</Link>
            <span className="text-text-primary font-medium">Livestream</span>
            <Link href="/trends" className="hover:text-text-primary transition-colors">Trends</Link>
          </nav>
          <button
            onClick={fetchTopics}
            className="text-xs font-medium px-3 py-1.5 rounded-md bg-surface-card border border-surface-border text-text-secondary hover:text-text-primary transition-colors"
          >
            Refresh
          </button>
        </div>
      </header>

      <main className="p-8">
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
      </main>
    </div>
  );
}
