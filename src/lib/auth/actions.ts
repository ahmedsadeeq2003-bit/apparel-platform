"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  magicLinkSchema,
  signUpSchema,
  type LoginInput,
  type MagicLinkInput,
  type SignUpInput,
} from "@/lib/auth/schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

/** Supabase's own error strings are accurate but not something to show a
 * customer verbatim (wording varies by SDK version, references internal
 * concepts like "provider"). Maps the common cases to clean copy; anything
 * unrecognized still gets a safe, honest fallback rather than the raw
 * message. */
function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "That email is already registered. Try logging in instead.";
  }
  if (lower.includes("password")) {
    return "Choose a stronger password and try again.";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many attempts. Wait a moment and try again.";
  }
  if (lower.includes("invalid login credentials")) {
    return "That email or password isn't right.";
  }
  if (lower.includes("email") && lower.includes("invalid")) {
    return "That doesn't look like a valid email address.";
  }
  if (lower.includes("provider is not enabled") || lower.includes("unsupported provider")) {
    return "That sign-in method isn't set up yet -- try email instead.";
  }
  if (lower.includes("network") || lower.includes("fetch failed")) {
    return "Network error. Check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

export async function signUpWithPassword(
  input: SignUpInput,
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
      emailRedirectTo: `${siteUrl}/auth/callback`,
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

  redirect("/products");
}

/** Real Supabase OAuth call, not a placeholder -- if Google/Apple aren't
 * enabled for this project in the Supabase dashboard, this returns a real
 * "provider not enabled" error (translated above) rather than pretending to
 * sign the user in. `skipBrowserRedirect` + a server-side `redirect()` is
 * the correct pattern for a Server Action (the browser client's normal
 * `window.location` redirect isn't available here). */
export async function signInWithOAuth(
  provider: "google" | "apple",
): Promise<{ error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
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

  redirect("/products");
}

export async function signInWithMagicLink(
  input: MagicLinkInput,
): Promise<{ error: string } | { success: true }> {
  const parsed = magicLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Enter a valid email." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback` },
  });

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
