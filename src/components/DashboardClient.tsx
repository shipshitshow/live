"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { StatCard } from "@/components/StatCard";
import { TimeSeriesChart, type ChartLine } from "@/components/TimeSeriesChart";
import { VideoTable } from "@/components/VideoTable";
import { TopVideos } from "@/components/TopVideos";
import { DateRangeSelector } from "@/components/DateRangeSelector";
import { ChannelSelector } from "@/components/ChannelSelector";
import { AuthStatus } from "@/components/AuthStatus";
import { formatNumber, formatWatchTime } from "@/lib/format";
import type { MultiChannelReport, DateRange, ChannelFilter, DailyMetric, VideoStats, ChannelStats } from "@/lib/types";

export function DashboardClient() {
  const [days, setDays] = useState<DateRange>(30);
  const [report, setReport] = useState<MultiChannelReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/report?days=${days}`);
      const data = await res.json() as MultiChannelReport | { error?: string; reauthRequired?: boolean };
      if (!res.ok) {
        if ("reauthRequired" in data && data.reauthRequired) {
          window.location.href = `/auth/youtube?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
          return;
        }
        throw new Error("error" in data && data.error ? data.error : `API error ${res.status}`);
      }
      setReport(data as MultiChannelReport);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  // Derive displayed data from channel filter
  // Channel label colors for multi-line charts
  const CHANNEL_COLORS: Record<string, string> = {
    main: "#ff2d20",
    clips: "#ff7b72",
  };

  const { channels, daily, videos, headerTitle, headerSub, multiChartData, isMulti } = useMemo(() => {
    if (!report) {
      return {
        channels: [] as ChannelStats[],
        daily: [] as DailyMetric[],
        videos: [] as VideoStats[],
        headerTitle: "Channel Analytics",
        headerSub: "Loading channel data…",
        multiChartData: null as null | Record<string, unknown>[],
        isMulti: false,
      };
    }

    if (channelFilter === "all") {
      const totalSubs = report.channels.reduce((s, c) => s + c.subscriber_count, 0);
      const totalVids = report.channels.reduce((s, c) => s + c.total_videos, 0);

      // Build merged chart data: { day, views_main, views_clips, ... }
      const perChannelEntries = Object.entries(report.per_channel);
      const dayMap = new Map<string, Record<string, unknown>>();

      for (const [, chData] of perChannelEntries) {
        const label = chData.channel.channel_title.toLowerCase().includes("clip") ? "clips" : "main";
        for (const m of chData.daily_metrics) {
          const existing = dayMap.get(m.day) || { day: m.day };
          existing[`views_${label}`] = m.views;
          existing[`watch_time_minutes_${label}`] = m.watch_time_minutes;
          existing[`subscribers_gained_${label}`] = m.subscribers_gained;
          existing[`avg_view_percentage_${label}`] = m.avg_view_percentage;
          dayMap.set(m.day, existing);
        }
      }

      const merged = Array.from(dayMap.values()).sort((a, b) =>
        (a.day as string).localeCompare(b.day as string)
      );

      return {
        channels: report.channels,
        daily: report.daily_metrics,
        videos: report.videos,
        headerTitle: "All",
        headerSub: `${formatNumber(totalVids)} videos · ${formatNumber(totalSubs)} subscribers`,
        multiChartData: merged,
        isMulti: perChannelEntries.length > 1,
      };
    }

    const chData = report.per_channel[channelFilter];
    if (!chData) {
      return {
        channels: report.channels,
        daily: report.daily_metrics,
        videos: report.videos,
        headerTitle: "All Channels",
        headerSub: "",
        multiChartData: null,
        isMulti: false,
      };
    }

    return {
      channels: report.channels,
      daily: chData.daily_metrics,
      videos: chData.videos,
      headerTitle: chData.channel.channel_title,
      headerSub: `${formatNumber(chData.channel.total_videos)} videos · ${formatNumber(chData.channel.subscriber_count)} subscribers`,
      multiChartData: null,
      isMulti: false,
    };
  }, [report, channelFilter]);

  // Build chart line configs for multi-channel view
  function makeLines(metric: string): ChartLine[] {
    return [
      { dataKey: `${metric}_main`, color: CHANNEL_COLORS.main, label: "Main" },
      { dataKey: `${metric}_clips`, color: CHANNEL_COLORS.clips, label: "Clips" },
    ];
  }

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

  // Aggregate period totals from daily metrics
  const periodViews = daily.reduce((s, d) => s + d.views, 0);
  const periodWatchTime = daily.reduce((s, d) => s + d.watch_time_minutes, 0);
  const periodSubs = daily.reduce((s, d) => s + d.subscribers_gained, 0);
  const avgViewPct =
    daily.length > 0
      ? daily.reduce((s, d) => s + d.avg_view_percentage, 0) / daily.length
      : 0;

  return (
    <div className="space-y-8">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-text-primary">
              {headerTitle}
            </h2>
            <AuthStatus />
          </div>
          <p className="text-text-muted text-sm mt-0.5">{headerSub}</p>
        </div>
        <div className="flex items-center gap-3">
          {channels.length > 1 && (
            <ChannelSelector
              channels={channels}
              selected={channelFilter}
              onChange={setChannelFilter}
            />
          )}
          <DateRangeSelector value={days} onChange={setDays} />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Views"
          value={formatNumber(periodViews)}
          sub={`last ${days} days`}
          loading={loading}
        />
        <StatCard
          label="Watch Time"
          value={formatWatchTime(periodWatchTime)}
          sub={`last ${days} days`}
          loading={loading}
        />
        <StatCard
          label="Subscribers Gained"
          value={formatNumber(periodSubs)}
          sub={`last ${days} days`}
          accent={periodSubs > 0}
          loading={loading}
        />
        <StatCard
          label="Avg View %"
          value={`${avgViewPct.toFixed(1)}%`}
          sub={`last ${days} days`}
          loading={loading}
        />
      </div>

      {/* Time-series charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Views over time", key: "views", color: undefined, fmtVal: formatNumber, fmtTick: (v: number) => formatNumber(v) },
          { label: "Subscriber growth", key: "subscribers_gained", color: "#22c55e", fmtVal: (v: number) => `+${formatNumber(v)}`, fmtTick: (v: number) => formatNumber(v) },
          { label: "Watch time (minutes)", key: "watch_time_minutes", color: "#f59e0b", fmtVal: formatWatchTime, fmtTick: (v: number) => formatWatchTime(v) },
          { label: "Avg view %", key: "avg_view_percentage", color: "#8b5cf6", fmtVal: (v: number) => `${v.toFixed(1)}%`, fmtTick: (v: number) => `${v.toFixed(0)}%` },
        ].map((chart) => (
          <div key={chart.key} className="bg-surface-card border border-surface-border rounded-xl p-5">
            <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-4">
              {chart.label}
            </h3>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <TimeSeriesChart
                data={isMulti && multiChartData ? multiChartData : daily}
                dataKey={chart.key}
                color={chart.color}
                formatValue={chart.fmtVal}
                formatTick={chart.fmtTick}
                lines={isMulti ? makeLines(chart.key) : undefined}
              />
            )}
          </div>
        ))}
      </div>

      {/* Best performers */}
      {loading ? (
        <TopVideosSkeleton />
      ) : (
        <TopVideos videos={videos} />
      )}

      {/* Videos table */}
      {loading ? (
        <VideoTableSkeleton />
      ) : (
        <div className="bg-surface-card border border-surface-border rounded-xl">
          <div className="px-5 pt-5 pb-3 border-b border-surface-border">
            <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest">
              Videos — {videos.length} total
            </h3>
          </div>
          <VideoTable videos={videos} showChannel={channelFilter === "all" && channels.length > 1} />
        </div>
      )}
    </div>
  );
}

const SKELETON_HEIGHTS = [43, 50, 62, 52, 47, 28, 15, 19, 27, 48, 45, 52, 71, 41, 26, 14, 9, 14, 30, 54];

function ChartSkeleton() {
  return (
    <div className="h-[180px] flex items-end gap-1.5 px-2">
      {SKELETON_HEIGHTS.map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-surface-elevated rounded-t animate-pulse"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

function TopVideosSkeleton() {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl">
      <div className="px-5 pt-5 pb-3 border-b border-surface-border">
        <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest">
          Best Performers
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-surface-border">
        {[0, 1, 2].map((col) => (
          <div key={col} className="p-5">
            <div className="h-4 w-16 bg-surface-elevated rounded animate-pulse mb-4" />
            <div className="flex flex-col gap-4">
              {[0, 1, 2].map((row) => (
                <div key={row} className="flex gap-3">
                  <div className="w-5 h-5 bg-surface-elevated rounded animate-pulse" />
                  <div className="w-28 h-16 bg-surface-elevated rounded-lg animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-full bg-surface-elevated rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-surface-elevated rounded animate-pulse" />
                    <div className="h-2 w-1/2 bg-surface-elevated rounded animate-pulse mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoTableSkeleton() {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl">
      <div className="px-5 pt-5 pb-3 border-b border-surface-border">
        <div className="h-3 w-28 bg-surface-elevated rounded animate-pulse" />
      </div>
      <div className="divide-y divide-surface-border/50">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="h-3 flex-1 max-w-xs bg-surface-elevated rounded animate-pulse" />
            <div className="h-3 w-12 bg-surface-elevated rounded animate-pulse" />
            <div className="h-3 w-12 bg-surface-elevated rounded animate-pulse" />
            <div className="h-3 w-10 bg-surface-elevated rounded animate-pulse" />
            <div className="h-3 w-14 bg-surface-elevated rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
