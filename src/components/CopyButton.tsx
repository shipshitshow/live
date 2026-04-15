"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  text: string;
  className?: string;
  timeoutMs?: number;
}

export function CopyButton({ text, className, timeoutMs = 1500 }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), timeoutMs);
      }}
      size="sm"
      variant="ghost"
      className={
        className ??
        "rounded bg-surface-border text-[10px] text-text-muted hover:bg-surface-border hover:text-text-primary"
      }
    >
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}
