"use client";

import { useState } from "react";
import type { Topic, TopicStatus } from "@shipshitshow/types";
import { TopicCard } from "./TopicCard";

const COLUMN_CONFIG: Record<TopicStatus, { label: string; color: string; dot: string }> = {
  backlog: { label: "Backlog", color: "text-text-secondary", dot: "bg-text-muted" },
  in_progress: { label: "In Progress", color: "text-accent-red", dot: "bg-accent-red" },
  done: { label: "Done", color: "text-green-400", dot: "bg-green-400" },
};

interface KanbanColumnProps {
  status: TopicStatus;
  topics: Topic[];
  onStatusChange: (slug: string, status: TopicStatus) => void;
  onSelect: (slug: string) => void;
}

export function KanbanColumn({ status, topics, onStatusChange, onSelect }: KanbanColumnProps) {
  const config = COLUMN_CONFIG[status];
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={`flex-1 min-w-[280px] rounded-xl p-2 transition-colors ${
        dragOver ? "bg-surface-elevated ring-1 ring-accent-red/30" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const slug = e.dataTransfer.getData("text/plain");
        if (slug) {
          onStatusChange(slug, status);
        }
      }}
    >
      <div className="flex items-center gap-2 mb-4 px-1">
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
        <h2 className={`text-xs font-semibold uppercase tracking-widest ${config.color}`}>
          {config.label}
        </h2>
        <span className="text-[10px] text-text-muted font-mono ml-auto">
          {topics.length}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {topics.map((topic) => (
          <TopicCard
            key={topic.slug}
            topic={topic}
            onStatusChange={onStatusChange}
            onSelect={onSelect}
          />
        ))}
        {topics.length === 0 && (
          <div className={`border border-dashed rounded-xl p-6 text-center transition-colors ${
            dragOver ? "border-accent-red/40 bg-accent-red/5" : "border-surface-border"
          }`}>
            <p className="text-xs text-text-muted">
              {dragOver ? "Drop here" : "No topics"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
