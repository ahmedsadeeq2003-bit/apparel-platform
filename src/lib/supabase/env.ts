/**
 * Every Supabase client construction path (browser, server, middleware)
 * needs these two vars, and `@supabase/ssr` throws a generic "Your
 * project's URL and Key are required" error with no indication of *which*
 * one is missing if either is unset -- easy to lose in a platform's
 * function logs. Fails loudly with the actual variable name instead, so a
 * misconfigured deployment environment (e.g. a Vercel project missing
 * these under Settings -> Environment Variables) is obvious immediately.
 */
export function requireSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missing = [
    !url && "NEXT_PUBLIC_SUPABASE_URL",
    !anonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        "Set these in your deployment environment (e.g. Vercel Project Settings -> Environment Variables, Production scope) and redeploy.",
    );
  }

  return { url: url!, anonKey: anonKey! };
}
