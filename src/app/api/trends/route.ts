import { NextResponse } from "next/server";
import type { TrendItem, TrendSource, TrendsResponse } from "@/lib/trends-types";
import { fetchHNTrending } from "@/lib/trends/hackernews";
import { isAIRelevant } from "@/lib/trends/relevance";
import { fetchRedditTrending } from "@/lib/trends/reddit";
import { sortTrendItems } from "@/lib/trends/ranking";
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

  const response: TrendsResponse = {
    items: sortTrendItems(items.filter(isAIRelevant)),
    fetchedAt: new Date().toISOString(),
    sources,
  };

  return NextResponse.json(response, {
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
  });
}
