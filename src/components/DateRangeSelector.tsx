"use client";

import clsx from "clsx";
import { Button } from "@/components/ui/button";
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
        <Button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          size="sm"
          variant={value === opt.value ? "accent" : "ghost"}
          className={clsx(
            "rounded-md text-xs transition-all",
            value === opt.value
              ? "hover:bg-accent-red"
              : "text-text-secondary hover:bg-transparent hover:text-text-primary"
          )}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
