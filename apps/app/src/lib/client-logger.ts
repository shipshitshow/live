type ClientLogType = 'event' | 'perf';

interface ClientLogPayload {
  event: string;
  type: ClientLogType;
  payload?: Record<string, unknown>;
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const THROTTLE_WINDOW_MS = 2000;
const recentLogTimestamps = new Map<string, number>();

function shouldThrottleLog(body: ClientLogPayload) {
  if (body.event !== 'react_render') return false;

  const payload = body.payload ?? {};
  const throttleKey = [
    body.type,
    body.event,
    String(payload.page ?? ''),
    String(payload.component ?? ''),
    String(payload.phase ?? ''),
  ].join(':');
  const now = Date.now();
  const lastLoggedAt = recentLogTimestamps.get(throttleKey) ?? 0;

  if (now - lastLoggedAt < THROTTLE_WINDOW_MS) {
    return true;
  }

  recentLogTimestamps.set(throttleKey, now);
  return false;
}

function sendClientLog(body: ClientLogPayload) {
  if (typeof window === 'undefined') return;
  if (shouldThrottleLog(body)) return;

  const serialized = JSON.stringify(body);

  // Beacon is best for page-unload delivery, but in active dev sessions it can
  // silently refuse high-volume calls and we were dropping logs with no fallback.
  if (
    IS_PRODUCTION &&
    document.visibilityState === 'hidden' &&
    typeof navigator.sendBeacon === 'function'
  ) {
    const blob = new Blob([serialized], { type: 'application/json' });
    if (navigator.sendBeacon('/api/logs/events', blob)) {
      return;
    }
  }

  void fetch('/api/logs/events', {
    body: serialized,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    method: 'POST',
  });
}

export function logClientEvent(
  event: string,
  payload: Record<string, unknown> = {},
) {
  sendClientLog({ event, payload, type: 'event' });
}

export function logClientPerf(
  event: string,
  payload: Record<string, unknown> = {},
) {
  sendClientLog({ event, payload, type: 'perf' });
}
