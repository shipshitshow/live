"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { TrendItem, TrendsResponse, TrendsSearchResponse, TrendSource } from "@/lib/trends-types";
import { TrendCard } from "./TrendCard";
import { TrendFilters, type FilterValue } from "./TrendFilters";
import { DeepDivePanel } from "./DeepDivePanel";
import { TrendActionBar } from "./TrendActionBar";

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "can", "shall", "to", "of", "in", "for",
  "on", "with", "at", "by", "from", "as", "into", "through", "during",
  "before", "after", "above", "below", "between", "out", "off", "over",
  "under", "again", "further", "then", "once", "here", "there", "when",
  "where", "why", "how", "all", "each", "every", "both", "few", "more",
  "most", "other", "some", "such", "no", "nor", "not", "only", "own",
  "same", "so", "than", "too", "very", "just", "because", "but", "and",
  "or", "if", "while", "about", "up", "its", "it", "this", "that",
  "these", "those", "i", "me", "my", "we", "our", "you", "your", "he",
  "him", "his", "she", "her", "they", "them", "their", "what", "which",
  "who", "whom", "new", "like", "get", "got", "also",
]);

function extractKeywords(titles: string[]): string {
  const wordFreq = new Map<string, number>();
  for (const title of titles) {
    const words = title.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
    for (const word of words) {
      if (word.length < 3 || STOP_WORDS.has(word)) continue;
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  }
  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
    .join(" ");
}

export function TrendsClient() {
  const [items, setItems] = useState<TrendItem[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<TrendsResponse["sources"] | null>(null);
  const [sourceFilter, setSourceFilter] = useState<FilterValue>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deepDiveItems, setDeepDiveItems] = useState<TrendItem[]>([]);
  const [deepDiveQuery, setDeepDiveQuery] = useState<string | null>(null);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);
  const [addingToLivestream, setAddingToLivestream] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trends");
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data: TrendsResponse = await res.json();
      setItems(data.items);
      setFetchedAt(data.fetchedAt);
      setSources(data.sources);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load trends");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  const filteredItems = useMemo(() => {
    if (sourceFilter === "all") return items;
    return items.filter((item) => item.source === sourceFilter);
  }, [items, sourceFilter]);

  const counts = useMemo(() => {
    const c: Record<FilterValue, number> = { all: items.length, hackernews: 0, reddit: 0, youtube: 0, x: 0 };
    for (const item of items) c[item.source]++;
    return c;
  }, [items]);

  const sourceSummary = useMemo(() => {
    if (!sources) return null;

    const labels: Record<TrendSource, string> = {
      hackernews: "HN",
      reddit: "Reddit",
      youtube: "YouTube",
      x: "X",
    };

    const failed = Object.entries(sources)
      .filter(([, status]) => status === "error")
      .map(([source]) => labels[source as TrendSource]);

    if (failed.length === 0) return "All sources live";
    return `${failed.join(", ")} unavailable`;
  }, [sources]);

  function toggleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleGoDeeper() {
    const selectedTitles = items.filter((i) => selectedIds.has(i.id)).map((i) => i.title);
    const query = extractKeywords(selectedTitles);
    if (!query) return;

    setDeepDiveLoading(true);
    setDeepDiveQuery(query);
    try {
      const res = await fetch(`/api/trends/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`Search error ${res.status}`);
      const data: TrendsSearchResponse = await res.json();
      const mainIds = new Set(items.map((i) => i.id));
      setDeepDiveItems(data.items.filter((i) => !mainIds.has(i.id)));
    } catch {
      setDeepDiveItems([]);
    } finally {
      setDeepDiveLoading(false);
    }
  }

  async function addToLivestream(trendsToAdd: TrendItem[]) {
    setAddingToLivestream(true);
    const date = new Date().toISOString().slice(0, 10);
    const sourceMap: Record<TrendSource, string> = {
      hackernews: "HN",
      reddit: "Reddit",
      youtube: "YouTube",
      x: "X",
    };

    try {
      for (const item of trendsToAdd) {
        const slug = item.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 60);

        const content = `## Source\n\n- [${sourceMap[item.source]}](${item.url}) — ${item.score.toLocaleString()} ${item.source === "youtube" ? "views" : "points"}, ${item.commentCount.toLocaleString()} comments\n\n## Summary\n\n${item.summary || item.title}`;

        await fetch("/api/livestream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: item.title,
            slug,
            source: sourceMap[item.source],
            date,
            content,
          }),
        });

        setAddedIds((prev) => new Set([...prev, item.id]));
      }
    } finally {
      setAddingToLivestream(false);
    }
  }

  function handleAddSelectedToLivestream() {
    const selected = items.filter((i) => selectedIds.has(i.id) && !addedIds.has(i.id));
    if (selected.length > 0) addToLivestream(selected);
  }

  function handleAddSingleToLivestream(item: TrendItem) {
    if (!addedIds.has(item.id)) addToLivestream([item]);
  }

  function handleRefresh() {
    setSelectedIds(new Set());
    setDeepDiveItems([]);
    setDeepDiveQuery(null);
    fetchTrends();
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="text-accent-red text-4xl">⚠</div>
        <p className="text-text-secondary text-sm">{error}</p>
        <button
          onClick={handleRefresh}
          className="text-xs px-4 py-2 bg-surface-card border border-surface-border rounded-lg hover:border-accent-red transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)]">
      {/* Left Panel — Trend Feed */}
      <div className="w-full lg:w-3/5 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <TrendFilters active={sourceFilter} onChange={setSourceFilter} counts={counts} />
            {(fetchedAt || sourceSummary) && (
              <p className="text-[10px] text-text-muted mt-2">
                {fetchedAt ? `Updated ${new Date(fetchedAt).toLocaleTimeString()}` : "Not fetched yet"}
                {sourceSummary ? ` · ${sourceSummary}` : ""}
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            className="text-xs font-medium px-3 py-1.5 rounded-md bg-surface-card border border-surface-border text-text-secondary hover:text-text-primary transition-colors shrink-0"
          >
            Refresh
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {loading ? (
            Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="bg-surface-card border border-surface-border rounded-xl h-24 animate-pulse" />
            ))
          ) : (
            filteredItems.map((item) => (
              <TrendCard
                key={item.id}
                item={item}
                selected={selectedIds.has(item.id)}
                onToggle={toggleSelection}
              />
            ))
          )}
        </div>

        <TrendActionBar
          selectedCount={selectedIds.size}
          onGoDeeper={handleGoDeeper}
          onAddToLivestream={handleAddSelectedToLivestream}
          deepDiveLoading={deepDiveLoading}
          addingToLivestream={addingToLivestream}
        />
      </div>

      {/* Right Panel — Deep Dive */}
      <div className="w-full lg:w-2/5 overflow-y-auto lg:border-l border-surface-border lg:pl-6">
        <DeepDivePanel
          items={deepDiveItems}
          loading={deepDiveLoading}
          query={deepDiveQuery}
          onAddToLivestream={handleAddSingleToLivestream}
        />
      </div>
    </div>
  );
}
