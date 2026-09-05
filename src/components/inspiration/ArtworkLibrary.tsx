"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowUpRight, MagnifyingGlass, X } from "@phosphor-icons/react";
import { Container } from "@/components/layout/Container";
import {
  ALL_ARTWORK,
  ARTWORK_CATEGORIES,
  ARTWORK_CATEGORY_LABELS,
  filterArtwork,
  type ArtworkItem,
} from "@/lib/assets/artworkSearch";
import type { DesignCategory } from "@/lib/assets/manifest";

const EASE = [0.16, 1, 0.3, 1] as const;

const CATEGORY_FILTERS: { value: DesignCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  ...ARTWORK_CATEGORIES.map((category) => ({ value: category, label: ARTWORK_CATEGORY_LABELS[category] })),
];

const CARD: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: EASE } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2, ease: EASE } },
};

function ArtworkCard({ item, editorHref, index }: { item: ArtworkItem; editorHref: string; index: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      layout={!reduceMotion}
      variants={CARD}
      initial="hidden"
      animate="show"
      exit="exit"
      transition={{ delay: reduceMotion ? 0 : Math.min(index, 12) * 0.02 }}
    >
      <Link
        href={editorHref}
        aria-label={`Use ${item.name} (${ARTWORK_CATEGORY_LABELS[item.category]}) on a shirt`}
        className="group relative flex aspect-square flex-col overflow-hidden rounded-sm border border-border bg-surface p-6 transition-colors duration-300 hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <motion.span
          aria-hidden
          className="absolute inset-0"
          initial={false}
          style={{
            background:
              "radial-gradient(120% 100% at 30% 20%, color-mix(in oklab, var(--color-accent) 0%, transparent) 0%, transparent 60%)",
          }}
          whileHover={
            reduceMotion
              ? undefined
              : {
                  background:
                    "radial-gradient(120% 100% at 30% 20%, color-mix(in oklab, var(--color-accent) 12%, transparent) 0%, transparent 60%)",
                }
          }
          transition={{ duration: 0.3, ease: EASE }}
        />

        {/* Absolutely positioned (not a metadata-row sibling) so it never
            competes with the name/category text for width -- at 2-column
            mobile widths, an inline invisible badge was squeezing artwork
            names down to a single truncated character. */}
        <span className="pointer-events-none absolute right-4 top-4 z-10 flex translate-y-1 items-center gap-1 whitespace-nowrap rounded-full bg-accent px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-accent-foreground opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          Add to design
          <ArrowUpRight size={11} weight="bold" aria-hidden />
        </span>

        <motion.img
          src={item.path}
          alt={`${item.name} artwork`}
          className="relative z-10 h-full w-full flex-1 object-contain p-4 text-foreground"
          draggable={false}
          whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: -2 }}
          whileFocus={reduceMotion ? undefined : { scale: 1.08 }}
          transition={{ duration: 0.35, ease: EASE }}
        />

        <div className="relative z-10 flex flex-col">
          <span className="line-clamp-2 text-body-sm font-medium leading-tight text-foreground">{item.name}</span>
          <span className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-[0.08em] text-muted">
            {ARTWORK_CATEGORY_LABELS[item.category]}
          </span>
        </div>
      </Link>
    </motion.li>
  );
}

/**
 * The full 67-piece STITCH artwork library (see src/lib/assets/manifest.ts
 * -- designAssets), browsable and filterable client-side. `editorHref` is
 * the base `/editor/new?product=...&color=...` destination -- a plain
 * string, deliberately not a per-item function: this component (and its
 * caller, a Server Component page) sit across the React Server/Client
 * boundary, and functions aren't serializable across it. Each card appends
 * its own `artwork=<id>` onto that base href client-side instead, which
 * needs no server-side computation (artwork has no inherent garment color
 * the way a template preview does, so every card shares the same base).
 */
export function ArtworkLibrary({ editorHref }: { editorHref: string }) {
  const reduceMotion = useReducedMotion();
  const [category, setCategory] = useState<DesignCategory | "all">("all");
  const [query, setQuery] = useState("");

  const results = useMemo(() => filterArtwork(ALL_ARTWORK, { category, query }), [category, query]);
  const hrefFor = (item: ArtworkItem) => {
    const [path, existingQuery] = editorHref.split("?");
    const params = new URLSearchParams(existingQuery ?? "");
    params.set("artwork", item.id);
    return `${path}?${params.toString()}`;
  };

  return (
    <section id="artwork" className="scroll-mt-24 py-section">
      <Container>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-col gap-2"
        >
          <span className="text-label font-semibold uppercase tracking-[0.18em] text-accent">Artwork</span>
          <h2 className="font-display text-display-xl text-foreground">The full library.</h2>
          <p className="max-w-md text-body-lg text-muted">
            {ALL_ARTWORK.length} real pieces, ready to place on a blank shirt.
          </p>
        </motion.div>

        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 md:mx-0 md:flex-wrap md:px-0 md:pb-0">
            {CATEGORY_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setCategory(filter.value)}
                aria-pressed={category === filter.value}
                className={`shrink-0 rounded-full border px-4 py-2 text-body-sm font-medium uppercase tracking-wide transition-colors ${
                  category === filter.value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted hover:border-accent hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <label className="relative flex w-full items-center md:w-64">
            <span className="sr-only">Search artwork by name or category</span>
            <MagnifyingGlass size={16} className="pointer-events-none absolute left-3.5 text-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search artwork..."
              className="min-h-11 w-full rounded-full border border-border bg-surface pl-10 pr-9 text-body-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 flex h-5 w-5 items-center justify-center text-muted hover:text-foreground"
              >
                <X size={13} weight="bold" />
              </button>
            )}
          </label>
        </div>

        {results.length > 0 ? (
          <motion.ul
            layout={!reduceMotion}
            className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {results.map((item, index) => (
                <ArtworkCard key={item.id} item={item} editorHref={hrefFor(item)} index={index} />
              ))}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <p className="mt-16 text-center text-body text-muted">
            Nothing matches &ldquo;{query}&rdquo;{category !== "all" ? ` in ${ARTWORK_CATEGORY_LABELS[category]}` : ""}. Try
            another search or category.
          </p>
        )}
      </Container>
    </section>
  );
}
