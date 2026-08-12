import { useEffect, type RefObject } from "react";
import { Circle, IText, Rect, StaticCanvas, Triangle } from "fabric";

/**
 * Each Fabric shape class self-registers into Fabric's ClassRegistry as an
 * import side effect (e.g. IText.ts calls classRegistry.setClass(IText) at
 * module scope). Nothing in this file's own code references these classes
 * by name, but loadFromJSON's object hydration looks classes up in that
 * registry by their `type` string -- if a route's JS bundle never imports
 * a class, Next.js's per-route code splitting can tree-shake it out
 * entirely, silently leaving loadFromJSON unable to reconstruct that
 * object type. useDesignEditor.ts (the interactive editor) imports IText
 * directly for its own text tool, but that's a different route's bundle;
 * this one needs its own explicit imports for every shape type used in
 * seeded template content.
 */
void [Circle, IText, Rect, Triangle];

/**
 * Renders a non-interactive Fabric canvas from a stored canvas_json blob.
 * Deliberately separate from useDesignEditor -- this has no tool actions,
 * no store integration, no event wiring, just mount/load/dispose. Used for
 * template preview cards (homepage, gallery) where the same canvas_json
 * that a real design uses is rendered live rather than a stored image.
 *
 * Uses Fabric's StaticCanvas (not the interactive Canvas class used by
 * useDesignEditor) -- Canvas wraps the element in its own positioning
 * container and adds an upper-canvas layer for selection/interaction,
 * which fights with this component's own Tailwind sizing since these
 * cards never need interaction. StaticCanvas draws directly onto the
 * given element with no extra DOM.
 */
export function useStaticFabricPreview(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  canvasJson: object,
  size: number,
) {
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    // React (dev-mode Strict Mode) invokes effects mount -> cleanup -> mount
    // back to back. Fabric tags the DOM element with data-fabric and throws
    // synchronously if asked to initialize an element that's already
    // tagged -- guard against constructing on top of a not-yet-settled
    // prior instance instead of letting that throw happen mid-render.
    if (canvasEl.hasAttribute("data-fabric")) return;

    const canvas = new StaticCanvas(canvasEl, {
      width: size,
      height: size,
      renderOnAddRemove: true,
    });

    let cancelled = false;

    canvas
      .loadFromJSON(canvasJson)
      .then(() => {
        if (cancelled) return;
        canvas.forEachObject((object) => {
          object.selectable = false;
          object.evented = false;
        });
        // Synchronous render, not requestRenderAll()'s rAF-scheduled one --
        // these are static, one-shot previews with no ongoing animation.
        canvas.renderAll();
      })
      .catch((error) => {
        // eslint-disable-next-line no-console -- surfaces template content bugs during development
        console.error("useStaticFabricPreview: loadFromJSON failed", error);
      });

    return () => {
      cancelled = true;
      canvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- canvasJson/size are stable per mounted card
  }, []);
}
