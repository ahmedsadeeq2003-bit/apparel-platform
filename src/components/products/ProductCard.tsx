"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { MagneticButton } from "@/components/marketing/MagneticButton";
import { getGarmentPhoto, GARMENT_PHOTO_ASPECT } from "@/lib/products/garmentPhoto";
import type { Product } from "@/lib/products/queries";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The one editorial showcase piece on /products -- there's a single real
 * product today, so this deliberately isn't a grid tile sized for a catalog
 * of many; it's a large feature layout with its own live color-switching,
 * so "whoa, this is a fashion platform" lands on first load rather than
 * only after clicking through. Color swatches live as siblings of the
 * `<Link>` (not nested inside it) since a `<button>` inside an `<a>` is both
 * invalid HTML and would fire the navigation on every swatch click.
 */
export function ProductCard({ product }: { product: Product }) {
  const reduceMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState(product.product_colors[0]?.id);
  const selected = product.product_colors.find((color) => color.id === selectedId) ?? product.product_colors[0];
  const photo = selected ? getGarmentPhoto(product.slug, selected.name, "front") : null;
  const detailHref = `/products/${product.slug}`;

  return (
    <div className="grid gap-10 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-16 lg:gap-24">
      <Link href={detailHref} aria-label={`Design the ${product.name}`} className="group relative block">
        <motion.div
          className="relative aspect-[4/5] overflow-hidden rounded-sm bg-surface"
          whileHover={reduceMotion ? undefined : { scale: 1.015 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <AnimatePresence mode="wait">
            {photo && selected && (
              <motion.div
                key={selected.id}
                className="absolute inset-0"
                initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <Image
                  src={photo.path}
                  alt={`${product.name} in ${selected.name}`}
                  width={GARMENT_PHOTO_ASPECT.width}
                  height={GARMENT_PHOTO_ASPECT.height}
                  priority
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-x-6 bottom-6 flex justify-end">
            <span className="flex translate-y-2 items-center gap-1.5 rounded-full bg-background/90 px-4 py-2 text-label font-semibold uppercase tracking-[0.14em] text-foreground opacity-0 backdrop-blur-sm transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
              Design yours
              <ArrowUpRight size={14} weight="bold" aria-hidden />
            </span>
          </div>
        </motion.div>
      </Link>

      <div className="flex flex-col gap-6">
        <span className="text-label font-semibold uppercase tracking-[0.18em] text-accent">
          The Classic Tee
        </span>
        <h2 className="font-display text-display-xl text-foreground">{product.name}</h2>
        {product.description && (
          <p className="max-w-md text-body-lg text-muted">{product.description}</p>
        )}

        <div className="flex flex-col gap-3">
          <span className="text-body-sm text-muted" aria-live="polite">
            Color: <span className="font-medium text-foreground">{selected?.name}</span>
          </span>
          <div className="flex gap-3">
            {product.product_colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setSelectedId(color.id)}
                aria-label={color.name}
                aria-pressed={color.id === selectedId}
                className={`h-11 w-11 rounded-full border-2 transition-transform duration-200 hover:scale-110 ${
                  color.id === selectedId ? "border-accent" : "border-border"
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>

        <MagneticButton
          href={detailHref}
          className="mt-2 inline-flex w-fit min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 text-body-sm font-semibold uppercase tracking-wide text-accent-foreground transition-opacity hover:opacity-90"
        >
          Design yours
          <ArrowUpRight size={16} weight="bold" aria-hidden />
        </MagneticButton>
      </div>
    </div>
  );
}
