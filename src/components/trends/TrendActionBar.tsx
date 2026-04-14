"use client";

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
      <button
        onClick={onGoDeeper}
        disabled={selectedCount === 0 || deepDiveLoading}
        className="text-xs font-medium px-4 py-2 rounded-lg bg-surface-elevated border border-surface-border text-text-secondary hover:text-text-primary hover:border-accent-red/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {deepDiveLoading ? "Searching..." : "Go Deeper"}
      </button>
      <button
        onClick={onAddToLivestream}
        disabled={selectedCount === 0 || addingToLivestream}
        className="text-xs font-medium px-4 py-2 rounded-lg bg-accent-red/10 text-accent-red hover:bg-accent-red/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {addingToLivestream ? "Adding..." : `Add to Livestream (${selectedCount})`}
      </button>
      <button
        onClick={onOpenInTerminal}
        disabled={selectedCount === 0}
        className="text-xs font-medium px-4 py-2 rounded-lg bg-surface-elevated border border-surface-border text-text-secondary hover:text-text-primary hover:border-accent-red/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Use in Terminal
      </button>
    </div>
  );
}
