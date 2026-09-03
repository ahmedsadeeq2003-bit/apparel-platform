import { useEffect, useState } from "react";

const DESKTOP_QUERY = "(min-width: 768px)"; // Tailwind's `md` breakpoint

/**
 * Tracks whether the viewport is at/above the editor's desktop breakpoint,
 * for choosing which single wrapper (sidebar vs. bottom sheet) a panel
 * mounts into -- see EditorShell.tsx. Reads `matchMedia` directly in the
 * initializer rather than defaulting to `false` and correcting in an
 * effect: safe here specifically because EditorShell is loaded via
 * `dynamic(..., { ssr: false })`, so this hook only ever runs in the
 * browser and there's no server-rendered markup for a client-only guess to
 * mismatch against. Don't reuse this pattern in a component that *is*
 * server-rendered.
 */
export function useIsDesktopViewport(): boolean {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const handleChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return isDesktop;
}
