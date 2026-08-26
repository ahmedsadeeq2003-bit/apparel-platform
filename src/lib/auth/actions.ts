"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { translateAuthError } from "@/lib/auth/errors";
import { safeNext } from "@/lib/auth/redirect";
import {
  forgotPasswordSchema,
  loginSchema,
  magicLinkSchema,
  resetPasswordSchema,
  signUpSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type MagicLinkInput,
  type ResetPasswordInput,
  type SignUpInput,
} from "@/lib/auth/schemas";

/** The origin every auth redirect URL is built against. `NEXT_PUBLIC_SITE_URL`
 * is a Next.js `NEXT_PUBLIC_*` var, inlined at *build* time -- if a
 * deployment (e.g. a Vercel project) never has it set as a Production
 * environment variable, every `${siteUrl}/auth/callback` silently becomes
 * the literal string `"undefined/auth/callback"`. Supabase can't honor that
 * as a `redirectTo`, so it falls back to the project's configured Site URL
 * instead -- which is exactly how a successful Google sign-in was landing
 * back on `/` instead of reaching `/auth/callback`. Deriving the origin
 * from the incoming request's own Host header is correct in every
 * environment (local, preview, production) without needing that env var
 * configured per-deployment at all, and matches how `/auth/callback`
 * itself already derives `origin` from `request.url`. The env var is kept
 * only as a last-resort fallback for the rare case headers() has nothing. */
async function resolveSiteUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  if (host) {
    const proto = headersList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signUpWithPassword(
  input: SignUpInput,
  next?: string,
): Promise<{ error: string } | { needsConfirmation: true }> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Check the fields above and try again." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        is_designer: parsed.data.isDesigner === "yes",
      },
      emailRedirectTo: `${await resolveSiteUrl()}/auth/callback?next=${encodeURIComponent(safeNext(next))}`,
    },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  // Supabase issues a session immediately only when email confirmation is
  // off (or the project auto-confirms); if confirmation is required,
  // `signUp` still returns success but with no session -- redirecting to
  // /products here would show a logged-out customer a page that assumes
  // they're logged in. Let the caller show a "check your inbox" state
  // instead of pretending the account is already active.
  if (!data.session) {
    return { needsConfirmation: true };
  }

  redirect(safeNext(next));
}

/** Re-sends the signup confirmation email -- the escape hatch for "it never
 * arrived" or "the link expired," since `signUp` only sends it once.
 * Deliberately doesn't reveal whether the address is registered (returns
 * the same generic success either way) to avoid leaking account existence. */
export async function resendVerificationEmail(
  email: string,
  next?: string,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${await resolveSiteUrl()}/auth/callback?next=${encodeURIComponent(safeNext(next))}`,
    },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  return { success: true };
}

/** Real Supabase OAuth call, not a placeholder -- if Google isn't enabled
 * for this project in the Supabase dashboard, this returns a real
 * "provider not enabled" error (translated above) rather than pretending to
 * sign the user in. `skipBrowserRedirect` + a server-side `redirect()` is
 * the correct pattern for a Server Action (the browser client's normal
 * `window.location` redirect isn't available here). */
export async function signInWithOAuth(
  provider: "google",
  next?: string,
): Promise<{ error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${await resolveSiteUrl()}/auth/callback?next=${encodeURIComponent(safeNext(next))}`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return { error: translateAuthError(error?.message ?? "OAuth sign-in failed") };
  }

  redirect(data.url);
}

export async function signInWithPassword(
  input: LoginInput,
  next?: string,
): Promise<{ error: string }> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Check the fields above and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  redirect(safeNext(next));
}

export async function signInWithMagicLink(
  input: MagicLinkInput,
  next?: string,
): Promise<{ error: string } | { success: true }> {
  const parsed = magicLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Enter a valid email." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${await resolveSiteUrl()}/auth/callback?next=${encodeURIComponent(safeNext(next))}` },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  return { success: true };
}

/** Sends the reset-password email. Always returns the same generic success
 * regardless of whether the address is registered, so this can't be used to
 * probe which emails have accounts. Routes through the existing
 * `/auth/callback` handler (rather than a bespoke recovery endpoint) with
 * `next=/reset-password`, so the same PKCE code-exchange logic that already
 * handles signup/magic-link/OAuth also establishes the recovery session. */
export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<{ error: string } | { success: true }> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Enter a valid email." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await resolveSiteUrl()}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  return { success: true };
}

/** Sets a new password for the currently-authenticated session. Only
 * meaningful reached via the recovery-email link, which lands here already
 * signed in to a short-lived recovery session (established by
 * `/auth/callback` before the browser ever gets here) -- the page itself
 * checks for that session and doesn't render this form without one. */
export async function updatePassword(
  input: ResetPasswordInput,
): Promise<{ error: string } | { success: true }> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the fields above and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  return { success: true };
}

export async function signOut(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
