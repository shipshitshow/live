import { NextRequest, NextResponse } from "next/server";
import { getMockReport } from "@/lib/mock-analytics-data";

const ANALYTICS_API = process.env.ANALYTICS_API_URL ?? "http://localhost:8000";

export async function GET(req: NextRequest) {
  const days = req.nextUrl.searchParams.get("days") ?? "30";

  try {
    const res = await fetch(`${ANALYTICS_API}/api/report?days=${days}`, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
    });
  } catch {
    // Analytics API unreachable — serve mock data for demo
    const report = getMockReport(Number(days) || 30);
    return NextResponse.json(report);
  }
}
