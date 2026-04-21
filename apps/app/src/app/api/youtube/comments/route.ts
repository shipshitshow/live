import { NextRequest, NextResponse } from "next/server";
import type { YouTubeCommentListResponse } from "@shipshitshow/types";
import { fetchCommentThreads } from "@/lib/youtube/comments";
import {
  getAccessToken,
  getChannelConfigs,
  hasYouTubeCredentials,
  isYouTubeReauthError,
} from "@/lib/youtube/token";

const parseMaxResults = (raw: string | null) => {
  const value = Number(raw ?? "50");
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(1, Math.floor(value)));
};

const resolveChannelsAsync = async (channel: string | null) => {
  const channels = await getChannelConfigs();
  if (!channel || channel === "all") return channels;

  return channels.filter(
    (item) => item.id === channel || item.label === channel
  );
};

export async function GET(request: NextRequest) {
  if (!hasYouTubeCredentials()) {
    const empty: YouTubeCommentListResponse = {
      items: [],
      fetchedAt: new Date().toISOString(),
    };
    return NextResponse.json(empty);
  }

  const channel = request.nextUrl.searchParams.get("channel");
  const videoId = request.nextUrl.searchParams.get("videoId");
  const maxResults = parseMaxResults(request.nextUrl.searchParams.get("maxResults"));
  const channels = await resolveChannelsAsync(channel);

  if (channels.length === 0) {
    return NextResponse.json(
      { error: "Unknown channel" },
      { status: 404 }
    );
  }

  try {
    const results = await Promise.all(
      channels.map(async (channelConfig) => {
        const token = await getAccessToken(channelConfig);
        return fetchCommentThreads(token, channelConfig, { maxResults, videoId });
      })
    );

    const response: YouTubeCommentListResponse = {
      items: results
        .flat()
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (isYouTubeReauthError(error)) {
      return NextResponse.json(
        {
          error: "YouTube authentication expired. Reconnect YouTube to continue.",
          reauthRequired: true,
          channelLabel: error.channelLabel ?? null,
        },
        { status: 401 }
      );
    }
    const message = error instanceof Error ? error.message : "Failed to fetch comments";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
