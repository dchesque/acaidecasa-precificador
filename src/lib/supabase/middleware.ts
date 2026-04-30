import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

const PUBLIC_PREFIXES = ["/auth/"];

const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Mock mode: no Supabase config. Skip gating so the app keeps working.
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Re-apply cookies on both the request (for downstream getUser) and
          // the response (so the browser receives the refreshed session).
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  if (!user && !isPublic) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}
