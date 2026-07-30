import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { QRRA } from "@/lib/db/tables";
import { getSupabaseAnonKey, normalizeSupabaseUrl } from "./env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  let url: string;
  let key: string;
  try {
    url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
    key = getSupabaseAnonKey();
  } catch {
    return supabaseResponse;
  }
  if (!url || !key) return supabaseResponse;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const needsAuth =
    path.startsWith("/account") || path.startsWith("/admin");

  if (needsAuth && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  if (path.startsWith("/admin") && user) {
    const { data: profile } = await supabase
      .from(QRRA.profiles)
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/account";
      return NextResponse.redirect(redirect);
    }
  }

  if ((path === "/login" || path === "/signup") && user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/account";
    return NextResponse.redirect(redirect);
  }

  return supabaseResponse;
}
