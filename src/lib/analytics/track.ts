import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";
import type { AnalyticsEventName } from "@/lib/analytics/event-names";
import { getSessionId, getVisitorId } from "@/lib/analytics/ids";
import { isUuid } from "@/lib/uuid";

export type TrackPayload = {
  event: AnalyticsEventName;
  page_path?: string;
  product_slug?: string;
  product_id?: string;
  metadata?: Record<string, unknown>;
};

type Queued = TrackPayload & { at: number };

const queue: Queued[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;

function analyticsDisabled() {
  if (typeof window === "undefined") return true;
  if (window.location.pathname.startsWith("/admin")) return true;
  if (navigator.doNotTrack === "1") return true;
  return false;
}

async function flushQueue() {
  if (flushing || queue.length === 0) return;
  flushing = true;
  const batch = queue.splice(0, 24);
  flushTimer = null;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const visitor_id = getVisitorId();
  const session_id = getSessionId();
  if (!visitor_id || !session_id) {
    flushing = false;
    return;
  }

  const rows = batch.map((item) => ({
    event_name: item.event,
    visitor_id,
    session_id,
    user_id: user?.id ?? null,
    page_path: item.page_path ?? window.location.pathname,
    product_slug: item.product_slug ?? null,
    product_id:
      item.product_id && isUuid(item.product_id) ? item.product_id : null,
    metadata: item.metadata ?? {},
  }));

  try {
    await supabase.from(QRRA.events).insert(rows);
  } catch {
    /* ignore — analytics must not break UX */
  }

  flushing = false;
  if (queue.length > 0) scheduleFlush();
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushQueue();
  }, 1200);
}

export function track(payload: TrackPayload) {
  if (analyticsDisabled()) return;
  queue.push({ ...payload, at: Date.now() });
  scheduleFlush();
}

export function trackPageView(path: string) {
  track({ event: "page_view", page_path: path });
}

if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushQueue();
  });
  window.addEventListener("pagehide", () => flushQueue());
}
