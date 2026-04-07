import type { AnalyticsReport, DateRange } from "@/lib/types";

const API_BASE = process.env.ANALYTICS_API_URL ?? "http://localhost:8000";

export async function fetchReport(days: DateRange): Promise<AnalyticsReport> {
  const res = await fetch(`${API_BASE}/api/report?days=${days}`, {
    next: { revalidate: 300 }, // cache for 5 min
  });
  if (!res.ok) {
    throw new Error(`Analytics API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<AnalyticsReport>;
}
