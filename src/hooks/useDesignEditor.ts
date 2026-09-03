import { useEffect, useRef, useState, type RefObject } from "react";
import {
  Canvas,
  Circle,
  FabricObject,
  Group,
  IText,
  loadSVGFromString,
  Path,
  Polygon,
  Rect,
  Triangle,
  util as fabricUtil,
  Image as FabricImage,
  type FabricObject as FabricObjectType,
} from "fabric";
import { useEditorStore } from "@/lib/editor/store";
import { otherSide, type EditorSide } from "@/lib/editor/side";
import type { ArtworkDef } from "@/lib/editor/artwork";
import { EDITOR_FONTS } from "@/lib/editor/fonts";
import { toCharSpacing } from "@/lib/editor/textSpacing";
import type { InitialEditorContent } from "@/lib/editor/initialContent";
import {
  canRedo as historyCanRedo,
  canUndo as historyCanUndo,
  createHistory,
  pushHistory,
  redo as historyRedo,
  undo as historyUndo,
  type History,
} from "@/lib/editor/history";
import {
  CANVAS_SIZE,
  CANVAS_TEXT_FONT_FAMILY,
  DEFAULT_TEXT_CONTENT,
  DEFAULT_TEXT_FILL,
  DEFAULT_TEXT_FONT_SIZE,
  PRINT_GUIDE_BOUNDS,
} from "@/lib/editor/constants";

type EditorObject = FabricObjectType & { id?: string };

export type UpdatableProps = Partial<{
  left: number;
  top: number;
  angle: number;
  fontSize: number;
  fill: string;
  text: string;
  fontFamily: string;
  fontWeight: string | number;
  charSpacing: number;
  lineHeight: number;
  textAlign: string;
}>;

export type LayerInfo = {
  id: string;
  label: string;
  type: string;
  visible: boolean;
  active: boolean;
};

export type ActiveObjectProps = {
  id: string;
  type: string;
  left: number;
  top: number;
  angle: number;
  width: number;
  height: number;
  fill?: string;
  isText: boolean;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  charSpacing?: number;
  lineHeight?: number;
  textAlign?: string;
};

function objectId(object: FabricObjectType): string | undefined {
  return (object as EditorObject).id;
}

function emptyCanvasSnapshot(): string {
  return JSON.stringify({ objects: [] });
}

/** Objects loaded from template data (hand-authored for preview rendering,
 * not the editor) won't have the custom `id` this hook keys everything by
 * (layers, updateProps, delete-by-id). Backfills one for any object that's
 * missing it after any programmatic load. */
function ensureIds(canvas: Canvas) {
  canvas.getObjects().forEach((object) => {
    if (!objectId(object)) {
      object.set("id", crypto.randomUUID());
    }
  });
}

/** Loads one side's serialized snapshot onto the live canvas -- the same
 * "loadFromJSON if non-empty, else clear" shape `applyHistoryPresent` and
 * `toggleSide` already use, factored out so the hydration effect below can
 * share it without duplicating the logic a third time. Deliberately doesn't
 * touch history/dirty/store state itself -- callers that need those (like
 * `applyHistoryPresent`) still own that separately, since hydration
 * specifically must NOT mark the editor dirty for content it didn't change. */
async function loadJsonOntoCanvas(canvas: Canvas, json: object) {
  canvas.discardActiveObject();
  const parsed = json as { objects?: unknown[] };
  if (parsed.objects && parsed.objects.length > 0) {
    await canvas.loadFromJSON(parsed);
  } else {
    canvas.clear();
  }
  ensureIds(canvas);
  canvas.requestRenderAll();
}

/**
 * Shape of a template JSON from the externally generated "STITCH artwork
 * library" package (public/assets/templates/**). This is NOT the same
 * format as `design_templates.canvas_json` (a raw Fabric `canvas.toObject()`
 * snapshot) -- it's a template-level descriptor authored without knowledge
 * of this repo (1200x1200 canvas space, `type: "svg"` objects referencing a
 * file `src` rather than inline Fabric geometry, `letterSpacing` instead of
 * Fabric's `charSpacing`, no object `id`s). `buildGeneratedTemplateObjects`
 * below is the adapter that converts this into real Fabric objects; nothing
 * about the existing `design_templates`/`applyTemplate` path changes.
 */
type GeneratedTemplateObject =
  | {
      type: "svg";
      src: string;
      left: number;
      top: number;
      scale: number;
      angle: number;
      opacity: number;
      originX: "left" | "center" | "right";
      originY: "top" | "center" | "bottom";
    }
  | {
      type: "text";
      text: string;
      left: number;
      top: number;
      fontSize: number;
      fontFamily: string;
      letterSpacing?: number;
      angle: number;
      fill: string;
      fontStyle?: string;
      fontWeight?: string | number;
      originX: "left" | "center" | "right";
      originY: "top" | "center" | "bottom";
    };

type GeneratedTemplate = {
  schemaVersion: string;
  id: string;
  name: string;
  category: string;
  description?: string;
  canvas: { width: number; height: number; suggestedGarmentColor?: string };
  objects: GeneratedTemplateObject[];
  tags?: string[];
};

/** The generated templates reference font names by their plain CSS name
 * ("Anton", "Playfair Display", "Oswald"). Canvas 2D text can't resolve a
 * bare family name unless that exact string is what next/font registered,
 * so this maps each referenced name to one of this project's actually-
 * loaded curated fonts (see lib/editor/fonts.ts). Oswald isn't in our
 * curated set -- Bebas Neue (also a bold condensed sans) is the closest
 * loaded stand-in rather than silently falling back to the browser default. */
const GENERATED_FONT_FAMILY_MAP: Record<string, string> = {
  Anton: EDITOR_FONTS.find((f) => f.id === "anton")?.fabricFamily ?? CANVAS_TEXT_FONT_FAMILY,
  "Playfair Display": EDITOR_FONTS.find((f) => f.id === "playfair")?.fabricFamily ?? CANVAS_TEXT_FONT_FAMILY,
  Oswald: EDITOR_FONTS.find((f) => f.id === "bebas")?.fabricFamily ?? CANVAS_TEXT_FONT_FAMILY,
};

function resolveGeneratedFontFamily(name: string): string {
  return GENERATED_FONT_FAMILY_MAP[name] ?? CANVAS_TEXT_FONT_FAMILY;
}

/** The DB-seeded `design_templates` rows (see supabase/seed.sql) store
 * loose CSS-stack font strings ("Archivo, sans-serif", "Anton, sans-serif")
 * rather than the actual next/font-generated family names Canvas 2D text
 * needs to resolve the real curated typeface -- unlike the generated-JSON
 * template path above, nothing previously remapped these before they hit
 * the canvas, so applying a DB template silently rendered its text in
 * whatever generic sans the browser falls back to. This is that same
 * remap, for the same two strings actually used in the seed data. */
const DB_TEMPLATE_FONT_FAMILY_MAP: Record<string, string> = {
  "Archivo, sans-serif": EDITOR_FONTS.find((f) => f.id === "archivo")?.fabricFamily ?? CANVAS_TEXT_FONT_FAMILY,
  "Anton, sans-serif": EDITOR_FONTS.find((f) => f.id === "anton")?.fabricFamily ?? CANVAS_TEXT_FONT_FAMILY,
};

/** Applied to a DB template's canvas_json (front and back) before it's ever
 * loaded onto the canvas or written into history. Any text object's
 * fontFamily that matches a known loose seed string gets the real curated
 * family; anything unrecognized passes through untouched rather than being
 * forced to a guess -- an unknown value can't crash Canvas 2D text (it just
 * falls back to a generic sans), so leaving it alone is the safe default. */
function remapTemplateFonts(canvasJson: object): object {
  const parsed = canvasJson as { objects?: Array<Record<string, unknown>> };
  if (!Array.isArray(parsed.objects)) return canvasJson;
  return {
    ...parsed,
    objects: parsed.objects.map((object) => {
      const fontFamily = object.fontFamily;
      if (typeof fontFamily !== "string") return object;
      const mapped = DB_TEMPLATE_FONT_FAMILY_MAP[fontFamily];
      return mapped ? { ...object, fontFamily: mapped } : object;
    }),
  };
}

/** Caches the fetched *text* of a bundled SVG file (never the parsed Fabric
 * objects -- those are stateful/positioned instances that must stay
 * independent per insertion, so `loadSVGFromString` still runs fresh every
 * call). Module-level, not per-hook-instance, so it persists for the
 * editor session regardless of how many times a design/template gets
 * loaded: these are STITCH's own static, same-origin, immutable bundled
 * assets (public/assets/designs/**, public/assets/templates/**'s "svg"
 * pieces), so there's no invalidation concern to design for. Caching the
 * in-flight Promise (not just the resolved string) also de-dupes
 * concurrent requests for the same path; a failed fetch evicts itself so
 * one transient failure doesn't permanently block a retry. */
const svgTextCache = new Map<string, Promise<string>>();

function fetchSvgText(path: string): Promise<string> {
  const cached = svgTextCache.get(path);
  if (cached) return cached;

  const promise = fetch(path)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch asset: ${path} (${res.status})`);
      return res.text();
    })
    .catch((error) => {
      svgTextCache.delete(path);
      throw error;
    });
  svgTextCache.set(path, promise);
  return promise;
}

/** Converts one generated-template object into a real, positioned Fabric
 * object using Fabric's own SVG parser (`loadSVGFromString`) for `"svg"`
 * pieces -- the safe, existing import path, not a hand-rolled SVG parser --
 * and a normal `IText` for `"text"` pieces so wording stays editable. `scale`
 * rescales from the template's 1200x1200 design space into this editor's
 * real CANVAS_SIZE. Returns `null` (rather than throwing) if a single piece
 * fails to load, so one bad asset can't take down an entire template. */
async function buildGeneratedTemplateObject(
  obj: GeneratedTemplateObject,
  scale: number,
): Promise<FabricObjectType | null> {
  try {
    if (obj.type === "svg") {
      const svgText = await fetchSvgText(obj.src);
      const { objects: svgObjects } = await loadSVGFromString(svgText);
      const valid = svgObjects.filter((o): o is FabricObjectType => o != null);
      if (valid.length === 0) return null;
      const node = valid.length > 1 ? fabricUtil.groupSVGElements(valid) : valid[0];
      node.set({
        left: obj.left * scale,
        top: obj.top * scale,
        angle: obj.angle,
        opacity: obj.opacity,
        originX: obj.originX,
        originY: obj.originY,
      });
      node.scale(obj.scale * scale);
      return node;
    }

    const text = new IText(obj.text, {
      left: obj.left * scale,
      top: obj.top * scale,
      fontSize: obj.fontSize * scale,
      fontFamily: resolveGeneratedFontFamily(obj.fontFamily),
      charSpacing: toCharSpacing(obj.letterSpacing, obj.fontSize),
      angle: obj.angle,
      fill: obj.fill,
      fontWeight: obj.fontWeight ?? "400",
      originX: obj.originX,
      originY: obj.originY,
    });
    return text;
  } catch (error) {
    console.error("Failed to load generated-template object", obj, error);
    return null;
  }
}

function labelForObject(object: FabricObjectType): string {
  if (object instanceof IText) return `Text: "${object.text?.slice(0, 24) ?? ""}"`;
  if (object instanceof FabricImage) return "Uploaded image";
  if (object instanceof Group) return "Graphic";
  return object.type ? object.type[0].toUpperCase() + object.type.slice(1) : "Object";
}

/** Keeps a placed object's center from drifting entirely outside the real
 * printable area -- a soft clamp applied after a move/resize/rotate
 * completes, not a hard drag boundary (which would fight the user's hand
 * mid-drag). */
function clampToPrintGuide(object: FabricObjectType) {
  const bounds = object.getBoundingRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const minX = PRINT_GUIDE_BOUNDS.left;
  const maxX = PRINT_GUIDE_BOUNDS.left + PRINT_GUIDE_BOUNDS.width;
  const minY = PRINT_GUIDE_BOUNDS.top;
  const maxY = PRINT_GUIDE_BOUNDS.top + PRINT_GUIDE_BOUNDS.height;

  let dx = 0;
  let dy = 0;
  if (centerX < minX) dx = minX - centerX;
  else if (centerX > maxX) dx = maxX - centerX;
  if (centerY < minY) dy = minY - centerY;
  else if (centerY > maxY) dy = maxY - centerY;

  if (dx !== 0 || dy !== 0) {
    object.set({ left: (object.left ?? 0) + dx, top: (object.top ?? 0) + dy });
    object.setCoords();
  }
}

function buildArtworkObject(def: ArtworkDef): FabricObjectType {
  const common = { left: CANVAS_SIZE / 2, top: CANVAS_SIZE / 2, originX: "center" as const, originY: "center" as const };

  switch (def.shape.kind) {
    case "rect":
      return new Rect({ ...common, width: 110, height: 110, fill: def.defaultFill });
    case "circle":
      return new Circle({ ...common, radius: 55, fill: def.defaultFill });
    case "triangle":
      return new Triangle({ ...common, width: 110, height: 110, fill: def.defaultFill });
    case "polygon":
      return new Polygon(def.shape.points, { ...common, fill: def.defaultFill });
    case "path":
      return new Path(def.shape.d, { ...common, fill: def.defaultFill });
    case "group": {
      const children = def.shape.parts.map((part) =>
        part.kind === "circle"
          ? new Circle({ left: part.cx, top: part.cy, originX: "center", originY: "center", radius: part.r, fill: part.fill ?? def.defaultFill })
          : new Path(part.d, { left: 0, top: 0, fill: part.fill ?? def.defaultFill }),
      );
      return new Group(children, common);
    }
  }
}

const BLANK_INITIAL_CONTENT: InitialEditorContent = { kind: "blank" };

export function useDesignEditor(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  initialContent: InitialEditorContent = BLANK_INITIAL_CONTENT,
) {
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const historyRef = useRef<Record<EditorSide, History>>({
    front: createHistory(emptyCanvasSnapshot()),
    back: createHistory(emptyCanvasSnapshot()),
  });
  const suppressHistoryRef = useRef(false);
  // Pending debounced history push (property-panel edits only -- see
  // pushSnapshotDebounced below), so a rapid slider/number-input drag
  // doesn't spawn one MAX_HISTORY-eating undo step per intermediate value.
  const historyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const HISTORY_DEBOUNCE_MS = 400;
  const [isReady, setIsReady] = useState(false);
  // True while a saved design/template/artwork is being loaded onto the
  // canvas at mount -- false immediately for a blank session (the common
  // case), since there's nothing to wait for. Guards Save/Add-to-cart from
  // firing against a not-yet-fully-loaded canvas (see handleSave/
  // handleConfirmAddToCart in EditorShell) and drives the loading overlay.
  const [isHydrating, setIsHydrating] = useState(initialContent.kind !== "blank");
  const [hydrationError, setHydrationError] = useState<string | null>(null);
  // Guards the hydration effect below to run at most once per real mount --
  // React Strict Mode's dev-only mount->cleanup->mount double-invoke would
  // otherwise risk double-inserting artwork/applying a template twice; the
  // `cancelled` flag inside the effect additionally guards against a
  // still-in-flight async fetch from the first invocation applying its
  // result after the second mount has already taken over (same pattern
  // useStaticFabricPreview.ts already uses for the same class of problem).
  const initializedRef = useRef(false);

  const syncHistoryFlags = (side: EditorSide) => {
    const h = historyRef.current[side];
    useEditorStore.getState().setHistoryFlags(historyCanUndo(h), historyCanRedo(h));
  };

  const pushSnapshot = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || suppressHistoryRef.current) return;
    const side = useEditorStore.getState().side;
    const snapshot = JSON.stringify(canvas.toObject(["id"]));
    historyRef.current[side] = pushHistory(historyRef.current[side], snapshot);
    syncHistoryFlags(side);
    useEditorStore.getState().bumpCanvasVersion();
  };

  /** If a debounced history push is pending, commit it immediately instead
   * of waiting out the timer. Anything that reads historyRef as "the
   * current truth" (undo, redo, side-toggle, export for save/cart) must
   * call this first -- otherwise a property change made just before one of
   * those actions could still be sitting in the debounce window and never
   * make it into history, which would both misalign undo (it would step
   * past the unsaved change instead of past it) and silently drop the
   * change from a Save/Add-to-cart taken in that same window. */
  const flushPendingSnapshot = () => {
    if (historyDebounceRef.current === null) return;
    clearTimeout(historyDebounceRef.current);
    historyDebounceRef.current = null;
    pushSnapshot();
  };

  /** Same contract as pushSnapshot, but coalesces a burst of calls (e.g.
   * every onChange tick while dragging a rotation/spacing slider) into one
   * history entry recorded HISTORY_DEBOUNCE_MS after the burst settles,
   * rather than one full canvas serialization per intermediate value. The
   * live canvas/visual update itself is never debounced -- only when the
   * result gets committed to undo history. Used by updateProps only;
   * every other mutation path (canvas events, template apply, side
   * toggle) keeps pushing synchronously via pushSnapshot. */
  const pushSnapshotDebounced = () => {
    if (historyDebounceRef.current !== null) clearTimeout(historyDebounceRef.current);
    historyDebounceRef.current = setTimeout(() => {
      historyDebounceRef.current = null;
      pushSnapshot();
    }, HISTORY_DEBOUNCE_MS);
  };

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const canvas = new Canvas(canvasEl, {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      selection: true,
    });
    canvas.set({
      selectionColor: "rgba(193, 98, 58, 0.12)",
      selectionBorderColor: "#c1623a",
    });
    FabricObject.ownDefaults.borderColor = "#c1623a";
    FabricObject.ownDefaults.cornerColor = "#f5f1e8";
    FabricObject.ownDefaults.cornerStrokeColor = "#c1623a";
    FabricObject.ownDefaults.cornerStyle = "circle";
    FabricObject.ownDefaults.cornerSize = 10;
    FabricObject.ownDefaults.transparentCorners = false;
    fabricCanvasRef.current = canvas;

    const syncSelection = () => {
      const ids = canvas
        .getActiveObjects()
        .map(objectId)
        .filter((id): id is string => Boolean(id));
      useEditorStore.getState().setSelectedObjectIds(ids);
    };

    const markDirty = () => useEditorStore.getState().markDirty();
    const onMutated = () => {
      markDirty();
      pushSnapshot();
    };
    const onObjectModified = (e: { target?: FabricObjectType }) => {
      if (e.target) clampToPrintGuide(e.target);
      onMutated();
    };

    canvas.on("selection:created", syncSelection);
    canvas.on("selection:updated", syncSelection);
    canvas.on("selection:cleared", syncSelection);
    canvas.on("object:added", onMutated);
    canvas.on("object:removed", onMutated);
    canvas.on("object:modified", onObjectModified);
    canvas.on("text:editing:exited", onMutated);

    setIsReady(true);
    syncHistoryFlags(useEditorStore.getState().side);

    return () => {
      if (historyDebounceRef.current !== null) {
        clearTimeout(historyDebounceRef.current);
        historyDebounceRef.current = null;
      }
      canvas.dispose();
      fabricCanvasRef.current = null;
      historyRef.current = {
        front: createHistory(emptyCanvasSnapshot()),
        back: createHistory(emptyCanvasSnapshot()),
      };
      setIsReady(false);
      useEditorStore.getState().reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount only, canvasRef identity is stable
  }, []);

  /** Loads the resolved initial content (a saved design, a template, one
   * piece of artwork, or nothing at all) onto the canvas exactly once, right
   * after the canvas itself becomes ready -- not before (nothing to load
   * onto yet) and not more than once (initializedRef + the Strict-Mode-safe
   * `cancelled` flag). History is suppressed for the whole duration and then
   * seeded directly via createHistory() rather than pushHistory(), so the
   * loaded content becomes the starting `present` with an empty `past` --
   * there is nothing to undo back to a blank canvas from, per the initial
   * content, not "every setup step," being the starting state. */
  useEffect(() => {
    if (!isReady) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    const canvas = fabricCanvasRef.current;
    if (!canvas || initialContent.kind === "blank") {
      setIsHydrating(false);
      return;
    }

    let cancelled = false;
    suppressHistoryRef.current = true;

    const finish = (frontJson: object, backJson: object | null, startSide: EditorSide) => {
      if (cancelled) return;
      historyRef.current.front = createHistory(JSON.stringify(frontJson));
      historyRef.current.back = createHistory(JSON.stringify(backJson ?? { objects: [] }));
      suppressHistoryRef.current = false;
      useEditorStore.getState().setSide(startSide);
      syncHistoryFlags(startSide);
      setIsHydrating(false);
    };

    (async () => {
      try {
        if (initialContent.kind === "design") {
          const front = initialContent.front ?? { objects: [] };
          const back = initialContent.back ?? { objects: [] };
          const startSide = initialContent.startSide;
          await loadJsonOntoCanvas(canvas, startSide === "front" ? front : back);
          if (cancelled) return;
          finish(front, back, startSide);
        } else if (initialContent.kind === "template") {
          const front = remapTemplateFonts(initialContent.canvasJson);
          const back = initialContent.backCanvasJson ? remapTemplateFonts(initialContent.backCanvasJson) : null;
          await loadJsonOntoCanvas(canvas, front);
          if (cancelled) return;
          finish(front, back, "front");
        } else if (initialContent.kind === "artwork") {
          const node = await loadSvgAssetObject(initialContent.path);
          if (cancelled) return;
          if (node) {
            canvas.add(node);
            canvas.setActiveObject(node);
            canvas.requestRenderAll();
          }
          finish(canvas.toObject(["id"]), null, "front");
        }
      } catch (error) {
        console.error("Failed to load initial editor content", initialContent, error);
        if (cancelled) return;
        suppressHistoryRef.current = false;
        setIsHydrating(false);
        const message =
          initialContent.kind === "design"
            ? "Couldn't load your saved design"
            : initialContent.kind === "template"
              ? "Couldn't load that template"
              : "Couldn't load that artwork";
        setHydrationError(message);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per real mount by design (initializedRef guard); initialContent is fixed for the life of an editor session
  }, [isReady]);

  const addText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new IText(DEFAULT_TEXT_CONTENT, {
      left: CANVAS_SIZE / 2,
      top: CANVAS_SIZE / 2,
      originX: "center",
      originY: "center",
      fontSize: DEFAULT_TEXT_FONT_SIZE,
      fontFamily: CANVAS_TEXT_FONT_FAMILY,
      fill: DEFAULT_TEXT_FILL,
    });
    text.set("id", crypto.randomUUID());

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
    canvas.requestRenderAll();
  };

  const insertArtwork = (def: ArtworkDef) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const object = buildArtworkObject(def);
    object.set("id", crypto.randomUUID());
    canvas.add(object);
    canvas.setActiveObject(object);
    canvas.requestRenderAll();
  };

  /** Fetches + parses one real SVG file from the artwork library
   * (public/assets/designs/**) into a positioned, centered, appropriately
   * scaled Fabric object -- via Fabric's own SVG parser, same as the "svg"
   * pieces inside a generated template. Doesn't touch the canvas itself
   * (no add/select/render), so both a manual "Use this" click
   * (`insertSvgAsset` below) and the mount-time artwork-handoff hydration
   * further down can share this one build step and each decide their own
   * canvas/history/selection semantics around it. Shares fetchSvgText's
   * cache with the generated-template loader above, so inserting the same
   * piece twice in one session only fetches it once. */
  const loadSvgAssetObject = async (path: string): Promise<FabricObjectType | null> => {
    const svgText = await fetchSvgText(path);
    const { objects: svgObjects } = await loadSVGFromString(svgText);
    const valid = svgObjects.filter((o): o is FabricObjectType => o != null);
    if (valid.length === 0) return null;

    const node = valid.length > 1 ? fabricUtil.groupSVGElements(valid) : valid[0];
    node.set({
      left: CANVAS_SIZE / 2,
      top: CANVAS_SIZE / 2,
      originX: "center",
      originY: "center",
      id: crypto.randomUUID(),
    });
    const maxDim = CANVAS_SIZE * 0.4;
    const bounds = node.getBoundingRect();
    const intrinsic = Math.max(bounds.width, bounds.height) || 1;
    node.scale(Math.min(1, maxDim / intrinsic));
    return node;
  };

  /** Inserts one real SVG file from the artwork library as an editable,
   * movable/resizable/rotatable canvas object. Kept separate from
   * `insertArtwork` (which builds from this project's own hand-authored
   * shape data, synchronously, no fetch) since loading an external file is
   * inherently async. */
  const insertSvgAsset = async (path: string): Promise<void> => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const node = await loadSvgAssetObject(path);
    if (!node) return;

    canvas.add(node);
    canvas.setActiveObject(node);
    canvas.requestRenderAll();
  };

  const addImageFromFile = (file: File): Promise<void> => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const img = await FabricImage.fromURL(dataUrl);
          img.set("id", crypto.randomUUID());
          const maxDim = CANVAS_SIZE * 0.55;
          const currentW = img.width ?? maxDim;
          const currentH = img.height ?? maxDim;
          const scale = Math.min(1, maxDim / Math.max(currentW, currentH));
          img.scale(scale);
          img.set({ left: CANVAS_SIZE / 2, top: CANVAS_SIZE / 2, originX: "center", originY: "center" });
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.requestRenderAll();
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  /** Guards keyboard shortcuts (Delete/Backspace especially) from firing
   * while the user is actively typing inside a text object -- otherwise
   * pressing Backspace to edit a word would delete the whole object. */
  const isEditingText = () => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    return active instanceof IText && active.isEditing;
  };

  const deleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObjects();
    if (active.length === 0) return;

    canvas.discardActiveObject();
    active.forEach((object) => canvas.remove(object));
    canvas.requestRenderAll();
  };

  /** Deletes one specific object by its custom id, independent of whatever
   * is (or isn't) currently selected -- what the Layers panel's per-row
   * trash icon actually needs, distinct from `deleteSelected` (the
   * "Delete"/Backspace shortcut and the object-controls trash icon, both
   * of which really do mean "delete whatever's selected"). Only clears the
   * active selection if the deleted object was part of it; deleting an
   * unselected layer leaves the current selection untouched. `canvas.
   * remove()` fires "object:removed", which the canvas's own event
   * listener already turns into a history snapshot -- no manual
   * pushSnapshot() call needed here, same as deleteSelected above. */
  const deleteObjectById = (id: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const target = canvas.getObjects().find((object) => objectId(object) === id);
    if (!target) return;

    if (canvas.getActiveObjects().includes(target)) {
      canvas.discardActiveObject();
    }
    canvas.remove(target);
    canvas.requestRenderAll();
  };

  const duplicateSelected = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (!active) return;

    const clone = await active.clone();
    clone.set({
      left: (active.left ?? 0) + 16,
      top: (active.top ?? 0) + 16,
      id: crypto.randomUUID(),
    });
    canvas.add(clone);
    canvas.setActiveObject(clone);
    canvas.requestRenderAll();
  };

  const updateProps = (id: string, props: UpdatableProps) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const target = canvas.getObjects().find((object) => objectId(object) === id);
    if (!target) return;

    target.set(props);
    target.setCoords();
    canvas.requestRenderAll();
    useEditorStore.getState().markDirty();
    pushSnapshotDebounced();
  };

  const selectLayer = (id: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const target = canvas.getObjects().find((object) => objectId(object) === id);
    if (!target) return;
    canvas.setActiveObject(target);
    canvas.requestRenderAll();
  };

  const setObjectVisibility = (id: string, visible: boolean) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const target = canvas.getObjects().find((object) => objectId(object) === id);
    if (!target) return;
    target.set("visible", visible);
    canvas.requestRenderAll();
    onLayersChanged();
  };

  const reorderLayer = (id: string, direction: "up" | "down") => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const target = canvas.getObjects().find((object) => objectId(object) === id);
    if (!target) return;
    if (direction === "up") canvas.bringObjectForward(target);
    else canvas.sendObjectBackwards(target);
    canvas.requestRenderAll();
    onLayersChanged();
  };

  const onLayersChanged = () => {
    useEditorStore.getState().markDirty();
    useEditorStore.getState().bumpCanvasVersion();
    pushSnapshot();
  };

  const getLayers = (): LayerInfo[] => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return [];
    const activeIds = new Set(canvas.getActiveObjects().map(objectId));
    return canvas
      .getObjects()
      .map((object) => ({
        id: objectId(object) ?? "",
        label: labelForObject(object),
        type: object.type ?? "object",
        visible: object.visible !== false,
        active: activeIds.has(objectId(object)),
      }))
      .filter((layer) => layer.id)
      .reverse();
  };

  const getActiveObjectProps = (): ActiveObjectProps | null => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return null;
    const object = canvas.getActiveObject() as EditorObject | undefined;
    if (!object || !object.id) return null;

    const isText = object instanceof IText;
    const bounds = object.getBoundingRect();
    return {
      id: object.id,
      type: object.type ?? "object",
      left: Math.round(object.left ?? 0),
      top: Math.round(object.top ?? 0),
      angle: Math.round(object.angle ?? 0),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height),
      fill: typeof object.fill === "string" ? object.fill : undefined,
      isText,
      text: isText ? (object as IText).text : undefined,
      fontFamily: isText ? (object as IText).fontFamily : undefined,
      fontSize: isText ? (object as IText).fontSize : undefined,
      fontWeight: isText ? (object as IText).fontWeight : undefined,
      charSpacing: isText ? (object as IText).charSpacing : undefined,
      lineHeight: isText ? (object as IText).lineHeight : undefined,
      textAlign: isText ? (object as IText).textAlign : undefined,
    };
  };

  const applyHistoryPresent = (side: EditorSide, present: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    suppressHistoryRef.current = true;
    canvas.discardActiveObject();
    const parsed = JSON.parse(present) as { objects?: unknown[] };
    const loaded = parsed.objects && parsed.objects.length > 0 ? canvas.loadFromJSON(parsed) : Promise.resolve(canvas.clear());
    loaded.then(() => {
      ensureIds(canvas);
      canvas.requestRenderAll();
      suppressHistoryRef.current = false;
      useEditorStore.getState().setSelectedObjectIds([]);
      useEditorStore.getState().markDirty();
      useEditorStore.getState().bumpCanvasVersion();
      syncHistoryFlags(side);
    });
  };

  /** Loads a template's composition onto the canvas -- both sides at once
   * when the template has back artwork, so a template like "front slogan +
   * back logo" arrives fully assembled. Objects stay fully editable
   * (text/shape/position/color), never flattened. */
  const applyTemplate = (template: { canvas_json: object; back_canvas_json: object | null }) => {
    historyRef.current.front = pushHistory(
      historyRef.current.front,
      JSON.stringify(remapTemplateFonts(template.canvas_json)),
    );
    if (template.back_canvas_json) {
      historyRef.current.back = pushHistory(
        historyRef.current.back,
        JSON.stringify(remapTemplateFonts(template.back_canvas_json)),
      );
    }
    const side = useEditorStore.getState().side;
    applyHistoryPresent(side, historyRef.current[side].present);
  };

  /** Same "apply to the current side, fully editable afterward" contract as
   * `applyTemplate`, for the externally generated STITCH artwork-library
   * templates -- a different on-disk format (see GeneratedTemplate above),
   * so it needs its own async loader, but it's additive: `applyTemplate`
   * and the DB-backed template path are untouched. */
  const applyGeneratedTemplate = async (templatePath: string): Promise<void> => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const template = await fetch(templatePath).then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch template: ${templatePath}`);
      return res.json() as Promise<GeneratedTemplate>;
    });

    const scale = CANVAS_SIZE / template.canvas.width;
    const built = await Promise.all(
      template.objects.map((obj) => buildGeneratedTemplateObject(obj, scale)),
    );
    const objects = built.filter((o): o is FabricObjectType => o !== null);
    if (objects.length === 0) return;

    suppressHistoryRef.current = true;
    canvas.discardActiveObject();
    canvas.clear();
    objects.forEach((object) => canvas.add(object));
    ensureIds(canvas);
    canvas.requestRenderAll();
    suppressHistoryRef.current = false;

    useEditorStore.getState().setSelectedObjectIds([]);
    useEditorStore.getState().markDirty();
    pushSnapshot();
  };

  const undo = () => {
    flushPendingSnapshot();
    const side = useEditorStore.getState().side;
    const h = historyRef.current[side];
    if (!historyCanUndo(h)) return;
    const next = historyUndo(h);
    historyRef.current[side] = next;
    applyHistoryPresent(side, next.present);
  };

  const redo = () => {
    flushPendingSnapshot();
    const side = useEditorStore.getState().side;
    const h = historyRef.current[side];
    if (!historyCanRedo(h)) return;
    const next = historyRedo(h);
    historyRef.current[side] = next;
    applyHistoryPresent(side, next.present);
  };

  const toggleSide = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Must happen before reading `current`/switching sides: a debounced
    // snapshot that's still pending when the side flips would otherwise
    // fire later against the *new* side's canvas content instead of the
    // side the edit actually happened on.
    flushPendingSnapshot();
    const current = useEditorStore.getState().side;
    const next = otherSide(current);

    const currentSnapshot = JSON.stringify(canvas.toObject(["id"]));
    historyRef.current[current] = pushHistory(historyRef.current[current], currentSnapshot);

    suppressHistoryRef.current = true;
    canvas.discardActiveObject();

    const nextPresent = historyRef.current[next].present;
    const parsed = JSON.parse(nextPresent) as { objects?: unknown[] };
    if (parsed.objects && parsed.objects.length > 0) {
      await canvas.loadFromJSON(parsed);
    } else {
      canvas.clear();
    }
    ensureIds(canvas);
    canvas.requestRenderAll();
    suppressHistoryRef.current = false;

    useEditorStore.getState().setSide(next);
    useEditorStore.getState().setSelectedObjectIds([]);
    syncHistoryFlags(next);
  };

  /** Serialized state for both sides, for Save/Preview/Add-to-cart. */
  const exportState = () => {
    flushPendingSnapshot();
    const canvas = fabricCanvasRef.current;
    const side = useEditorStore.getState().side;
    if (canvas) {
      historyRef.current[side] = pushHistory(
        historyRef.current[side],
        JSON.stringify(canvas.toObject(["id"])),
      );
    }
    const parseOrNull = (snapshot: string) => {
      const parsed = JSON.parse(snapshot) as { objects?: unknown[] };
      return parsed.objects && parsed.objects.length > 0 ? parsed : null;
    };
    return {
      front: parseOrNull(historyRef.current.front.present),
      back: parseOrNull(historyRef.current.back.present),
    };
  };

  /** A flattened raster of the current side, for a preview/cart thumbnail. */
  const exportThumbnail = (): string | null => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL({ format: "png", multiplier: 0.5 });
  };

  return {
    isReady,
    isHydrating,
    hydrationError,
    clearHydrationError: () => setHydrationError(null),
    isEditingText,
    addText,
    insertArtwork,
    insertSvgAsset,
    addImageFromFile,
    applyTemplate,
    applyGeneratedTemplate,
    updateProps,
    deleteSelected,
    deleteObjectById,
    duplicateSelected,
    toggleSide,
    undo,
    redo,
    getLayers,
    selectLayer,
    setObjectVisibility,
    reorderLayer,
    getActiveObjectProps,
    exportState,
    exportThumbnail,
  };
}
