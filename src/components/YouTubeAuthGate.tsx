"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface YouTubeAuthStatusResponse {
  connected: boolean;
  status: "connected" | "missing_credentials" | "reauth_required";
  channelLabelsNeedingAuth: string[];
}

const AUTH_ROUTE = "/auth/youtube";

export function YouTubeAuthGate() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    if (!pathname || pathname.startsWith(AUTH_ROUTE)) {
      setBlocking(false);
      return;
    }

    let cancelled = false;
    const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    fetch("/api/auth/youtube/status", { cache: "no-store" })
      .then((res) => res.json() as Promise<YouTubeAuthStatusResponse>)
      .then((status) => {
        if (cancelled) return;
        if (status.status === "reauth_required") {
          setBlocking(true);
          router.replace(`${AUTH_ROUTE}?next=${encodeURIComponent(currentUrl)}`);
          return;
        }
        setBlocking(false);
      })
      .catch(() => {
        if (!cancelled) setBlocking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, router, searchParams]);

  if (!blocking) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-surface/92 backdrop-blur">
      <div className="rounded-xl border border-surface-border bg-surface-card px-6 py-5 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <p className="text-sm font-semibold text-text-primary">YouTube auth expired</p>
        <p className="mt-2 text-sm text-text-secondary">Redirecting to Google OAuth…</p>
      </div>
    </div>
  );
}
