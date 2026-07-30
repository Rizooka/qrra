import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/client";
import type { FeedbackKind } from "@/lib/analytics/event-names";
import { getVisitorId } from "@/lib/analytics/ids";
import { track } from "@/lib/analytics/track";

export async function submitFeedback(input: {
  kind: FeedbackKind;
  message: string;
  email?: string;
  product_slug?: string;
}) {
  const message = input.message.trim();
  if (message.length < 3) {
    return { ok: false as const, error: "Слишком короткий текст" };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from(QRRA.feedback).insert({
    kind: input.kind,
    message: message.slice(0, 2000),
    email: input.email?.trim() || null,
    visitor_id: getVisitorId() || null,
    user_id: user?.id ?? null,
    product_slug: input.product_slug ?? null,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  track({
    event: "wish_submit",
    product_slug: input.product_slug,
    metadata: { kind: input.kind },
  });

  return { ok: true as const };
}
