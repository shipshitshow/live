'use client';

export interface CachedSnapshot<T> {
  data: T;
  savedAt: string;
}

function isBrowser(): boolean {
  return (
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  );
}

export function readCachedSnapshot<T>(key: string): CachedSnapshot<T> | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CachedSnapshot<T>;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

export function writeCachedSnapshot<T>(key: string, data: T): void {
  if (!isBrowser()) {
    return;
  }

  const snapshot: CachedSnapshot<T> = {
    data,
    savedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(key, JSON.stringify(snapshot));
}
