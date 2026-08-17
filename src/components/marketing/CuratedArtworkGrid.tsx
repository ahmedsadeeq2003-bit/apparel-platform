"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { designAssets, type DesignCategory } from "@/lib/assets/manifest";

const EASE = [0.16, 1, 0.3, 1] as const;

/** One hand-picked real piece per design-library category -- a taste of the
 * full library (60+ SVGs across six categories), not a dump of every asset.
 * Slugs are real entries from src/lib/assets/manifest.ts. */
const CURATED_ARTWORK: { category: DesignCategory; slug: string }[] = [
  { category: "typography", slug: "good-energy" },
  { category: "graffiti", slug: "street-flame" },
  { category: "illustration", slug: "botanical-flower" },
  { category: "abstract", slug: "abstract-loop" },
  { category: "minimal", slug: "tiny-star" },
  { category: "graphic-art", slug: "retro-sun" },
];

const CATEGORY_LABELS: Record<DesignCategory, string> = {
  typography: "Typography",
  graffiti: "Graffiti",
  illustration: "Illustration",
  abstract: "Abstract",
  minimal: "Minimal",
  "graphic-art": "Graphic Art",
};

/** Alternating up/down entrance per column, staggered left to right -- reads
 * like the tiles are being dealt onto the page rather than fading in as a
 * block, the distinct kinetic idea for this section. */
function cardVariants(index: number): Variants {
  const fromBelow = index % 2 === 1;
  return {
    hidden: { opacity: 0, y: fromBelow ? 46 : -46, rotate: fromBelow ? 4 : -4, scale: 0.85 },
    show: { opacity: 1, y: 0, rotate: 0, scale: 1, transition: { duration: 0.6, ease: EASE } },
  };
}

const CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export function CuratedArtworkGrid() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.ul
      className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-6"
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={CONTAINER}
    >
      {CURATED_ARTWORK.map(({ category, slug }, index) => {
        const entry = designAssets[category].find((asset) => asset.path.endsWith(`/${slug}.svg`));
        if (!entry) return null;
        return (
          <motion.li key={entry.id} className="flex flex-col items-center gap-2 text-center" variants={cardVariants(index)}>
            <motion.span
              className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-sm border border-border bg-surface p-5"
              whileHover={reduceMotion ? undefined : { scale: 1.06, rotate: index % 2 === 1 ? -3 : 3 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size static SVG from the design library */}
              <img src={entry.path} alt={entry.name ?? ""} className="h-full w-full object-contain" />
            </motion.span>
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.08em] text-muted">
              {CATEGORY_LABELS[category]}
            </span>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
