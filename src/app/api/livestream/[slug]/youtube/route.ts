import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAccessToken, getChannelConfigs, hasYouTubeCredentials } from "@/lib/youtube/token";

const DATA_DIR = path.join(process.cwd(), "data", "livestream");
const DATA_API = "https://www.googleapis.com/youtube/v3";

function findTopicFile(slug: string, date: string): string | null {
  const dir = path.join(DATA_DIR, date);
  if (!fs.existsSync(dir)) return null;

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    if (raw.includes(`slug: "${slug}"`)) {
      return path.join(dir, file);
    }
  }
  return null;
}

function extractYouTubeUrl(raw: string): string | null {
  const match = raw.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+)/);
  return match?.[0] ?? null;
}

function extractVideoId(url: string): string | null {
  const watchMatch = url.match(/[?&]v=([\w-]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
  return shortMatch?.[1] ?? null;
}

async function ytFetch(url: string, token: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API ${res.status}: ${body}`);
  }
  return res.json();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const filePath = findTopicFile(slug, date);

  if (!filePath) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const youtubeUrl = extractYouTubeUrl(raw);
  if (!youtubeUrl) {
    return NextResponse.json({ youtubeUrl: null, liveStatus: "missing" });
  }

  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) {
    return NextResponse.json({ youtubeUrl, liveStatus: "invalid" });
  }

  if (!hasYouTubeCredentials()) {
    return NextResponse.json({ youtubeUrl, videoId, liveStatus: "unauthorized" });
  }

  try {
    const channelConfig = getChannelConfigs()[0];
    const token = await getAccessToken(channelConfig);
    const res = await ytFetch(
      `${DATA_API}/videos?part=snippet,statistics,liveStreamingDetails&id=${videoId}`,
      token
    );

    const item = res.items?.[0];
    if (!item) {
      return NextResponse.json({ youtubeUrl, videoId, liveStatus: "missing" });
    }

    const live = item.liveStreamingDetails;
    const isLiveNow = !!live?.actualStartTime && !live?.actualEndTime;

    return NextResponse.json({
      youtubeUrl,
      videoId,
      title: item.snippet?.title ?? null,
      channelTitle: item.snippet?.channelTitle ?? null,
      thumbnailUrl:
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        null,
      publishedAt: item.snippet?.publishedAt ?? null,
      viewCount: Number(item.statistics?.viewCount ?? 0),
      concurrentViewers: live?.concurrentViewers ? Number(live.concurrentViewers) : null,
      scheduledStartTime: live?.scheduledStartTime ?? null,
      actualStartTime: live?.actualStartTime ?? null,
      actualEndTime: live?.actualEndTime ?? null,
      liveStatus: isLiveNow ? "live" : live?.actualEndTime ? "ended" : "scheduled",
    });
  } catch (error) {
    console.error("Failed to fetch livestream YouTube metadata:", error);
    return NextResponse.json({ youtubeUrl, videoId, liveStatus: "error" }, { status: 500 });
  }
}
