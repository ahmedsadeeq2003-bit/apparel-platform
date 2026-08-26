"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { getGarmentPhoto, hasGarmentPhoto, GARMENT_PHOTO_ASPECT } from "@/lib/products/garmentPhoto";
import type { ProductColor } from "@/lib/products/queries";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Real garment photography (see src/lib/products/garmentPhoto.ts), not the
 * old TShirtMockup SVG silhouette. Only Black has a real back photo today --
 * the Front/Back toggle only renders when the *currently selected* color
 * actually has one, and the displayed side is clamped to "front" during
 * render (not reset via an effect) whenever the selected color has no back
 * photo, so there's never a stale or blank back view on screen (option 2
 * from the brief: disable rather than fake it). The requested side itself
 * is left untouched by the clamp, so switching back to a color that does
 * have a back photo resumes whichever view was last chosen for it.
 */
export function ProductColorPicker({
  productSlug,
  productName,
  colors,
  selectedId,
  onSelect,
}: {
  productSlug: string;
  productName: string;
  colors: ProductColor[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const selected = colors.find((color) => color.id === selectedId) ?? colors[0];
  const [requestedSide, setRequestedSide] = useState<"front" | "back">("front");

  const canShowBack = selected ? hasGarmentPhoto(productSlug, selected.name, "back") : false;
  const side = canShowBack ? requestedSide : "front";

  const photo = selected ? getGarmentPhoto(productSlug, selected.name, side) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-surface">
        <AnimatePresence mode="wait">
          {photo && selected && (
            <motion.div
              key={`${selected.id}-${side}`}
              className="absolute inset-0"
              initial={reduceMotion ? false : { opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <Image
                src={photo.path}
                alt={`${productName} in ${selected.name}, ${side} view`}
                width={GARMENT_PHOTO_ASPECT.width}
                height={GARMENT_PHOTO_ASPECT.height}
                priority
                className="h-full w-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {canShowBack && (
          <div className="absolute left-6 top-6 flex gap-2">
            {(["front", "back"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRequestedSide(value)}
                aria-pressed={side === value}
                className={`rounded-full border px-4 py-1.5 text-label font-semibold uppercase tracking-[0.1em] backdrop-blur-sm transition-colors ${
                  side === value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background/70 text-muted hover:text-foreground"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-body-sm text-muted" aria-live="polite">
          Color: <span className="font-medium text-foreground">{selected?.name}</span>
        </span>
        <div className="flex gap-3">
          {colors.map((color) => (
            <button
              key={color.id}
              type="button"
              onClick={() => onSelect(color.id)}
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
    </div>
  );
}
