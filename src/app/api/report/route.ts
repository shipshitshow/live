import { NextRequest, NextResponse } from "next/server";
import type { ErrorResponse, ReauthRequiredResponse } from "@/lib/api-types";
import {
  hasYouTubeCredentials,
  getAccessToken,
  getChannelConfigs,
  isYouTubeReauthError,
} from "@/lib/youtube/token";
import {
  fetchChannelStats,
  fetchChannelVideos,
  fetchDailyMetrics,
  fetchVideoAnalytics,
} from "@/lib/youtube/client";
import { formatLocalDate, todayLocalDate } from "@/lib/date";
import type { MultiChannelReport, DailyMetric, VideoStats } from "@/lib/types";

function getEmptyReport(): MultiChannelReport {
  return {
    channels: [],
    videos: [],
    daily_metrics: [],
    per_channel: {},
  };
}

function daysAgoDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatLocalDate(d);
}

function todayDate(): string {
  return todayLocalDate();
}

/** Combine daily metrics from multiple channels. CTR is weighted by impressions. */
function combineDailyMetrics(...metricSets: DailyMetric[][]): DailyMetric[] {
  const byDay = new Map<string, DailyMetric>();

  for (const metrics of metricSets) {
    for (const m of metrics) {
      const existing = byDay.get(m.day);
      if (existing) {
        const existingViews = existing.views;
        const totalViews = existingViews + m.views;
        existing.views = totalViews;
        existing.watch_time_minutes += m.watch_time_minutes;
        existing.subscribers_gained += m.subscribers_gained;
        existing.likes += m.likes;
        // Weighted averages
        existing.avg_view_duration_seconds = totalViews > 0
          ? (existing.avg_view_duration_seconds * existingViews + m.avg_view_duration_seconds * m.views) / totalViews
          : 0;
        existing.avg_view_percentage = totalViews > 0
          ? (existing.avg_view_percentage * existingViews + m.avg_view_percentage * m.views) / totalViews
          : 0;
      } else {
        byDay.set(m.day, { ...m });
      }
    }
  }

  return Array.from(byDay.values()).sort((a, b) => a.day.localeCompare(b.day));
}

async function fetchChannelData(
  channelConfig: { id: string; label: string; refreshToken: string },
  startDate: string,
  endDate: string
) {
  const token = await getAccessToken(channelConfig);

  const [stats, videos, daily] = await Promise.all([
    fetchChannelStats(token, channelConfig.id),
    fetchChannelVideos(token, channelConfig.id),
    fetchDailyMetrics(token, channelConfig.id, startDate, endDate),
  ]);

  // Enrich videos with analytics data
  const videoIds = videos.map((v) => v.video_id);
  let enrichedVideos: VideoStats[] = videos;

  if (videoIds.length > 0) {
    const analytics = await fetchVideoAnalytics(
      token,
      channelConfig.id,
      videoIds,
      startDate,
      endDate
    );

    enrichedVideos = videos.map((v) => {
      const a = analytics.get(v.video_id);
      return {
        ...v,
        impressions: a?.impressions ?? v.impressions,
        ctr: a?.ctr ?? v.ctr,
        watch_time_minutes: a?.watch_time_minutes ?? v.watch_time_minutes,
        channel_label: channelConfig.label,
      };
    });
  }

  return { stats, videos: enrichedVideos, daily };
}

export async function GET(req: NextRequest) {
  const days = Number(req.nextUrl.searchParams.get("days") ?? "30");
  const channels = await getChannelConfigs();

  if (!hasYouTubeCredentials() || channels.length === 0) {
    return NextResponse.json(getEmptyReport());
  }

  try {
    const startDate = daysAgoDate(days);
    const endDate = todayDate();

    // Fetch all channels in parallel (each with its own token)
    const results = await Promise.all(
      channels.map((ch) => fetchChannelData(ch, startDate, endDate))
    );

    const perChannel: MultiChannelReport["per_channel"] = {};
    const allVideos: VideoStats[] = [];
    const allDailyMetrics: DailyMetric[][] = [];
    const allChannelStats = [];

    for (let i = 0; i < channels.length; i++) {
      const ch = channels[i];
      const data = results[i];
      perChannel[ch.id] = {
        channel: data.stats,
        videos: data.videos,
        daily_metrics: data.daily,
      };
      allVideos.push(...data.videos);
      allDailyMetrics.push(data.daily);
      allChannelStats.push(data.stats);
    }

    allVideos.sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );

    const report: MultiChannelReport = {
      channels: allChannelStats,
      videos: allVideos,
      daily_metrics: combineDailyMetrics(...allDailyMetrics),
      per_channel: perChannel,
    };

    return NextResponse.json(report, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (error) {
    if (isYouTubeReauthError(error)) {
      const response: ReauthRequiredResponse = {
        error: "YouTube authentication expired. Reconnect YouTube to continue.",
        reauthRequired: true,
        channelLabel: error.channelLabel ?? null,
      };
      return NextResponse.json(
        response,
        { status: 401 }
      );
    }
    const response: ErrorResponse =
      error instanceof Error
        ? {
            code:
              'code' in error && typeof error.code === 'string'
                ? error.code
                : undefined,
            error: error.message,
            hint:
              'hint' in error && typeof error.hint === 'string'
                ? error.hint
                : undefined,
          }
        : {
            error: "Failed to load analytics report",
          };
    return NextResponse.json(response, { status: 503 });
  }
}
