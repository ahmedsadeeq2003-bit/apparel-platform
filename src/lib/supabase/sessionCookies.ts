import type { CookieOptions } from "@supabase/ssr";

/**
 * STITCH's session policy: stay signed in across refresh and normal
 * navigation, but don't intentionally survive a full browser close (see
 * `src/lib/supabase/middleware.ts` and `server.ts` for where this is used).
 *
 * `@supabase/ssr` 0.7's own cookie-options merging always re-asserts its
 * 400-day default `maxAge` last (see `createStorageFromOptions`/
 * `applyServerStorage` in its bundled source), so passing a shorter
 * `cookieOptions.maxAge` into `createServerClient` has no effect -- it gets
 * overwritten internally before the cookie is ever handed to us. The only
 * point we actually control is our own `setAll` callback, right before the
 * cookie reaches Next's `cookies().set()`/`response.cookies.set()` -- so
 * that's where persistence gets stripped instead: no `Max-Age` and no
 * `Expires` makes it a true HTTP session cookie, which browsers discard
 * when the browser itself (not just a tab) closes.
 */
export function toSessionCookieOptions(options?: CookieOptions): CookieOptions | undefined {
  if (!options) return options;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to exclude from the rest
  const { maxAge: _maxAge, expires: _expires, ...sessionOnly } = options;
  return sessionOnly;
}
