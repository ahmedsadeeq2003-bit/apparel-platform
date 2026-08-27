import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { requireSupabaseEnv } from "@/lib/supabase/env";
import { toSessionCookieOptions } from "@/lib/supabase/sessionCookies";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = requireSupabaseEnv();

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, toSessionCookieOptions(options)),
          );
        },
      },
    },
  );

  // Refreshes the session cookie if it's expired. Required so Server
  // Components (which can't write cookies) always see a valid session.
  await supabase.auth.getUser();

  return response;
}
