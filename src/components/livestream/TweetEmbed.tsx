"use client";

import { useState, useEffect } from "react";
import { Tweet } from "react-tweet";

function extractTweetId(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  return match ? match[1] : null;
}

export function TweetEmbed({ url }: { url: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const tweetId = extractTweetId(url);
  if (!tweetId) return null;

  if (!mounted) {
    return <div className="tweet-embed max-w-[350px] h-[200px] bg-surface-card rounded-xl animate-pulse" />;
  }

  return (
    <div className="tweet-embed max-w-[350px]" data-theme="dark">
      <Tweet id={tweetId} />
    </div>
  );
}

export function isTweetUrl(url: string): boolean {
  return /(?:twitter\.com|x\.com)\/\w+\/status\/\d+/.test(url);
}
