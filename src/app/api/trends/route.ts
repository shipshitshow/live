import { NextResponse } from "next/server";
import type { TrendItem, TrendSource, TrendsResponse } from "@/lib/trends-types";
import { fetchHNTrending } from "@/lib/trends/hackernews";
import { fetchRedditTrending } from "@/lib/trends/reddit";
import { fetchYouTubeTrending } from "@/lib/trends/youtube";
import { fetchXTrending } from "@/lib/trends/x";

type Fetcher = () => Promise<TrendItem[]>;

const FETCHERS: [TrendSource, Fetcher][] = [
  ["hackernews", fetchHNTrending],
  ["reddit", fetchRedditTrending],
  ["youtube", fetchYouTubeTrending],
  ["x", fetchXTrending],
];

export async function GET() {
  const sources: Record<TrendSource, "ok" | "error"> = {
    hackernews: "error",
    reddit: "error",
    youtube: "error",
    x: "error",
  };

  const results = await Promise.allSettled(
    FETCHERS.map(async ([source, fetcher]) => {
      const items = await fetcher();
      sources[source] = "ok";
      return items;
    })
  );

  const items: TrendItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    }
  }

  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const response: TrendsResponse = {
    items,
    fetchedAt: new Date().toISOString(),
    sources,
  };

  return NextResponse.json(response, {
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
  });
}
