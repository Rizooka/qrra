import type { User } from "@supabase/supabase-js";
import { createClient, qrra } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
};

export async function getProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await qrra(supabase)
    .from("profiles")
    .select("id, full_name, phone, role")
    .eq("id", user.id)
    .maybeSingle();
  return (data as Profile | null) ?? null;
}

/** Shared Supabase project: old auth users may lack qrra.profiles until first QRRA visit. */
export async function ensureProfile(user: User): Promise<Profile | null> {
  const existing = await getProfile();
  if (existing) return existing;

  const supabase = await createClient();
  const meta = user.user_metadata as Record<string, unknown>;
  const { data, error } = await qrra(supabase)
    .from("profiles")
    .insert({
      id: user.id,
      full_name:
        typeof meta.full_name === "string" ? meta.full_name : null,
      phone: typeof meta.phone === "string" ? meta.phone : null,
      role: "customer",
    })
    .select("id, full_name, phone, role")
    .maybeSingle();

  if (error) {
    const { data: retry } = await qrra(supabase)
      .from("profiles")
      .select("id, full_name, phone, role")
      .eq("id", user.id)
      .maybeSingle();
    return (retry as Profile | null) ?? null;
  }
  return (data as Profile | null) ?? null;
}
