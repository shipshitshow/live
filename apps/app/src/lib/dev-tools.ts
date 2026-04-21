export function isDevToolsEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && !process.env.VERCEL;
}

export function isYouTubeAuthEnabled(): boolean {
  return !process.env.VERCEL;
}
