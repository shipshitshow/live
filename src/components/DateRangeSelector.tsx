"use client";

import clsx from "clsx";
import type { DateRange } from "@/lib/types";

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (v: DateRange) => void;
}

const OPTIONS: { label: string; value: DateRange }[] = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
];

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex gap-1 bg-surface-elevated border border-surface-border rounded-lg p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
            value === opt.value
              ? "bg-accent-red text-white"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
