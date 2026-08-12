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
});
