"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
}

const ITEMS: ChecklistItem[] = [
  { id: "visuals", label: "Visuals OK", description: "No glitches, correct pacing, transitions look good" },
  { id: "audio", label: "Audio OK", description: "Clear narration, no clipping, music levels balanced" },
  { id: "script", label: "Script Accuracy", description: "Facts are correct, tone matches brand, no errors" },
  { id: "thumbnail", label: "Thumbnail OK", description: "Eye-catching, readable title, correct aspect ratio" },
];

interface ReviewChecklistProps {
  onChange: (allChecked: boolean) => void;
}

export function ReviewChecklist({ onChange }: ReviewChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    onChange(ITEMS.every((item) => next[item.id]));
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-surface-border">
        <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest">
          Review Checklist
        </h3>
      </div>
      <div className="divide-y divide-surface-border">
        {ITEMS.map((item) => {
          const isChecked = !!checked[item.id];
          return (
            <Button
              key={item.id}
              onClick={() => toggle(item.id)}
              variant="ghost"
              className="h-auto w-full items-start justify-start gap-3 whitespace-normal px-5 py-4 text-left hover:bg-surface-elevated group"
            >
              <div
                className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border transition-all ${
                  isChecked
                    ? "bg-accent-red border-accent-red"
                    : "bg-transparent border-surface-border group-hover:border-text-muted"
                } flex items-center justify-center`}
              >
                {isChecked && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium transition-colors ${isChecked ? "text-text-primary" : "text-text-secondary"}`}>
                  {item.label}
                </p>
                <p className="text-xs text-text-muted mt-0.5">{item.description}</p>
              </div>
            </Button>
          );
        })}
      </div>
      <div className="px-5 py-3 border-t border-surface-border bg-surface-elevated">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-surface-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-red rounded-full transition-all duration-300"
              style={{ width: `${(Object.values(checked).filter(Boolean).length / ITEMS.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono text-text-muted">
            {Object.values(checked).filter(Boolean).length}/{ITEMS.length}
          </span>
        </div>
      </div>
    </div>
  );
}
