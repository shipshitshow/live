"use client";

import * as React from "react";
import { cn } from "./cn";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-xl border border-surface-border bg-surface-card px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-accent-red/40 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
