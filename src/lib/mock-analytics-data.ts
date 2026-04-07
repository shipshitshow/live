import type { MultiChannelReport, VideoStats, DailyMetric, ChannelStats } from "@/lib/types";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function generateDailyMetrics(days: number, scale = 1): DailyMetric[] {
  const metrics: DailyMetric[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const base = Math.round((800 + Math.sin(i * 0.3) * 300 + Math.random() * 200) * scale);
    metrics.push({
      day: daysAgo(i),
      views: base,
      watch_time_minutes: Math.round(base * 4.2),
      subscribers_gained: Math.round(base * 0.02 + Math.random() * 5),
      avg_view_duration_seconds: Math.round(120 + Math.random() * 180),
      avg_view_percentage: 20 + Math.random() * 40,
      likes: Math.round(base * 0.05 + Math.random() * 10),
    });
  }
  return metrics;
}

const MOCK_MAIN_CHANNEL: ChannelStats = {
  channel_id: "UCdemo-main",
  channel_title: "Ship Shit Show",
  subscriber_count: 4820,
  total_views: 59100,
  total_videos: 4,
};

const MOCK_CLIPS_CHANNEL: ChannelStats = {
  channel_id: "UCdemo-clips",
  channel_title: "SSS Clips",
  subscriber_count: 1240,
  total_views: 23400,
  total_videos: 12,
};

const MOCK_MAIN_VIDEOS: VideoStats[] = [
  {
    video_id: "dQw4w9WgXcQ",
    title: "We Built a YouTube Channel Run by AI Agents — And It Runs Itself",
    published_at: daysAgo(5),
    views: 12480, likes: 843, comments: 156,
    impressions: 98200, ctr: 0.127,
    watch_time_minutes: 52400, avg_view_duration_seconds: 252,
    channel_id: "UCdemo-main", channel_label: "main",
  },
  {
    video_id: "jNQXAC9IVRw",
    title: "How We Automated Video Editing with AI — No Human Touched the Timeline",
    published_at: daysAgo(12),
    views: 8920, likes: 612, comments: 89,
    impressions: 72100, ctr: 0.124,
    watch_time_minutes: 38100, avg_view_duration_seconds: 256,
    channel_id: "UCdemo-main", channel_label: "main",
  },
  {
    video_id: "9bZkp7q19f0",
    title: "The AI That Writes Our Scripts Is Getting Scary Good",
    published_at: daysAgo(19),
    views: 15600, likes: 1240, comments: 312,
    impressions: 145000, ctr: 0.108,
    watch_time_minutes: 71200, avg_view_duration_seconds: 274,
    channel_id: "UCdemo-main", channel_label: "main",
  },
  {
    video_id: "kJQP7kiw5Fk",
    title: "We Gave AI Agents a $0 Budget to Grow a YouTube Channel",
    published_at: daysAgo(26),
    views: 22100, likes: 1890, comments: 445,
    impressions: 198000, ctr: 0.112,
    watch_time_minutes: 98500, avg_view_duration_seconds: 267,
    channel_id: "UCdemo-main", channel_label: "main",
  },
];

const MOCK_CLIPS_VIDEOS: VideoStats[] = [
  {
    video_id: "clip01",
    title: "\"This Changes Everything\" — AI Agent Builds Its Own Team",
    published_at: daysAgo(3),
    views: 4200, likes: 310, comments: 42,
    impressions: 38000, ctr: 0.111,
    watch_time_minutes: 8400, avg_view_duration_seconds: 120,
    channel_id: "UCdemo-clips", channel_label: "clips",
  },
  {
    video_id: "clip02",
    title: "The Moment We Realized Our AI Was Better Than Us",
    published_at: daysAgo(8),
    views: 6800, likes: 520, comments: 67,
    impressions: 52000, ctr: 0.131,
    watch_time_minutes: 12200, avg_view_duration_seconds: 108,
    channel_id: "UCdemo-clips", channel_label: "clips",
  },
  {
    video_id: "clip03",
    title: "Why Every Dev Should Try Vibe Coding (60 Second Take)",
    published_at: daysAgo(15),
    views: 3100, likes: 240, comments: 31,
    impressions: 28000, ctr: 0.111,
    watch_time_minutes: 5100, avg_view_duration_seconds: 99,
    channel_id: "UCdemo-clips", channel_label: "clips",
  },
];

function combineDailyMetrics(a: DailyMetric[], b: DailyMetric[]): DailyMetric[] {
  const byDay = new Map<string, DailyMetric>();
  for (const m of [...a, ...b]) {
    const existing = byDay.get(m.day);
    if (existing) {
      const totalViews = existing.views + m.views;
      existing.watch_time_minutes += m.watch_time_minutes;
      existing.subscribers_gained += m.subscribers_gained;
      existing.likes += m.likes;
      existing.avg_view_duration_seconds = totalViews > 0
        ? (existing.avg_view_duration_seconds * existing.views + m.avg_view_duration_seconds * m.views) / totalViews
        : 0;
      existing.avg_view_percentage = totalViews > 0
        ? (existing.avg_view_percentage * existing.views + m.avg_view_percentage * m.views) / totalViews
        : 0;
      existing.views = totalViews;
    } else {
      byDay.set(m.day, { ...m });
    }
  }
  return Array.from(byDay.values()).sort((a, b) => a.day.localeCompare(b.day));
}

export function getMockMultiChannelReport(days: number): MultiChannelReport {
  const mainDaily = generateDailyMetrics(days, 1);
  const clipsDaily = generateDailyMetrics(days, 0.4);

  return {
    channels: [MOCK_MAIN_CHANNEL, MOCK_CLIPS_CHANNEL],
    videos: [...MOCK_MAIN_VIDEOS, ...MOCK_CLIPS_VIDEOS].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    ),
    daily_metrics: combineDailyMetrics(mainDaily, clipsDaily),
    per_channel: {
      [MOCK_MAIN_CHANNEL.channel_id]: {
        channel: MOCK_MAIN_CHANNEL,
        videos: MOCK_MAIN_VIDEOS,
        daily_metrics: mainDaily,
      },
      [MOCK_CLIPS_CHANNEL.channel_id]: {
        channel: MOCK_CLIPS_CHANNEL,
        videos: MOCK_CLIPS_VIDEOS,
        daily_metrics: clipsDaily,
      },
    },
  };
}
