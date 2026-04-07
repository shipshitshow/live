import { NextResponse } from "next/server";
import { hasYouTubeCredentials } from "@/lib/youtube/token";

export async function GET() {
  return NextResponse.json({ connected: hasYouTubeCredentials() });
}
