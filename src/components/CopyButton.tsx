"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  className?: string;
  timeoutMs?: number;
}

export function CopyButton({ text, className, timeoutMs = 1500 }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), timeoutMs);
      }}
      className={
        className ??
        "text-[10px] font-medium px-2 py-1 rounded bg-surface-border text-text-muted hover:text-text-primary transition-colors"
      }
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
