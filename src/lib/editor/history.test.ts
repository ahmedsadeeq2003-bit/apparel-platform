import { describe, expect, it } from "vitest";
import { canRedo, canUndo, createHistory, pushHistory, redo, undo } from "./history";

describe("editor history", () => {
  it("starts with no past or future", () => {
    const h = createHistory("a");
    expect(h.present).toBe("a");
    expect(canUndo(h)).toBe(false);
    expect(canRedo(h)).toBe(false);
  });

  it("pushing a snapshot moves the previous present into the past", () => {
    let h = createHistory("a");
    h = pushHistory(h, "b");
    expect(h.present).toBe("b");
    expect(h.past).toEqual(["a"]);
    expect(canUndo(h)).toBe(true);
  });

  it("pushing an identical snapshot is a no-op", () => {
    let h = createHistory("a");
    h = pushHistory(h, "a");
    expect(h.past).toEqual([]);
  });

  it("pushing clears the future (new branch discards redo)", () => {
    let h = createHistory("a");
    h = pushHistory(h, "b");
    h = undo(h);
    expect(canRedo(h)).toBe(true);
    h = pushHistory(h, "c");
    expect(h.present).toBe("c");
    expect(canRedo(h)).toBe(false);
  });

  it("undo then redo round-trips back to the same state", () => {
    let h = createHistory("a");
    h = pushHistory(h, "b");
    h = pushHistory(h, "c");
    h = undo(h);
    expect(h.present).toBe("b");
    h = undo(h);
    expect(h.present).toBe("a");
    expect(canUndo(h)).toBe(false);
    h = redo(h);
    expect(h.present).toBe("b");
    h = redo(h);
    expect(h.present).toBe("c");
    expect(canRedo(h)).toBe(false);
  });

  it("undo/redo at the boundary is a no-op", () => {
    const h = createHistory("a");
    expect(undo(h)).toBe(h);
    expect(redo(h)).toBe(h);
  });

  it("caps history length", () => {
    let h = createHistory("0");
    for (let i = 1; i <= 60; i++) {
      h = pushHistory(h, String(i));
    }
    expect(h.past.length).toBeLessThanOrEqual(50);
  });
});
