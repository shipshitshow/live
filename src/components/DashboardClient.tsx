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
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data: MultiChannelReport = await res.json();
      setReport(data);
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
    clips: "#3b82f6",
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
          label="Avg View %"
          value={`${avgViewPct.toFixed(1)}%`}
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
            data={isMulti && multiChartData ? multiChartData : daily}
            dataKey="views"
            formatValue={formatNumber}
            formatTick={(v: number) => formatNumber(v)}
            lines={isMulti ? makeLines("views") : undefined}
          />
        </div>

        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-4">
            Subscriber growth
          </h3>
          <TimeSeriesChart
            data={isMulti && multiChartData ? multiChartData : daily}
            dataKey="subscribers_gained"
            color="#22c55e"
            formatValue={(v: number) => `+${formatNumber(v)}`}
            formatTick={(v: number) => formatNumber(v)}
            lines={isMulti ? makeLines("subscribers_gained") : undefined}
          />
        </div>

        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-4">
            Watch time (minutes)
          </h3>
          <TimeSeriesChart
            data={isMulti && multiChartData ? multiChartData : daily}
            dataKey="watch_time_minutes"
            color="#f59e0b"
            formatValue={formatWatchTime}
            formatTick={(v: number) => formatWatchTime(v)}
            lines={isMulti ? makeLines("watch_time_minutes") : undefined}
          />
        </div>

        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-4">
            Avg view %
          </h3>
          <TimeSeriesChart
            data={isMulti && multiChartData ? multiChartData : daily}
            dataKey="avg_view_percentage"
            color="#8b5cf6"
            formatValue={(v: number) => `${v.toFixed(1)}%`}
            formatTick={(v: number) => `${v.toFixed(0)}%`}
            lines={isMulti ? makeLines("avg_view_percentage") : undefined}
          />
        </div>
      </div>

      {/* Best performers */}
      <div className={`transition-opacity duration-200 ${loading ? "opacity-50" : ""}`}>
        <TopVideos videos={videos} />
      </div>

      {/* Videos table */}
      <div className={`bg-surface-card border border-surface-border rounded-xl transition-opacity duration-200 ${loading ? "opacity-50" : ""}`}>
        <div className="px-5 pt-5 pb-3 border-b border-surface-border">
          <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest">
            Videos — {videos.length} total
          </h3>
        </div>
        <VideoTable videos={videos} showChannel={channelFilter === "all" && channels.length > 1} />
      </div>
    </div>
  );
}
