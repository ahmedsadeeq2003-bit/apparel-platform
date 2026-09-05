"use client";

import { useEffect, useState, type RefObject } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { CopySimple, Stack, Trash } from "@phosphor-icons/react";
import { CANVAS_SIZE } from "@/lib/editor/constants";
import type { ActiveObjectProps } from "@/hooks/useDesignEditor";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * A small floating action cluster that appears directly above whatever's
 * currently selected on the canvas -- "Duplicate / Bring forward / Delete,"
 * the three actions relevant to almost any selection, so a customer doesn't
 * need to reach over to the right panel for the most common next move.
 * Deliberately general-purpose, not per-object-type-specialized: font/
 * color/etc. stay in RightPanel rather than being duplicated into a second
 * control surface here, per "do not create a second selection system" --
 * this reads position from the *existing* activeObject/Fabric selection
 * state, it doesn't track selection itself.
 *
 * Position is computed from the live canvas element's own
 * getBoundingClientRect() (which already reflects the zoom transform and
 * the print-area overlay sizing, however the canvas ends up laid out) --
 * not a parallel geometry system -- converted from the object's canvas-
 * space bounding box (boundsLeft/boundsTop/width, in the fixed 600x600
 * logical space) into real screen pixels. Recomputed whenever the
 * selection, its transform, or the zoom level changes; does not track
 * position live during an in-progress drag (Fabric's own selection
 * handles already provide that feedback) -- it settles into place once a
 * gesture completes and the object's committed position is known.
 */
export function SelectionToolbar({
  canvasRef,
  activeObject,
  zoom,
  onDuplicate,
  onBringForward,
  onDelete,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  activeObject: ActiveObjectProps | null;
  zoom: number;
  onDuplicate: () => void;
  onBringForward: () => void;
  onDelete: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [screenPos, setScreenPos] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!activeObject || !canvasEl) {
      setScreenPos(null);
      return;
    }
    const canvasRect = canvasEl.getBoundingClientRect();
    const scaleX = canvasRect.width / CANVAS_SIZE;
    const scaleY = canvasRect.height / CANVAS_SIZE;
    setScreenPos({
      left: canvasRect.left + (activeObject.boundsLeft + activeObject.width / 2) * scaleX,
      top: canvasRect.top + activeObject.boundsTop * scaleY,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- canvasRef is a stable ref object, not a reactive value
  }, [
    activeObject?.id,
    activeObject?.boundsLeft,
    activeObject?.boundsTop,
    activeObject?.width,
    activeObject?.height,
    activeObject?.angle,
    zoom,
  ]);

  return (
    <AnimatePresence>
      {activeObject && screenPos && (
        <motion.div
          role="toolbar"
          aria-label="Selection actions"
          className="pointer-events-auto fixed z-30 flex -translate-x-1/2 -translate-y-[calc(100%+10px)] items-center gap-0.5 rounded-full border border-border bg-background/95 p-1 shadow-lg backdrop-blur-sm"
          style={{ left: screenPos.left, top: screenPos.top }}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 4 }}
          transition={{ duration: 0.18, ease: EASE }}
        >
          <button
            type="button"
            onClick={onDuplicate}
            aria-label="Duplicate"
            title="Duplicate (Ctrl+D)"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <CopySimple size={15} />
          </button>
          <button
            type="button"
            onClick={onBringForward}
            aria-label="Bring forward"
            title="Bring forward"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <Stack size={15} />
          </button>
          <div className="mx-0.5 h-4 w-px bg-border" />
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete"
            title="Delete"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-danger"
          >
            <Trash size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
