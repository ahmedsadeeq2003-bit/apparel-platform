"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { MagneticButton } from "@/components/marketing/MagneticButton";
import { ScribbleUnderline } from "@/components/marketing/EditorialMarks";
import { ProductColorPicker } from "@/components/products/ProductColorPicker";
import type { Product } from "@/lib/products/queries";

const EASE = [0.16, 1, 0.3, 1] as const;

const CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const ITEM: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/**
 * The detail page's real content: pick a color (real photography via
 * ProductColorPicker), then "Design yours" straight into /editor/new with
 * that color pre-selected. Deliberately doesn't add size/quantity/Add to
 * Cart here -- that flow already exists (AddToCartDialog, triggered from
 * inside the editor once a design exists), and belongs after a design
 * exists, not before one. This page's whole job is steps 1-2 of
 * discover -> choose -> create; the editor picks up from there.
 */
export function ProductDesignSection({ product }: { product: Product }) {
  const reduceMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState(product.product_colors[0]?.id);
  const selected = product.product_colors.find((color) => color.id === selectedId);

  const editorHref = `/editor/new?${new URLSearchParams({
    product: product.slug,
    color: selectedId ?? "",
  }).toString()}`;

  return (
    <motion.div
      className="grid gap-12 md:grid-cols-2 md:items-start md:gap-16"
      initial={reduceMotion ? false : "hidden"}
      animate="show"
      variants={CONTAINER}
    >
      <motion.div variants={ITEM}>
        <ProductColorPicker
          productSlug={product.slug}
          productName={product.name}
          colors={product.product_colors}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </motion.div>

      <div className="flex flex-col gap-6 md:pt-2">
        <motion.span
          variants={ITEM}
          className="text-label font-semibold uppercase tracking-[0.18em] text-accent"
        >
          Real garment, real print
        </motion.span>
        <motion.h1 variants={ITEM} className="font-display text-display-xl text-foreground">
          {product.name}
          {selected && (
            <>
              {" "}
              <span className="relative inline-block italic">
                in {selected.name.toLowerCase()}.
                <ScribbleUnderline className="absolute -bottom-1 left-0 h-2.5 w-full text-accent" />
              </span>
            </>
          )}
        </motion.h1>
        {product.description && (
          <motion.p variants={ITEM} className="max-w-md text-body-lg text-muted">
            {product.description}
          </motion.p>
        )}

        <motion.div variants={ITEM}>
          <MagneticButton
            href={editorHref}
            className="inline-flex min-h-14 w-fit items-center justify-center gap-2 rounded-full bg-accent px-8 text-body-sm font-semibold uppercase tracking-wide text-accent-foreground transition-opacity hover:opacity-90"
          >
            Design yours
            <ArrowUpRight size={16} weight="bold" aria-hidden />
          </MagneticButton>
        </motion.div>

        <motion.p variants={ITEM} className="text-body-sm text-muted">
          Next: real artwork, your own upload, or your own words -- then add
          your finished design to cart, sized and ready to order.
        </motion.p>
      </div>
    </motion.div>
  );
}
