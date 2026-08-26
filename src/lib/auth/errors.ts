/** Supabase's own error strings are accurate but not something to show a
 * customer verbatim (wording varies by SDK version, references internal
 * concepts like "provider"). Maps the common cases to clean copy; anything
 * unrecognized still gets a safe, honest fallback rather than the raw
 * message. Shared between the auth Server Actions and the `/auth/callback`
 * route handler, so it lives outside the "use server" actions file. */
export function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "That email is already registered. Try logging in instead.";
  }
  const looksLikeLinkIssue = lower.includes("token") || lower.includes("otp") || lower.includes("code") || lower.includes("link");
  if (lower.includes("expired") || (lower.includes("invalid") && looksLikeLinkIssue)) {
    return "That link has expired or has already been used. Request a new one.";
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
  if (lower.includes("session") && (lower.includes("missing") || lower.includes("not found"))) {
    return "Your session has expired. Please sign in again.";
  }
  if (lower.includes("network") || lower.includes("fetch failed")) {
    return "Network error. Check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}
