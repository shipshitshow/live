"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";

interface YouTubeAuthStatusResponse {
  connected: boolean;
  status: "connected" | "missing_credentials" | "reauth_required";
  channelLabelsNeedingAuth: string[];
}

interface YouTubeAuthConfigResponse {
  redirectUri: string;
}

export default function YouTubeAuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get("next") || "/";
  const error = searchParams.get("error");
  const [status, setStatus] = useState<YouTubeAuthStatusResponse | null>(null);
  const [redirectUri, setRedirectUri] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/youtube/status", { cache: "no-store" })
      .then((res) => res.json() as Promise<YouTubeAuthStatusResponse>)
      .then((data) => {
        setStatus(data);
        if (data.connected) {
          router.replace(next);
        }
      })
      .catch(() => {
        setStatus({
          connected: false,
          status: "reauth_required",
          channelLabelsNeedingAuth: ["main"],
        });
      });
  }, [next, router]);

  useEffect(() => {
    fetch("/api/auth/youtube/config", { cache: "no-store" })
      .then((res) => res.json() as Promise<YouTubeAuthConfigResponse>)
      .then((data) => setRedirectUri(data.redirectUri))
      .catch(() => setRedirectUri(null));
  }, []);

  const channelToReconnect = useMemo(
    () => status?.channelLabelsNeedingAuth[0] || "main",
    [status]
  );

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <AppHeader subtitle="Reconnect YouTube" activeHref="/" />
      <main className="px-6 py-10 max-w-2xl mx-auto">
        <div className="rounded-2xl border border-surface-border bg-surface-card p-8 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-text-muted">YouTube OAuth</p>
          <h1 className="mt-3 text-2xl font-bold text-text-primary">YouTube access needs to be reconnected</h1>
          <p className="mt-3 text-sm text-text-secondary leading-relaxed">
            The stored refresh token expired or was revoked. Until it is fixed, the app blocks navigation and sends you back through Google OAuth.
          </p>

          {error ? (
            <div className="mt-5 rounded-xl border border-accent-red/20 bg-accent-red/5 px-4 py-3 text-sm text-accent-red">
              OAuth returned an error: {error}
            </div>
          ) : null}

          {error === "redirect_uri_mismatch" ? (
            <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-200">
              Google is rejecting the callback URL. Add this exact URI to your Google OAuth client’s authorized redirect URIs:
              <code className="mt-2 block rounded bg-black/20 px-2 py-1 text-xs text-yellow-100">
                {redirectUri || "loading redirect URI…"}
              </code>
            </div>
          ) : null}

          {status?.status === "missing_credentials" ? (
            <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-300">
              Missing `YOUTUBE_CLIENT_ID` or `YOUTUBE_CLIENT_SECRET`. Add those first, then reload this page.
            </div>
          ) : null}

          <div className="mt-6 rounded-xl border border-surface-border bg-surface-elevated/40 p-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted">Channel</p>
            <p className="mt-2 text-sm font-semibold text-text-primary">{channelToReconnect}</p>
          </div>

          <div className="mt-4 rounded-xl border border-surface-border bg-surface-elevated/40 p-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted">Redirect URI</p>
            <p className="mt-2 break-all text-sm text-text-primary">{redirectUri || "Loading…"}</p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setStarting(true);
                window.location.href = `/api/auth/youtube/start?channel=${encodeURIComponent(channelToReconnect)}&next=${encodeURIComponent(next)}`;
              }}
              className="rounded-lg bg-accent-red px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              {starting ? "Opening Google OAuth…" : "Reconnect YouTube"}
            </button>
            <span className="text-xs text-text-muted">You’ll come back here automatically after consent.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
