import { describe, expect, it } from "vitest";
import {
  inferStartSide,
  resolveArtworkParam,
  resolveInitialContent,
  resolveTemplateParam,
} from "./initialContent";
import { ALL_ARTWORK } from "@/lib/assets/artworkSearch";
import type { DesignTemplate, TemplateCategory } from "@/lib/templates/queries";

const CATEGORY: TemplateCategory = { id: "cat-1", slug: "minimal", name: "Minimal", sort_order: 0 };
const TEMPLATE: DesignTemplate = {
  id: "tpl-1",
  category_id: "cat-1",
  name: "Less Is More",
  design_type: "minimal_design",
  print_area: "front",
  canvas_json: { objects: [] },
  back_canvas_json: null,
  colors: ["#F4F2EC"],
  tags: ["minimal"],
};
const TEMPLATE_GROUPS = [{ category: CATEGORY, templates: [TEMPLATE] }];

describe("inferStartSide", () => {
  it("prefers front when front has content", () => {
    expect(inferStartSide({ objects: [{}] }, { objects: [{}] })).toBe("front");
  });

  it("falls back to back when only back has content", () => {
    expect(inferStartSide({ objects: [] }, { objects: [{}] })).toBe("back");
  });

  it("falls back to back when front is null and back has content", () => {
    expect(inferStartSide(null, { objects: [{}] })).toBe("back");
  });

  it("defaults to front when neither side has content", () => {
    expect(inferStartSide({ objects: [] }, null)).toBe("front");
    expect(inferStartSide(null, null)).toBe("front");
  });
});

describe("resolveArtworkParam", () => {
  it("resolves a real artwork id from the canonical manifest-backed list", () => {
    const real = ALL_ARTWORK[0];
    expect(resolveArtworkParam(real.id)).toEqual(real);
  });

  it("returns null for an unknown id", () => {
    expect(resolveArtworkParam("not-a-real-artwork-id")).toBeNull();
  });

  it("returns null when undefined", () => {
    expect(resolveArtworkParam(undefined)).toBeNull();
  });
});

describe("resolveTemplateParam", () => {
  it("resolves a real template id and its owning category", () => {
    expect(resolveTemplateParam("tpl-1", TEMPLATE_GROUPS)).toEqual({ template: TEMPLATE, category: CATEGORY });
  });

  it("returns null for an unknown id", () => {
    expect(resolveTemplateParam("not-a-real-template-id", TEMPLATE_GROUPS)).toBeNull();
  });

  it("returns null when undefined", () => {
    expect(resolveTemplateParam(undefined, TEMPLATE_GROUPS)).toBeNull();
  });
});

describe("resolveInitialContent precedence", () => {
  it("returns blank when nothing resolved", () => {
    expect(resolveInitialContent({ savedDesign: null, template: null, artwork: null })).toEqual({ kind: "blank" });
  });

  it("returns artwork content when only artwork resolved", () => {
    const artwork = ALL_ARTWORK[0];
    expect(resolveInitialContent({ savedDesign: null, template: null, artwork })).toEqual({
      kind: "artwork",
      path: artwork.path,
    });
  });

  it("returns template content when only template resolved", () => {
    expect(resolveInitialContent({ savedDesign: null, template: TEMPLATE, artwork: null })).toEqual({
      kind: "template",
      canvasJson: TEMPLATE.canvas_json,
      backCanvasJson: TEMPLATE.back_canvas_json,
    });
  });

  it("a saved design wins over a template passed alongside it", () => {
    const savedDesign = { front: { objects: [{}] }, back: null };
    const result = resolveInitialContent({ savedDesign, template: TEMPLATE, artwork: null });
    expect(result.kind).toBe("design");
  });

  it("a saved design wins over artwork passed alongside it", () => {
    const savedDesign = { front: { objects: [{}] }, back: null };
    const artwork = ALL_ARTWORK[0];
    const result = resolveInitialContent({ savedDesign, template: null, artwork });
    expect(result.kind).toBe("design");
  });

  it("template takes precedence over artwork if both are somehow resolved", () => {
    const artwork = ALL_ARTWORK[0];
    const result = resolveInitialContent({ savedDesign: null, template: TEMPLATE, artwork });
    expect(result.kind).toBe("template");
  });

  it("infers the correct start side for a resumed design", () => {
    const savedDesign = { front: null, back: { objects: [{}] } };
    const result = resolveInitialContent({ savedDesign, template: null, artwork: null });
    expect(result).toEqual({ kind: "design", front: null, back: { objects: [{}] }, startSide: "back" });
  });
});
