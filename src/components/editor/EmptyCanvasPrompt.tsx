"use client";

import { motion, useReducedMotion } from "motion/react";
import { Image as ImageIcon, SquaresFour, TextT, UploadSimple } from "@phosphor-icons/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Shown over the print area only while it's genuinely empty (no objects on
 * the current side) -- the blank canvas is still the real, live, clickable
 * design surface underneath (this is a non-interactive overlay, `pointer-
 * events-none` on itself, with only its buttons `pointer-events-auto`), not
 * a placeholder that gets swapped out. Disappears the instant anything is
 * added. Mirrors LeftToolbar's four entry points exactly (Templates/
 * Graphics/Text/Upload) rather than inventing a fifth path into the same
 * actions.
 */
export function EmptyCanvasPrompt({
  onOpenTemplates,
  onOpenGraphics,
  onAddText,
  onOpenUpload,
}: {
  onOpenTemplates: () => void;
  onOpenGraphics: () => void;
  onAddText: () => void;
  onOpenUpload: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 px-6 text-center"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-label font-semibold uppercase tracking-[0.18em] text-accent">Blank canvas</span>
        <h2 className="font-display text-display-md text-foreground">Start with an idea.</h2>
      </div>
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
        {[
          { label: "Templates", icon: SquaresFour, onClick: onOpenTemplates },
          { label: "Artwork", icon: ImageIcon, onClick: onOpenGraphics },
          { label: "Text", icon: TextT, onClick: onAddText },
          { label: "Upload", icon: UploadSimple, onClick: onOpenUpload },
        ].map(({ label, icon: Icon, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="flex items-center gap-2 rounded-full border border-border bg-background/90 px-4 py-2 text-body-sm font-medium text-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
