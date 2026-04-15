"use client";

import { Button } from "@/components/ui/button";

interface TrendActionBarProps {
  selectedCount: number;
  onGoDeeper: () => void;
  onAddToLivestream: () => void;
  onOpenInTerminal: () => void;
  deepDiveLoading: boolean;
  addingToLivestream: boolean;
}

export function TrendActionBar({
  selectedCount,
  onGoDeeper,
  onAddToLivestream,
  onOpenInTerminal,
  deepDiveLoading,
  addingToLivestream,
}: TrendActionBarProps) {
  return (
    <div className="flex items-center gap-3 pt-4 border-t border-surface-border">
      <Button
        onClick={onGoDeeper}
        disabled={selectedCount === 0 || deepDiveLoading}
        className="text-xs hover:border-accent-red/40"
      >
        {deepDiveLoading ? "Searching..." : "Go Deeper"}
      </Button>
      <Button
        onClick={onAddToLivestream}
        disabled={selectedCount === 0 || addingToLivestream}
        className="text-xs bg-accent-red/10 text-accent-red hover:bg-accent-red/20 hover:text-accent-red"
      >
        {addingToLivestream ? "Adding..." : `Add to Livestream (${selectedCount})`}
      </Button>
      <Button
        onClick={onOpenInTerminal}
        disabled={selectedCount === 0}
        className="text-xs hover:border-accent-red/40"
      >
        Use in Terminal
      </Button>
    </div>
  );
}
