import { NextRequest, NextResponse } from "next/server";
import {
  getConfiguredChannelMeta,
  getYouTubeOAuthConfig,
  getYouTubeOAuthRedirectUri,
  saveRefreshToken,
} from "@/lib/youtube/token";

function decodeState(raw: string | null): { next: string; channel: string } | null {
  if (!raw) return null;

  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded) as { next?: string; channel?: string };
    if (typeof parsed.next !== "string" || typeof parsed.channel !== "string") return null;
    return { next: parsed.next, channel: parsed.channel };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const state = decodeState(request.nextUrl.searchParams.get("state"));

  if (error) {
    const redirectUrl = new URL("/auth/youtube", request.nextUrl.origin);
    redirectUrl.searchParams.set("error", error);
    if (state?.next) redirectUrl.searchParams.set("next", state.next);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/auth/youtube?error=invalid_callback", request.nextUrl.origin));
  }

  const allowedChannels = new Set(getConfiguredChannelMeta().map((item) => item.label));
  if (!allowedChannels.has(state.channel)) {
    return NextResponse.redirect(new URL("/auth/youtube?error=unknown_channel", request.nextUrl.origin));
  }

  const { clientId, clientSecret } = getYouTubeOAuthConfig();
  const redirectUri = getYouTubeOAuthRedirectUri(request.nextUrl.origin);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const body = await tokenRes.json() as {
    refresh_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenRes.ok || !body.refresh_token) {
    const redirectUrl = new URL("/auth/youtube", request.nextUrl.origin);
    redirectUrl.searchParams.set("error", body.error_description || body.error || "token_exchange_failed");
    redirectUrl.searchParams.set("next", state.next);
    return NextResponse.redirect(redirectUrl);
  }

  await saveRefreshToken(state.channel, body.refresh_token);

  const nextPath = state.next.startsWith("/") ? state.next : "/";
  return NextResponse.redirect(new URL(nextPath, request.nextUrl.origin));
}
