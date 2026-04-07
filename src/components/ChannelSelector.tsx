"use client";

import type { ChannelStats, ChannelFilter } from "@/lib/types";

interface ChannelSelectorProps {
  channels: ChannelStats[];
  selected: ChannelFilter;
  onChange: (filter: ChannelFilter) => void;
}

// Map known channel IDs to their YouTube handles
const CHANNEL_HANDLES: Record<string, string> = {
  "UCxuriP32znodU-8N7zkwuew": "@shipshitshow",
  "UCYX8Z9u0cP4T7Dpnm0EcT5Q": "@shipshitshowclips",
};

function getHandle(channel: ChannelStats): string {
  return CHANNEL_HANDLES[channel.channel_id] || channel.channel_title;
}

export function ChannelSelector({ channels, selected, onChange }: ChannelSelectorProps) {
  const options: { value: ChannelFilter; label: string }[] = [
    { value: "all", label: "All" },
    ...channels.map((ch) => ({
      value: ch.channel_id,
      label: getHandle(ch),
    })),
  ];

  return (
    <div className="flex items-center gap-1 bg-surface-card border border-surface-border rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
            selected === opt.value
              ? "bg-accent-red/10 text-accent-red"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
