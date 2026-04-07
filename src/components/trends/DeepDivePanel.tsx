"use client";

import type { TrendItem, TrendSource } from "@/lib/trends-types";
import { TrendCard } from "./TrendCard";

const SOURCE_ORDER: TrendSource[] = ["hackernews", "reddit", "youtube", "x"];
const SOURCE_LABELS: Record<TrendSource, string> = {
  hackernews: "Hacker News",
  reddit: "Reddit",
  youtube: "YouTube",
  x: "X",
};

interface DeepDivePanelProps {
  items: TrendItem[];
  loading: boolean;
  query: string | null;
  onAddToLivestream: (item: TrendItem) => void;
}

export function DeepDivePanel({ items, loading, query, onAddToLivestream }: DeepDivePanelProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="text-xs text-text-muted font-mono mb-3">Searching for &ldquo;{query}&rdquo;...</div>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="bg-surface-card border border-surface-border rounded-xl h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-24">
        <p className="text-sm text-text-muted">Select trends and hit Go Deeper</p>
        <p className="text-xs text-text-muted mt-1">Related content will appear here</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-24">
        <p className="text-sm text-text-muted">No results for &ldquo;{query}&rdquo;</p>
      </div>
    );
  }

  const grouped = new Map<TrendSource, TrendItem[]>();
  for (const item of items) {
    const list = grouped.get(item.source) || [];
    list.push(item);
    grouped.set(item.source, list);
  }

  return (
    <div className="space-y-6">
      <div className="text-xs text-text-muted font-mono">
        Deep dive: &ldquo;{query}&rdquo; &mdash; {items.length} results
      </div>
      {SOURCE_ORDER.filter((s) => grouped.has(s)).map((source) => (
        <div key={source}>
          <h4 className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-2">
            {SOURCE_LABELS[source]}
          </h4>
          <div className="space-y-2">
            {grouped.get(source)!.map((item) => (
              <TrendCard
                key={item.id}
                item={item}
                selected={false}
                onToggle={() => {}}
                compact
                onAddToLivestream={onAddToLivestream}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
