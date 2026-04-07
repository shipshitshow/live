"use client";

import { useRef, useState } from "react";

interface VideoPlayerProps {
  src: string;
  thumbnailUrl?: string;
}

export function VideoPlayer({ src, thumbnailUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  function togglePlay() {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => setError(true));
      setPlaying(true);
    } else {
      vid.pause();
      setPlaying(false);
    }
  }

  if (error) {
    return (
      <div className="aspect-video bg-surface-card border border-surface-border rounded-xl flex flex-col items-center justify-center gap-2">
        <span className="text-text-muted text-2xl">⚠</span>
        <p className="text-xs text-text-muted">Failed to load video</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden group">
      <video
        ref={videoRef}
        src={src}
        poster={thumbnailUrl}
        className="w-full h-full object-contain"
        onEnded={() => setPlaying(false)}
        onError={() => setError(true)}
        playsInline
        preload="metadata"
      />
      {/* Overlay controls */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
          playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        }`}
        onClick={togglePlay}
      >
        <button
          aria-label={playing ? "Pause" : "Play"}
          className="w-14 h-14 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-black/80 hover:scale-105 transition-all backdrop-blur-sm"
        >
          {playing ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
              <rect x="5" y="3" width="4" height="14" rx="1" />
              <rect x="11" y="3" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
              <path d="M6 3.5L16.5 10L6 16.5V3.5Z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
