"use client";

import type { TrendSource } from "@/lib/trends-types";

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
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors ${
            active === f.value
              ? "bg-accent-red/10 text-accent-red"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          {f.label}
          <span className="ml-1 opacity-60">{counts[f.value]}</span>
        </button>
      ))}
    </div>
  );
}

export type { FilterValue };
