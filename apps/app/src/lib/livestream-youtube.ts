export function extractYouTubeUrl(raw: string): string | null {
  const livestreamNotesMatch = raw.match(
    /## Livestream Notes\s*([\s\S]*?)(?:\n## |\n?$)/,
  );

  const preferredMatch = livestreamNotesMatch?.[1]?.match(
    /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+)/,
  );
  if (preferredMatch?.[0]) {
    return preferredMatch[0];
  }

  const match = raw.match(
    /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+)/,
  );
  return match?.[0] ?? null;
}

export function extractVideoId(url: string): string | null {
  const watchMatch = url.match(/[?&]v=([\w-]+)/);
  if (watchMatch) return watchMatch[1];

  const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
  return shortMatch?.[1] ?? null;
}

function buildImgYouTubeThumbnailUrl(
  videoId: string,
  filename: 'maxresdefault.jpg' | 'hqdefault.jpg',
): string {
  return `https://img.youtube.com/vi/${videoId}/${filename}`;
}

export async function buildYouTubeThumbnailUrl(
  videoId: string,
): Promise<string> {
  const maxResUrl = buildImgYouTubeThumbnailUrl(videoId, 'maxresdefault.jpg');

  try {
    const response = await fetch(maxResUrl, {
      cache: 'force-cache',
      method: 'HEAD',
      next: { revalidate: 3600 },
    });
    if (response.ok) {
      return maxResUrl;
    }
  } catch {
    // Fall back to the reliable default thumbnail URL below.
  }

  return buildImgYouTubeThumbnailUrl(videoId, 'hqdefault.jpg');
}
