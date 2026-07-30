/**
 * Supabase JS expects the project origin only:
 * https://xxxx.supabase.co
 * Not postgres://…, not …/rest/v1, no trailing slash.
 */
export function normalizeSupabaseUrl(raw: string | undefined): string {
  if (!raw?.trim()) return "";

  const trimmed = raw.trim();

  if (/^postgres(ql)?:/i.test(trimmed)) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must be the Project URL from Settings → API, not the database connection string.",
    );
  }

  let url = trimmed.replace(/\/+$/, "");

  // Dashboard sometimes gives REST endpoint — strip so paths are not doubled.
  url = url.replace(/\/rest\/v1$/i, "");

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("supabase.co")) {
      console.warn("Supabase URL hostname does not look like supabase.co");
    }
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is invalid. Use https://your-project-ref.supabase.co from Settings → API.",
    );
  }
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!key) return "";
  if (key.startsWith("postgres") || key.includes("postgresql://")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY must be the anon public key from Settings → API, not a database password.",
    );
  }
  return key;
}
