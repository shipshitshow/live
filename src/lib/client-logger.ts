type ClientLogType = "event" | "perf";

interface ClientLogPayload {
  event: string;
  type: ClientLogType;
  payload?: Record<string, unknown>;
}

function sendClientLog(body: ClientLogPayload) {
  if (typeof window === "undefined") return;

  const serialized = JSON.stringify(body);

  if (typeof navigator.sendBeacon === "function") {
    const blob = new Blob([serialized], { type: "application/json" });
    navigator.sendBeacon("/api/logs/events", blob);
    return;
  }

  void fetch("/api/logs/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: serialized,
    keepalive: true,
  });
}

export function logClientEvent(event: string, payload: Record<string, unknown> = {}) {
  sendClientLog({ type: "event", event, payload });
}

export function logClientPerf(event: string, payload: Record<string, unknown> = {}) {
  sendClientLog({ type: "perf", event, payload });
}
