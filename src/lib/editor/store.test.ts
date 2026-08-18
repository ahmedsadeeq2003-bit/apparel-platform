import { beforeEach, describe, expect, it } from "vitest";
import { useEditorStore } from "./store";

describe("editor store", () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  it("starts on the front side with no selection and a clean state", () => {
    const state = useEditorStore.getState();
    expect(state.side).toBe("front");
    expect(state.selectedObjectIds).toEqual([]);
    expect(state.isDirty).toBe(false);
  });

  it("toggles the side and clears the selection", () => {
    useEditorStore.getState().setSelectedObjectIds(["a", "b"]);
    useEditorStore.getState().toggleSide();
    const state = useEditorStore.getState();
    expect(state.side).toBe("back");
    expect(state.selectedObjectIds).toEqual([]);
  });

  it("setSide sets an explicit side and clears the selection", () => {
    useEditorStore.getState().setSelectedObjectIds(["a"]);
    useEditorStore.getState().setSide("back");
    const state = useEditorStore.getState();
    expect(state.side).toBe("back");
    expect(state.selectedObjectIds).toEqual([]);
  });

  it("tracks selected object ids", () => {
    useEditorStore.getState().setSelectedObjectIds(["x", "y"]);
    expect(useEditorStore.getState().selectedObjectIds).toEqual(["x", "y"]);
  });

  it("markDirty sets isDirty and is a no-op once already dirty", () => {
    useEditorStore.getState().markDirty();
    const afterFirst = useEditorStore.getState();
    expect(afterFirst.isDirty).toBe(true);

    useEditorStore.getState().markDirty();
    expect(useEditorStore.getState().isDirty).toBe(true);
  });

  it("markClean clears isDirty", () => {
    useEditorStore.getState().markDirty();
    useEditorStore.getState().markClean();
    expect(useEditorStore.getState().isDirty).toBe(false);
  });

  it("reset restores the initial state", () => {
    useEditorStore.getState().setSide("back");
    useEditorStore.getState().setSelectedObjectIds(["a"]);
    useEditorStore.getState().markDirty();

    useEditorStore.getState().reset();

    const state = useEditorStore.getState();
    expect(state.side).toBe("front");
    expect(state.selectedObjectIds).toEqual([]);
    expect(state.isDirty).toBe(false);
  });

  it("setActiveTool opens a tool, and clicking the same tool again closes it", () => {
    useEditorStore.getState().setActiveTool("templates");
    expect(useEditorStore.getState().activeTool).toBe("templates");

    useEditorStore.getState().setActiveTool("templates");
    expect(useEditorStore.getState().activeTool).toBeNull();
  });

  it("setActiveTool switches directly between two different tools", () => {
    useEditorStore.getState().setActiveTool("templates");
    useEditorStore.getState().setActiveTool("elements");
    expect(useEditorStore.getState().activeTool).toBe("elements");
  });

  it("setZoom clamps to the 0.5-2 range", () => {
    useEditorStore.getState().setZoom(5);
    expect(useEditorStore.getState().zoom).toBe(2);

    useEditorStore.getState().setZoom(0.1);
    expect(useEditorStore.getState().zoom).toBe(0.5);
  });

  it("setHistoryFlags updates canUndo/canRedo", () => {
    useEditorStore.getState().setHistoryFlags(true, false);
    expect(useEditorStore.getState().canUndo).toBe(true);
    expect(useEditorStore.getState().canRedo).toBe(false);
  });

  it("bumpCanvasVersion increments monotonically", () => {
    const before = useEditorStore.getState().canvasVersion;
    useEditorStore.getState().bumpCanvasVersion();
    expect(useEditorStore.getState().canvasVersion).toBe(before + 1);
  });
});
