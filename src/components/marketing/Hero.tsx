"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Container } from "@/components/layout/Container";
import { TShirtMockup, PRINT_OVERLAY_PCT } from "@/components/apparel/TShirtMockup";
import { MarkerTag } from "@/components/marketing/EditorialMarks";
import { MagneticButton } from "@/components/marketing/MagneticButton";

/** The site's standard "premium, not bouncy" ease -- reused literally from
 * every other entrance animation on this page rather than introducing a
 * second animation feel just for the hero. A second, tighter curve with a
 * small overshoot is used deliberately but sparingly for the one or two
 * "lands with authority" moments (the settling artwork, the pop of a mark) --
 * everything else stays on the calm curve. */
const EASE = [0.16, 1, 0.3, 1] as const;
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

/** A completed design from the seeded template system, used elsewhere on
 * the homepage (HowItWorks, DesignYourWay, MakeItYours...) as a fully-
 * composed garment preview. The cinematic hero itself no longer needs this
 * shape -- it stages one real blank garment instead -- but the type stays
 * exported from here since several sibling sections still import it. */
export type HeroShirt = {
  canvasJson: object;
  hex: string;
  side: "front" | "back";
  label: string;
};

/** Real Classic Tee color from `product_colors` (see supabase/seed.sql) --
 * black for the strongest silhouette against the warm ivory backdrop. */
const BLANK_TEE_HEX = "#0B0B0C";

type HeadlineSegment = { text: string; italic?: boolean; dir: -1 | 1 };

const HEADLINE: HeadlineSegment[] = [
  { text: "Make it ", dir: -1 },
  { text: "yours.", italic: true, dir: 1 },
];

const HEADLINE_CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.15 } },
};

/** Characters converge into the headline from opposite horizontal
 * directions per segment (the plain half from the left, the italic "yours."
 * from the right) while also rising and scaling up -- kinetic typography
 * with real directional intent, not a uniform fade-and-rise applied to
 * every letter. */
function charVariants(dir: -1 | 1): Variants {
  return {
    hidden: { opacity: 0, x: dir * 26, y: 18, scale: 0.82, rotate: dir * 5 },
    show: { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, transition: { duration: 0.55, ease: EASE } },
  };
}

/** Character-by-character reveal, the one gimmick this hero borrows
 * deliberately from the cinematic reference -- tuned to a tight stagger so
 * it reads as "premium assembly" rather than "typewriter." The per-
 * character spans are `aria-hidden`; the wrapping element carries the real
 * `aria-label` so screen readers get the words, not 11 individually-
 * announced letters. */
function RevealHeadline({ segments, className = "" }: { segments: HeadlineSegment[]; className?: string }) {
  const reduceMotion = useReducedMotion();
  const fullText = segments.map((s) => s.text).join("");

  if (reduceMotion) {
    return (
      <span className={className} aria-label={fullText}>
        {segments.map((segment, i) => (
          <span key={i} className={segment.italic ? "italic" : undefined}>
            {segment.text}
          </span>
        ))}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      aria-label={fullText}
      variants={HEADLINE_CONTAINER}
      initial="hidden"
      animate="show"
      style={{ perspective: 400 }}
    >
      {segments.map((segment, si) => (
        <span key={si} className={segment.italic ? "italic" : undefined} aria-hidden>
          {segment.text.split("").map((char, ci) => (
            <motion.span key={ci} variants={charVariants(segment.dir)} style={{ display: "inline-block" }}>
              {char === " " ? " " : char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
}

/** The "scribble-burst" graffiti mark (see public/assets/designs/graffiti/
 * scribble-burst.svg), inlined and re-animated with its real path data --
 * not referenced via <img> like the other ambient marks -- specifically so
 * its 8-stroke burst can draw itself in with an animated `pathLength`
 * rather than just fading in. The two center dots pop in with a small,
 * deliberate overshoot once the strokes finish, like a paint mark landing. */
function DrawnScribble({ className = "", style }: { className?: string; style?: CSSProperties }) {
  const reduceMotion = useReducedMotion();
  const strokeD =
    "M 200,200 C 230,150 260,120 260,80 M 200,200 C 250,180 300,175 335,140 " +
    "M 200,200 C 250,220 290,240 330,260 M 200,200 C 220,250 230,290 210,335 " +
    "M 200,200 C 170,240 150,275 105,290 M 200,200 C 150,190 110,195 65,175 " +
    "M 200,200 C 155,165 120,140 90,95 M 200,200 C 180,155 165,120 175,75";

  return (
    <svg viewBox="0 0 400 400" className={className} style={style} aria-hidden>
      <motion.path
        d={strokeD}
        fill="none"
        stroke="currentColor"
        strokeWidth={10}
        strokeLinecap="round"
        initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.85, delay: reduceMotion ? 0 : 0.95, ease: EASE }}
      />
      <motion.circle
        cx={200}
        cy={200}
        r={22}
        fill="currentColor"
        initial={reduceMotion ? { scale: 1 } : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: reduceMotion ? 0 : 1.75, ease: OVERSHOOT }}
      />
      <motion.circle
        cx={200}
        cy={200}
        r={22}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={4}
        initial={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: reduceMotion ? 0 : 1.85, ease: EASE }}
      />
    </svg>
  );
}

/** Real graffiti-category artwork from the STITCH design library (see
 * src/lib/assets/manifest.ts), positioned as if flying into the frame
 * around the garment, then drifting gently in place -- "background graphic
 * elements continue moving" while the shirt itself has settled. */
type Mark = {
  path: string;
  left: string;
  top: string;
  width: string;
  rotate: number;
  opacity: number;
  from: { x: number; y: number; rotate: number; scale: number };
  delay: number;
};

const AMBIENT_MARKS: Mark[] = [
  {
    path: "/assets/designs/graffiti/spray-paint-star.svg",
    left: "4%",
    top: "2%",
    width: "9%",
    rotate: -12,
    opacity: 0.85,
    from: { x: -90, y: -60, rotate: -60, scale: 0.3 },
    delay: 0.75,
  },
  {
    path: "/assets/designs/graffiti/spray-paint-arrow.svg",
    left: "88%",
    top: "62%",
    width: "9%",
    rotate: -8,
    opacity: 0.6,
    from: { x: 110, y: 50, rotate: -45, scale: 0.3 },
    delay: 1.0,
  },
  {
    path: "/assets/designs/graffiti/street-lightning.svg",
    left: "0%",
    top: "68%",
    width: "8%",
    rotate: 6,
    opacity: 0.7,
    from: { x: -100, y: 60, rotate: 45, scale: 0.3 },
    delay: 1.1,
  },
];

/** Positioned as a percentage of the shirt's own wrapper -- same
 * PRINT_OVERLAY_PCT math CampaignGarment uses -- so it lands accurately
 * inside the print-safe area, not just eyeballed onto the garment. */
const SETTLING_MARK = {
  path: "/assets/designs/graffiti/hand-drawn-crown.svg",
  from: { x: 0, y: -110, rotate: -35, scale: 0.35 },
  delay: 1.5,
};

function AtmosphereBackground() {
  const reduceMotion = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 78% 25%, color-mix(in oklab, var(--color-accent) 12%, transparent) 0%, transparent 55%), linear-gradient(165deg, color-mix(in oklab, var(--color-surface) 55%, white) 0%, var(--color-background) 55%, var(--color-surface) 100%)",
        }}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
      <motion.span
        className="absolute left-1/2 top-[8%] -translate-x-1/2 select-none whitespace-nowrap font-display text-[26vw] leading-none text-foreground/[0.04] md:text-[16vw]"
        initial={reduceMotion ? false : { opacity: 0, scale: 1.15 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: EASE }}
      >
        STITCH
      </motion.span>
    </div>
  );
}

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-[calc(100dvh-4rem)] overflow-hidden md:min-h-[calc(100dvh-4.5rem)]">
      <AtmosphereBackground />

      <Container>
        <div className="flex min-h-[calc(100dvh-4rem)] flex-col justify-center gap-12 py-16 md:min-h-[calc(100dvh-4.5rem)] xl:justify-center xl:gap-0 xl:py-0">
          {/* Text content -- normal document flow, so it stacks above the
              stage on mobile/tablet/small-laptop and sits in the left
              column (with the stage absolutely covering the section behind/
              beside it) only once there's guaranteed clearance, at xl. */}
          <motion.div
            className="relative z-20 flex max-w-md flex-col gap-6 xl:max-w-lg"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="text-label font-semibold uppercase tracking-[0.18em] text-accent"
            >
              Your canvas. Your story.
            </motion.span>
            <h1 className="font-display text-display-2xl text-foreground">
              <RevealHeadline segments={HEADLINE} />
            </h1>
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.7, ease: EASE }}
              className="max-w-md text-body-lg text-muted"
            >
              Start with a blank Classic Tee. Add real artwork, your own
              upload, or your own words -- then we print and ship the exact
              thing you made.
            </motion.p>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.9, ease: EASE }}
              className="flex flex-wrap items-center gap-5 pt-2"
            >
              <MagneticButton
                href="/products"
                className="inline-flex min-h-12 items-center justify-center rounded-full border px-7 text-body-sm font-semibold uppercase tracking-wide text-foreground backdrop-blur-md transition-colors hover:text-accent"
                style={{
                  background: "color-mix(in oklab, var(--color-background) 45%, transparent)",
                  borderColor: "color-mix(in oklab, var(--color-foreground) 18%, transparent)",
                }}
              >
                Start designing
              </MagneticButton>
              <Link
                href="/inspiration"
                className="text-body-sm font-medium text-foreground underline underline-offset-4 transition-colors hover:text-accent"
              >
                Explore designs
              </Link>
            </motion.div>
          </motion.div>

          {/* Stage: the blank garment + drifting/settling artwork. Static,
              contained flow on mobile; full-bleed absolute overlay on
              desktop so the garment reads as part of the cinematic
              background rather than a boxed product shot. `perspective`
              lives here so the shirt's rotateY entrance reads as a real
              3D swing into frame rather than a flat skew. */}
          <div className="relative z-10 mt-10 aspect-square w-full max-w-md self-center xl:absolute xl:inset-y-[4%] xl:left-[48%] xl:right-[2%] xl:mt-0 xl:aspect-auto xl:w-auto xl:max-w-none xl:self-auto">
            <div className="relative h-full w-full" style={{ perspective: 1400 }}>
              {AMBIENT_MARKS.map((mark, i) => (
                <motion.div
                  key={mark.path}
                  className="pointer-events-none absolute"
                  style={{ left: mark.left, top: mark.top, width: mark.width }}
                  animate={reduceMotion ? undefined : { y: [0, -9, 0], rotate: [0, i % 2 === 0 ? 4 : -4, 0] }}
                  transition={
                    reduceMotion
                      ? undefined
                      : { duration: 3.6 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: mark.delay + 1 }
                  }
                >
                  <motion.img
                    src={mark.path}
                    alt=""
                    aria-hidden
                    className="h-auto w-full"
                    initial={
                      reduceMotion
                        ? { opacity: mark.opacity, rotate: mark.rotate }
                        : { opacity: 0, x: mark.from.x, y: mark.from.y, rotate: mark.from.rotate, scale: mark.from.scale }
                    }
                    animate={{ opacity: mark.opacity, x: 0, y: 0, rotate: mark.rotate, scale: 1 }}
                    transition={{ duration: 0.8, delay: reduceMotion ? 0 : mark.delay, ease: EASE }}
                  />
                </motion.div>
              ))}

              <DrawnScribble
                className="pointer-events-none absolute h-auto text-foreground/50"
                style={{ left: "84%", top: "4%", width: "8%" }}
              />

              <motion.div
                className="absolute left-1/2 top-1/2 w-[72%] max-w-[420px] -translate-x-1/2 -translate-y-1/2"
                style={{ transformStyle: "preserve-3d" }}
                initial={reduceMotion ? {} : { opacity: 0, y: 70, scale: 0.88, rotateY: -32, rotateX: 6 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0, rotateX: 0 }}
                transition={{ duration: 1.1, delay: reduceMotion ? 0 : 0.45, ease: EASE }}
              >
                <div
                  className="relative"
                  style={{ filter: "drop-shadow(0 28px 40px rgba(22,20,15,0.28)) drop-shadow(0 6px 10px rgba(22,20,15,0.18))" }}
                >
                  <TShirtMockup
                    hex={BLANK_TEE_HEX}
                    side="front"
                    crop="full"
                    label="Blank Classic Tee, ready to design"
                    className="h-full w-full"
                  />
                  <motion.img
                    src={SETTLING_MARK.path}
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute"
                    style={{
                      left: `${PRINT_OVERLAY_PCT.left + PRINT_OVERLAY_PCT.width * 0.18}%`,
                      top: `${PRINT_OVERLAY_PCT.top + PRINT_OVERLAY_PCT.height * 0.1}%`,
                      width: `${PRINT_OVERLAY_PCT.width * 0.64}%`,
                      // The library SVG is drawn in near-black (#0a0a0a);
                      // invert renders it white so it actually reads against
                      // the black tee, like a real white stencil print.
                      filter: "invert(1)",
                    }}
                    initial={
                      reduceMotion
                        ? { opacity: 1, rotate: -4 }
                        : { opacity: 0, x: SETTLING_MARK.from.x, y: SETTLING_MARK.from.y, rotate: SETTLING_MARK.from.rotate, scale: SETTLING_MARK.from.scale }
                    }
                    animate={{ opacity: 1, x: 0, y: 0, rotate: [SETTLING_MARK.from.rotate, -9, -4], scale: [SETTLING_MARK.from.scale, 1.16, 1] }}
                    transition={{ duration: 0.85, delay: reduceMotion ? 0 : SETTLING_MARK.delay, ease: EASE }}
                  />
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-[4%] right-[6%] z-20 hidden sm:block"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.7, rotate: -18 }}
                animate={{ opacity: 1, scale: 1, rotate: -6 }}
                transition={{ duration: 0.5, delay: reduceMotion ? 0 : 2.1, ease: OVERSHOOT }}
              >
                <MarkerTag rotate={0}>stitch it.</MarkerTag>
              </motion.div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
