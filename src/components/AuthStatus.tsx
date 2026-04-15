"use client";

import { useState, useEffect } from "react";

export function AuthStatus() {
  const [status, setStatus] = useState<{
    connected: boolean;
    status: "connected" | "missing_credentials" | "reauth_required";
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/youtube/status")
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus({ connected: false, status: "reauth_required" }));
  }, []);

  if (status === null) return null;

  if (status.connected) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        YouTube
      </div>
    );
  }

  return (
    <a
      href="/auth/youtube"
      className="flex items-center gap-1.5 text-[10px] text-yellow-400 hover:text-yellow-300 transition-colors"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
      {status.status === "missing_credentials" ? "YouTube setup missing" : "Reconnect YouTube"}
    </a>
  );
}
