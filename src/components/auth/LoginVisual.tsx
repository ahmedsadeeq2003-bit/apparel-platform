"use client";

import { useId, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { GrainOverlay } from "@/components/marketing/GrainOverlay";
import { ScribbleUnderline, MarkerTag } from "@/components/marketing/EditorialMarks";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Real STITCH artwork (see public/assets/designs/) -- a different set than
 * /signup uses (that page already claimed crown/abstract-loop/scribble-
 * burst/good-energy), so the two pages read as siblings, not duplicates. */
const FRAGMENTS: { path: string; className: string; depth: number; opacity: number; delay: number }[] = [
  { path: "/assets/designs/graffiti/wildstyle-mark.svg", className: "left-[10%] top-[14%] w-[13%]", depth: 26, opacity: 0.8, delay: 0.15 },
  { path: "/assets/designs/illustration/celestial-eye.svg", className: "right-[10%] top-[10%] w-[11%]", depth: 40, opacity: 0.6, delay: 0.3 },
  { path: "/assets/designs/abstract/fluid-lines.svg", className: "left-[12%] bottom-[14%] w-[16%]", depth: 18, opacity: 0.55, delay: 0.45 },
  { path: "/assets/designs/typography/stay-curious.svg", className: "right-[8%] bottom-[16%] w-[22%]", depth: 32, opacity: 0.75, delay: 0.6 },
];

/** One artwork fragment, parallaxing against the shared pointer-position
 * springs at its own depth -- each needs its own useTransform call (hooks
 * can't run inside the .map() above), so it's its own small component
 * rather than inline JSX. Depth is in pixels of max travel, not a ratio, so
 * "closer" fragments (larger depth) visibly lead the pointer more than
 * "further" ones -- the actual parallax illusion. */
function ParallaxFragment({
  fragment,
  springX,
  springY,
  recede,
}: {
  fragment: (typeof FRAGMENTS)[number];
  springX: ReturnType<typeof useSpring>;
  springY: ReturnType<typeof useSpring>;
  recede: boolean;
}) {
  const x = useTransform(springX, (v) => v * fragment.depth);
  const y = useTransform(springY, (v) => v * fragment.depth);

  return (
    <motion.img
      src={fragment.path}
      alt=""
      aria-hidden
      className={`pointer-events-none absolute hidden h-auto lg:block ${fragment.className}`}
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: recede ? fragment.opacity * 0.45 : fragment.opacity, scale: recede ? 0.94 : 1 }}
      transition={{ duration: 0.5, delay: fragment.delay, ease: EASE }}
    />
  );
}

/**
 * The editorial visual half of /login -- deliberately not a copy of
 * /signup's SignUpVisual: different artwork, a shorter/more confident
 * headline ("returning" rather than "arriving"), and two interactions that
 * page doesn't have -- pointer parallax on the artwork (idle = expressive)
 * and a recede-on-focus response (the visual quiets down and the form
 * becomes the point of attention once someone starts typing). On mobile the
 * headline block sits above the form in normal flow (not hidden entirely,
 * unlike /signup) since this task asked for an intentional mobile
 * treatment rather than a fully-hidden panel; the scattered artwork marks
 * stay desktop-only so they don't clutter a small screen.
 */
export function LoginVisual({ formFocused }: { formFocused: boolean }) {
  const reduceMotion = useReducedMotion();
  const headingId = useId();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const springX = useSpring(px, { stiffness: 60, damping: 20, mass: 0.5 });
  const springY = useSpring(py, { stiffness: 60, damping: 20, mass: 0.5 });

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || e.pointerType !== "mouse") return;
    const bounds = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - bounds.left) / bounds.width - 0.5);
    py.set((e.clientY - bounds.top) / bounds.height - 0.5);
  }
  function handlePointerLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <div
      className="relative flex flex-col justify-center overflow-hidden px-6 py-10 lg:px-16 lg:py-16 xl:px-20"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-labelledby={headingId}
    >
      <div className="hidden lg:block">
        <GrainOverlay />
      </div>
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        animate={{
          background: formFocused
            ? "radial-gradient(120% 90% at 20% 20%, color-mix(in oklab, var(--color-accent) 6%, transparent) 0%, transparent 55%), linear-gradient(160deg, color-mix(in oklab, var(--color-surface) 45%, white) 0%, var(--color-background) 55%, var(--color-surface) 90%)"
            : "radial-gradient(120% 90% at 20% 20%, color-mix(in oklab, var(--color-accent) 10%, transparent) 0%, transparent 55%), linear-gradient(160deg, color-mix(in oklab, var(--color-surface) 55%, white) 0%, var(--color-background) 55%, var(--color-surface) 100%)",
        }}
        transition={{ duration: 0.5, ease: EASE }}
      />

      {!reduceMotion &&
        FRAGMENTS.map((fragment) => (
          <ParallaxFragment key={fragment.path} fragment={fragment} springX={springX} springY={springY} recede={formFocused} />
        ))}

      <motion.div
        className="relative z-10 max-w-md"
        initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: formFocused ? 0.97 : 1 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <span className="text-label font-semibold uppercase tracking-[0.18em] text-accent">
          Welcome back
        </span>
        <h1 id={headingId} className="mt-4 font-display text-display-2xl text-foreground">
          Back to
          <br />
          <span className="relative inline-block italic">
            the studio.
            <ScribbleUnderline className="absolute -bottom-2 left-0 h-3 w-full text-accent" />
          </span>
        </h1>
        <p className="mt-6 hidden max-w-sm text-body-lg text-muted lg:block">
          Your designs, your drafts, your cart -- exactly where you left
          them.
        </p>
        <MarkerTag rotate={4} className="mt-8 hidden lg:inline-block">
          good to see you.
        </MarkerTag>
      </motion.div>
    </div>
  );
}
