"use client";

import { useState, useEffect } from "react";

export function AuthStatus() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/youtube/status")
      .then((res) => res.json())
      .then((data) => setConnected(data.connected))
      .catch(() => setConnected(false));
  }, []);

  if (connected === null) return null;

  if (connected) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        YouTube
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-[10px] text-yellow-400">
      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
      YouTube not connected
    </div>
  );
}
