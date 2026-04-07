"use client";

import type { Topic, TopicStatus } from "@/lib/livestream-types";

const SOURCE_COLORS: Record<string, string> = {
  HN: "bg-orange-500/20 text-orange-400",
  X: "bg-blue-400/20 text-blue-400",
  YouTube: "bg-red-500/20 text-red-400",
  Reddit: "bg-orange-600/20 text-orange-300",
  GitHub: "bg-purple-500/20 text-purple-400",
};

interface TopicCardProps {
  topic: Topic;
  onStatusChange: (slug: string, status: TopicStatus) => void;
  onSelect: (slug: string) => void;
}

export function TopicCard({ topic, onStatusChange, onSelect }: TopicCardProps) {
  const sources = topic.source.split(",").map((s) => s.trim());

  const summary = topic.content
    .split("\n")
    .find((line) => line.length > 20 && !line.startsWith("#") && !line.startsWith("-"))
    ?.slice(0, 140) + "...";

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", topic.slug);
        e.dataTransfer.effectAllowed = "move";
        (e.currentTarget as HTMLElement).style.opacity = "0.4";
      }}
      onDragEnd={(e) => {
        (e.currentTarget as HTMLElement).style.opacity = "1";
      }}
      className="bg-surface-card border border-surface-border rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-accent-red/40 transition-colors group"
      onClick={() => onSelect(topic.slug)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-red transition-colors leading-tight">
          {topic.title}
        </h3>
      </div>

      <div className="flex gap-1.5 mb-3">
        {sources.map((src) => (
          <span
            key={src}
            className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
              SOURCE_COLORS[src] || "bg-surface-border text-text-secondary"
            }`}
          >
            {src}
          </span>
        ))}
      </div>

      {summary && (
        <p className="text-xs text-text-secondary leading-relaxed mb-3">
          {summary}
        </p>
      )}

      <div className="flex gap-2">
        {topic.status === "backlog" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(topic.slug, "in_progress");
            }}
            className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-accent-red/10 text-accent-red hover:bg-accent-red/20 transition-colors"
          >
            Select for tonight
          </button>
        )}
        {topic.status === "in_progress" && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(topic.slug, "done");
              }}
              className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
            >
              Mark covered
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(topic.slug, "backlog");
              }}
              className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-surface-border text-text-muted hover:text-text-secondary transition-colors"
            >
              Drop
            </button>
          </>
        )}
        {topic.status === "done" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(topic.slug, "in_progress");
            }}
            className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-surface-border text-text-muted hover:text-text-secondary transition-colors"
          >
            Reopen
          </button>
        )}
      </div>
    </div>
  );
}
