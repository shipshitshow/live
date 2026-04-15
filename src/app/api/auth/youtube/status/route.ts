import { NextResponse } from "next/server";
import { getYouTubeAuthStatus } from "@/lib/youtube/token";

export async function GET() {
  const status = await getYouTubeAuthStatus();
  return NextResponse.json(status, {
    headers: { "Cache-Control": "no-store" },
  });
}
