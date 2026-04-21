"use client";

import { Button } from "@shipshitshow/ui";
import type { TrendSource } from "@shipshitshow/types";

type FilterValue = "all" | TrendSource;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hackernews", label: "HN" },
  { value: "reddit", label: "Reddit" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X" },
];

interface TrendFiltersProps {
  active: FilterValue;
  onChange: (value: FilterValue) => void;
  counts: Record<FilterValue, number>;
}

export function TrendFilters({ active, onChange, counts }: TrendFiltersProps) {
  return (
    <div className="flex gap-1.5">
      {FILTERS.map((f) => (
        <Button
          key={f.value}
          onClick={() => onChange(f.value)}
          size="sm"
          variant={active === f.value ? "accent" : "ghost"}
          className={`rounded-md text-[11px] transition-colors ${
            active === f.value
              ? "bg-accent-red/10 text-accent-red hover:bg-accent-red/10 hover:text-accent-red"
              : "text-text-muted hover:bg-transparent hover:text-text-secondary"
          }`}
        >
          {f.label}
          <span className="ml-1 opacity-60">{counts[f.value]}</span>
        </Button>
      ))}
    </div>
  );
}

export type { FilterValue };
