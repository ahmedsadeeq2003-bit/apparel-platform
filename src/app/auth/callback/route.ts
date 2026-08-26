import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { translateAuthError } from "@/lib/auth/errors";
import { safeNext } from "@/lib/auth/redirect";

/** Single landing point for every email-link and OAuth flow (signup
 * confirmation, magic link, password reset, Google/Apple) -- they all end in
 * the same PKCE `code` exchange, and only differ in where `next` sends the
 * browser afterward (password reset sets next=/reset-password; everything
 * else defaults to /products). On failure, surfaces a real reason via
 * `?error=` instead of a silent generic bounce. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const errorDescription = searchParams.get("error_description");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(translateAuthError(error.message))}`,
    );
  }

  // No `code` at all means the provider itself reported a problem (e.g. an
  // expired confirmation link redirects straight here with
  // error/error_description query params, no code) -- surface that reason
  // if Supabase gave one, otherwise a safe generic fallback.
  const reason = errorDescription
    ? translateAuthError(errorDescription)
    : "This link is invalid or has expired.";
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`);
}
