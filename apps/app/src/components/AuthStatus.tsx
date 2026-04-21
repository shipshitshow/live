'use client';

import { useEffect, useState } from 'react';
import { parseJsonResponse } from '@/lib/parse-json-response';

export function AuthStatus() {
  const [status, setStatus] = useState<{
    connected: boolean;
    status: 'connected' | 'missing_credentials' | 'reauth_required';
  } | null>(null);

  useEffect(() => {
    fetch('/api/auth/youtube/status')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`API error ${res.status}`);
        }
        return parseJsonResponse<{
          connected: boolean;
          status: 'connected' | 'missing_credentials' | 'reauth_required';
        }>(res);
      })
      .then((data) => setStatus(data))
      .catch(() => setStatus(null));
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
      {status.status === 'missing_credentials'
        ? 'YouTube setup missing'
        : 'Reconnect YouTube'}
    </a>
  );
}
