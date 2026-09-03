import { ALL_ARTWORK, type ArtworkItem } from "@/lib/assets/artworkSearch";
import type { DesignTemplate, TemplateCategory } from "@/lib/templates/queries";
import type { EditorSide } from "@/lib/editor/side";

/**
 * What the editor should have on the canvas the moment it becomes
 * interactive, resolved once (server-side, in app/editor/new/page.tsx) from
 * whichever of designId/template/artwork/product+color the URL carried.
 * Framework-agnostic and pure so the precedence rule below is unit
 * testable without a Supabase client or a mounted Fabric canvas.
 */
export type InitialEditorContent =
  | { kind: "design"; front: object | null; back: object | null; startSide: EditorSide }
  | { kind: "template"; canvasJson: object; backCanvasJson: object | null }
  | { kind: "artwork"; path: string }
  | { kind: "blank" };

export type SavedDesignForHydration = {
  front: object | null;
  back: object | null;
};

/** Builds a `/editor/new` link with the handoff contract's query params --
 * one shared implementation so every "Use this"/"Customize" link-builder
 * (Design Hub, Inspiration, ArtworkOnGarment's per-piece links) constructs
 * the same shape rather than each hand-assembling its own URLSearchParams. */
export function buildEditorHref(productSlug: string, colorId: string, extra?: Record<string, string>): string {
  return `/editor/new?${new URLSearchParams({ product: productSlug, color: colorId, ...extra }).toString()}`;
}

function hasObjects(canvasJson: object | null): boolean {
  if (!canvasJson) return false;
  const objects = (canvasJson as { objects?: unknown[] }).objects;
  return Array.isArray(objects) && objects.length > 0;
}

/** Which side to open a resumed design on. There's no stored "last active
 * side" column (deliberately not added -- no schema change for this alone);
 * inferred instead from which side actually has content, front preferred
 * when both do or neither does. */
export function inferStartSide(front: object | null, back: object | null): EditorSide {
  if (hasObjects(front)) return "front";
  if (hasObjects(back)) return "back";
  return "front";
}

/** Resolves an `artwork=` query value to a real library entry via the
 * canonical manifest-backed list -- never a hardcoded per-file lookup.
 * Returns `null` for a missing/unknown id rather than throwing, so an old
 * or mistyped link degrades to a blank canvas instead of failing the page. */
export function resolveArtworkParam(artworkId: string | undefined): ArtworkItem | null {
  if (!artworkId) return null;
  return ALL_ARTWORK.find((item) => item.id === artworkId) ?? null;
}

/** Resolves a `template=` query value (a real `design_templates.id`) against
 * the already-fetched template groups -- no second database round trip.
 * Returns both the template and its owning category (the category is what
 * `nearestRealColorForCategory` needs for product/color continuity). */
export function resolveTemplateParam(
  templateId: string | undefined,
  templateGroups: { category: TemplateCategory; templates: DesignTemplate[] }[],
): { template: DesignTemplate; category: TemplateCategory } | null {
  if (!templateId) return null;
  for (const group of templateGroups) {
    const template = group.templates.find((t) => t.id === templateId);
    if (template) return { template, category: group.category };
  }
  return null;
}

/**
 * The single precedence rule for what a new editor session opens with.
 * A resolved saved design always wins (Phase 2 spec: "the saved design is
 * authoritative") -- template and artwork are mutually exclusive with it and
 * with each other; anything that didn't resolve falls through toward a
 * blank canvas rather than erroring.
 */
export function resolveInitialContent(input: {
  savedDesign: SavedDesignForHydration | null;
  template: DesignTemplate | null;
  artwork: ArtworkItem | null;
}): InitialEditorContent {
  if (input.savedDesign) {
    return {
      kind: "design",
      front: input.savedDesign.front,
      back: input.savedDesign.back,
      startSide: inferStartSide(input.savedDesign.front, input.savedDesign.back),
    };
  }
  if (input.template) {
    return {
      kind: "template",
      canvasJson: input.template.canvas_json,
      backCanvasJson: input.template.back_canvas_json,
    };
  }
  if (input.artwork) {
    return { kind: "artwork", path: input.artwork.path };
  }
  return { kind: "blank" };
}
