import { createBrowserClient } from "@supabase/ssr";
import { SERVICE_UNAVAILABLE } from "@/lib/auth-user-messages";
import { getSupabaseAnonKey, normalizeSupabaseUrl } from "./env";

export function createClient() {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    throw new Error(SERVICE_UNAVAILABLE);
  }
  return createBrowserClient(url, key);
}
