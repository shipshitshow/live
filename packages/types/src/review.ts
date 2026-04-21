import type { VideoStats } from "./youtube";

export interface UnlistedVideo extends VideoStats {
  description: string;
  thumbnail_url: string;
  privacy_status: string;
}
