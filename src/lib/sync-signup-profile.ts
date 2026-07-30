import type { SupabaseClient } from "@supabase/supabase-js";
import { QRRA } from "@/lib/db/tables";

/** Writes signup name/phone into qrra_profiles (does not change role). */
export async function syncSignupProfile(
  supabase: SupabaseClient,
  userId: string,
  fullName: string,
  phone: string,
  email?: string,
) {
  const payload = {
    email: email?.trim() || null,
    full_name: fullName.trim() || null,
    phone: phone.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from(QRRA.profiles)
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existing) {
    await supabase.from(QRRA.profiles).update(payload).eq("id", userId);
    return;
  }

  await supabase.from(QRRA.profiles).insert({
    id: userId,
    ...payload,
    role: "customer",
  });
}
