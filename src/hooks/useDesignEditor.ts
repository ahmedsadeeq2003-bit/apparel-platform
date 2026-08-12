import { useEffect, useRef, useState, type RefObject } from "react";
import { Canvas, IText, type FabricObject } from "fabric";
import { useEditorStore } from "@/lib/editor/store";
import { otherSide, type EditorSide } from "@/lib/editor/side";
import {
  CANVAS_SIZE,
  CANVAS_TEXT_FONT_FAMILY,
  DEFAULT_TEXT_CONTENT,
  DEFAULT_TEXT_FILL,
  DEFAULT_TEXT_FONT_SIZE,
} from "@/lib/editor/constants";

type EditorObject = FabricObject & { id?: string };

type UpdatableProps = Partial<{
  left: number;
  top: number;
  angle: number;
  fontSize: number;
  fill: string;
  text: string;
}>;

function objectId(object: FabricObject): string | undefined {
  return (object as EditorObject).id;
}

export function useDesignEditor(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const sidesRef = useRef<Record<EditorSide, object | null>>({
    front: null,
    back: null,
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const canvas = new Canvas(canvasEl, {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      selection: true,
    });
    fabricCanvasRef.current = canvas;

    const syncSelection = () => {
      const ids = canvas
        .getActiveObjects()
        .map(objectId)
        .filter((id): id is string => Boolean(id));
      useEditorStore.getState().setSelectedObjectIds(ids);
    };

    const markDirty = () => useEditorStore.getState().markDirty();

    canvas.on("selection:created", syncSelection);
    canvas.on("selection:updated", syncSelection);
    canvas.on("selection:cleared", syncSelection);
    canvas.on("object:added", markDirty);
    canvas.on("object:modified", markDirty);
    canvas.on("object:removed", markDirty);

    setIsReady(true);

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
      sidesRef.current = { front: null, back: null };
      setIsReady(false);
      useEditorStore.getState().reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount only, canvasRef identity is stable
  }, []);

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

  const deleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObjects();
    if (active.length === 0) return;

    canvas.discardActiveObject();
    active.forEach((object) => canvas.remove(object));
    canvas.requestRenderAll();
  };

  const updateProps = (id: string, props: UpdatableProps) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const target = canvas.getObjects().find((object) => objectId(object) === id);
    if (!target) return;

    target.set(props);
    canvas.requestRenderAll();
    useEditorStore.getState().markDirty();
  };

  const toggleSide = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const current = useEditorStore.getState().side;
    const next = otherSide(current);

    sidesRef.current[current] = canvas.toJSON(["id"]);
    canvas.discardActiveObject();

    const nextSideData = sidesRef.current[next];
    if (nextSideData) {
      await canvas.loadFromJSON(nextSideData);
    } else {
      canvas.clear();
    }
    canvas.requestRenderAll();

    useEditorStore.getState().setSide(next);
    useEditorStore.getState().setSelectedObjectIds([]);
  };

  return { isReady, addText, updateProps, deleteSelected, toggleSide };
}
