import type { AnalyticsReport, VideoStats, DailyMetric } from "@/lib/types";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function generateDailyMetrics(days: number): DailyMetric[] {
  const metrics: DailyMetric[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const base = 800 + Math.round(Math.sin(i * 0.3) * 300 + Math.random() * 200);
    metrics.push({
      day: daysAgo(i),
      views: base,
      watch_time_minutes: Math.round(base * 4.2),
      subscribers_gained: Math.round(base * 0.02 + Math.random() * 5),
      impressions: Math.round(base * 8.5),
      ctr: 0.04 + Math.random() * 0.03,
    });
  }
  return metrics;
}

const MOCK_VIDEOS: VideoStats[] = [
  {
    video_id: "dQw4w9WgXcQ",
    title: "We Built a YouTube Channel Run by AI Agents — And It Runs Itself",
    published_at: daysAgo(5),
    views: 12480,
    likes: 843,
    comments: 156,
    impressions: 98200,
    ctr: 0.127,
    watch_time_minutes: 52400,
    avg_view_duration_seconds: 252,
  },
  {
    video_id: "jNQXAC9IVRw",
    title: "How We Automated Video Editing with AI — No Human Touched the Timeline",
    published_at: daysAgo(12),
    views: 8920,
    likes: 612,
    comments: 89,
    impressions: 72100,
    ctr: 0.124,
    watch_time_minutes: 38100,
    avg_view_duration_seconds: 256,
  },
  {
    video_id: "9bZkp7q19f0",
    title: "The AI That Writes Our Scripts Is Getting Scary Good",
    published_at: daysAgo(19),
    views: 15600,
    likes: 1240,
    comments: 312,
    impressions: 145000,
    ctr: 0.108,
    watch_time_minutes: 71200,
    avg_view_duration_seconds: 274,
  },
  {
    video_id: "kJQP7kiw5Fk",
    title: "We Gave AI Agents a $0 Budget to Grow a YouTube Channel",
    published_at: daysAgo(26),
    views: 22100,
    likes: 1890,
    comments: 445,
    impressions: 198000,
    ctr: 0.112,
    watch_time_minutes: 98500,
    avg_view_duration_seconds: 267,
  },
];

export function getMockReport(days: number): AnalyticsReport {
  return {
    channel: {
      channel_id: "UCdemo12345",
      channel_title: "Ship Shit Show",
      subscriber_count: 4820,
      total_views: 59100,
      total_videos: 4,
    },
    videos: MOCK_VIDEOS,
    daily_metrics: generateDailyMetrics(days),
  };
}
