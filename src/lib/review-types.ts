import type { VideoStats } from "@/lib/types";

export interface UnlistedVideo extends VideoStats {
  description: string;
  thumbnail_url: string;
  privacy_status: string;
}
