/** Several flows (protected-route bounces, email links, OAuth) carry a
 * `next` destination through a redirect chain. Since it ultimately comes
 * from a URL a browser controls, it has to be constrained to a same-site,
 * relative path before ever being handed to `redirect()` -- otherwise it's
 * an open-redirect vector (`next=https://evil.example`). */
export function safeNext(next: string | null | undefined, fallback = "/products"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}
