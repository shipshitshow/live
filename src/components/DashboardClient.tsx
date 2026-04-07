"use client";

import { useState, useEffect, useCallback } from "react";
import { StatCard } from "@/components/StatCard";
import { TimeSeriesChart } from "@/components/TimeSeriesChart";
import { VideoTable } from "@/components/VideoTable";
import { DateRangeSelector } from "@/components/DateRangeSelector";
import { formatNumber, formatWatchTime, formatCtr } from "@/lib/format";
import type { AnalyticsReport, DateRange } from "@/lib/types";

export function DashboardClient() {
  const [days, setDays] = useState<DateRange>(30);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/report?days=${days}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data: AnalyticsReport = await res.json();
      setReport(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="text-accent-red text-4xl">⚠</div>
        <p className="text-text-secondary text-sm">{error}</p>
        <button
          onClick={load}
          className="text-xs px-4 py-2 bg-surface-card border border-surface-border rounded-lg hover:border-accent-red transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const channel = report?.channel;
  const daily = report?.daily_metrics ?? [];
  const videos = report?.videos ?? [];

  // Aggregate period totals from daily metrics
  const periodViews = daily.reduce((s, d) => s + d.views, 0);
  const periodWatchTime = daily.reduce((s, d) => s + d.watch_time_minutes, 0);
  const periodSubs = daily.reduce((s, d) => s + d.subscribers_gained, 0);
  const avgCtr =
    daily.length > 0
      ? daily.reduce((s, d) => s + d.ctr, 0) / daily.length
      : 0;

  return (
    <div className="space-y-8">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            {channel?.channel_title ?? "Channel Analytics"}
          </h2>
          <p className="text-text-muted text-sm mt-0.5">
            {channel
              ? `${formatNumber(channel.total_videos)} videos · ${formatNumber(channel.subscriber_count)} subscribers`
              : "Loading channel data…"}
          </p>
        </div>
        <DateRangeSelector value={days} onChange={setDays} />
      </div>

      {/* KPI cards */}
      <div
        className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-opacity duration-200 ${loading ? "opacity-50" : ""}`}
      >
        <StatCard
          label="Views"
          value={formatNumber(periodViews)}
          sub={`last ${days} days`}
        />
        <StatCard
          label="Watch Time"
          value={formatWatchTime(periodWatchTime)}
          sub={`last ${days} days`}
        />
        <StatCard
          label="Subscribers Gained"
          value={formatNumber(periodSubs)}
          sub={`last ${days} days`}
          accent={periodSubs > 0}
        />
        <StatCard
          label="Avg CTR"
          value={formatCtr(avgCtr)}
          sub={`last ${days} days`}
        />
      </div>

      {/* Time-series charts */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-200 ${loading ? "opacity-50" : ""}`}>
        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-4">
            Views over time
          </h3>
          <TimeSeriesChart
            data={daily}
            dataKey="views"
            formatValue={formatNumber}
            formatTick={(v: number) => formatNumber(v)}
          />
        </div>

        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-4">
            Subscriber growth
          </h3>
          <TimeSeriesChart
            data={daily}
            dataKey="subscribers_gained"
            color="#22c55e"
            formatValue={(v: number) => `+${formatNumber(v)}`}
            formatTick={(v: number) => formatNumber(v)}
          />
        </div>

        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-4">
            Watch time (minutes)
          </h3>
          <TimeSeriesChart
            data={daily}
            dataKey="watch_time_minutes"
            color="#f59e0b"
            formatValue={formatWatchTime}
            formatTick={(v: number) => formatWatchTime(v)}
          />
        </div>

        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-4">
            CTR
          </h3>
          <TimeSeriesChart
            data={daily}
            dataKey="ctr"
            color="#8b5cf6"
            formatValue={formatCtr}
            formatTick={(v: number) => `${(v * 100).toFixed(0)}%`}
          />
        </div>
      </div>

      {/* Videos table */}
      <div className={`bg-surface-card border border-surface-border rounded-xl transition-opacity duration-200 ${loading ? "opacity-50" : ""}`}>
        <div className="px-5 pt-5 pb-3 border-b border-surface-border">
          <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest">
            Videos — {videos.length} total
          </h3>
        </div>
        <VideoTable videos={videos} />
      </div>
    </div>
  );
}
