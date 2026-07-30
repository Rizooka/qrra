import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, normalizeSupabaseUrl } from "./env";

export function createClient() {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    throw new Error(
      "Supabase env missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.",
    );
  }
  return createBrowserClient(url, key);
}

export function qrra(client: ReturnType<typeof createClient>) {
  return client.schema("qrra");
}
