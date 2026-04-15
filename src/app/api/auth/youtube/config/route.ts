import { NextRequest, NextResponse } from "next/server";
import { getYouTubeOAuthRedirectUri } from "@/lib/youtube/token";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { redirectUri: getYouTubeOAuthRedirectUri(request.nextUrl.origin) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
