"use client";

import { useEffect, useRef } from "react";
import { signOut } from "@/lib/auth/actions";

const INACTIVITY_LIMIT_MS = 60 * 60 * 1000; // 1 hour
const ACTIVITY_WRITE_THROTTLE_MS = 30 * 1000; // write the timestamp at most every 30s
const CHECK_INTERVAL_MS = 60 * 1000; // check once a minute
const STORAGE_KEY = "stitch-last-activity";
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

/**
 * Signs an authenticated user out after an hour of no real interaction.
 * Mounted once in the root layout, which the App Router never remounts on
 * client-side navigation -- so this timer survives route changes without
 * needing any persistence mechanism beyond localStorage (which also means
 * activity in one tab keeps other tabs of the same browser alive).
 *
 * Deliberately cheap on the hot path: the four listeners just throttle-write
 * a timestamp (at most once per ACTIVITY_WRITE_THROTTLE_MS, not on every
 * single scroll/mousemove tick, which is what "expensive handler" would
 * mean here), and a single interval compares it against `Date.now()` --
 * no per-event React state update, no per-event network request. Only the
 * eventual timeout calls the real `signOut` Server Action (real Supabase
 * `auth.signOut()` + redirect), never just a local flag/UI hide.
 */
export function InactivityGuard({ isAuthenticated }: { isAuthenticated: boolean }) {
  const lastWriteRef = useRef(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    const markActive = () => {
      const now = Date.now();
      if (now - lastWriteRef.current < ACTIVITY_WRITE_THROTTLE_MS) return;
      lastWriteRef.current = now;
      try {
        localStorage.setItem(STORAGE_KEY, String(now));
      } catch {
        // localStorage unavailable (private browsing, storage full) -- the
        // interval below just won't see fresh activity and will sign out
        // on schedule regardless, which is the safe failure direction.
      }
    };

    markActive();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, markActive, { passive: true }));

    const interval = setInterval(() => {
      let last = lastWriteRef.current;
      try {
        const stored = Number(localStorage.getItem(STORAGE_KEY));
        if (stored) last = stored;
      } catch {
        /* fall back to the in-memory value */
      }
      if (Date.now() - last >= INACTIVITY_LIMIT_MS) {
        signOut().catch(() => {
          // signOut() redirects via a thrown Next.js redirect signal, which
          // rejects the promise by design -- nothing to handle here.
        });
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, markActive));
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  return null;
}
