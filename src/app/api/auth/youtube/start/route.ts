import { NextRequest, NextResponse } from "next/server";
import { getConfiguredChannelMeta, getYouTubeOAuthConfig, getYouTubeOAuthRedirectUri } from "@/lib/youtube/token";

function encodeState(payload: { next: string; channel: string }) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export async function GET(request: NextRequest) {
  const { clientId, scopes } = getYouTubeOAuthConfig();
  const channel = request.nextUrl.searchParams.get("channel") || "main";
  const next = request.nextUrl.searchParams.get("next") || "/";
  const allowedChannels = new Set(getConfiguredChannelMeta().map((item) => item.label));

  if (!allowedChannels.has(channel)) {
    return NextResponse.json({ error: "Unknown YouTube channel" }, { status: 400 });
  }

  const redirectUri = getYouTubeOAuthRedirectUri(request.nextUrl.origin);
  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
      access_type: "offline",
      prompt: "consent",
      state: encodeState({ next, channel }),
    }).toString();

  return NextResponse.redirect(authUrl);
}
