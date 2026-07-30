import type { User } from "@supabase/supabase-js";
import { QRRA } from "@/lib/db/tables";
import { createClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
};

export async function getProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from(QRRA.profiles)
    .select("id, email, full_name, phone, role")
    .eq("id", user.id)
    .maybeSingle();
  return (data as Profile | null) ?? null;
}

export async function ensureProfile(user: User): Promise<Profile | null> {
  const existing = await getProfile();
  if (existing) return existing;

  const supabase = await createClient();
  const meta = user.user_metadata as Record<string, unknown>;
  const { data, error } = await supabase
    .from(QRRA.profiles)
    .insert({
      id: user.id,
      email: user.email ?? null,
      full_name:
        typeof meta.full_name === "string" ? meta.full_name : null,
      phone: typeof meta.phone === "string" ? meta.phone : null,
      role: "customer",
    })
    .select("id, email, full_name, phone, role")
    .maybeSingle();

  if (error) {
    const { data: retry } = await supabase
      .from(QRRA.profiles)
      .select("id, email, full_name, phone, role")
      .eq("id", user.id)
      .maybeSingle();
    return (retry as Profile | null) ?? null;
  }
  return (data as Profile | null) ?? null;
}
