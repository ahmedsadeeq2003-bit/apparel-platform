import { create } from "zustand";
import { otherSide, type EditorSide } from "./side";

export type EditorTool = "templates" | "elements" | "graphics" | "upload" | null;

type EditorState = {
  side: EditorSide;
  selectedObjectIds: string[];
  isDirty: boolean;
  activeTool: EditorTool;
  previewMode: boolean;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  /** Bumped on every canvas mutation. Panels that read live Fabric state
   * (layers, the selected object's properties) key an effect off this
   * instead of duplicating that state into the store. */
  canvasVersion: number;
};

type EditorActions = {
  setSide: (side: EditorSide) => void;
  toggleSide: () => void;
  setSelectedObjectIds: (ids: string[]) => void;
  markDirty: () => void;
  markClean: () => void;
  setActiveTool: (tool: EditorTool) => void;
  setPreviewMode: (value: boolean) => void;
  setZoom: (zoom: number) => void;
  setHistoryFlags: (canUndo: boolean, canRedo: boolean) => void;
  bumpCanvasVersion: () => void;
  reset: () => void;
};

export type EditorStore = EditorState & EditorActions;

const initialState: EditorState = {
  side: "front",
  selectedObjectIds: [],
  isDirty: false,
  activeTool: null,
  previewMode: false,
  zoom: 1,
  canUndo: false,
  canRedo: false,
  canvasVersion: 0,
};

export const useEditorStore = create<EditorStore>((set) => ({
  ...initialState,

  setSide: (side) => set({ side, selectedObjectIds: [] }),

  toggleSide: () =>
    set((state) => ({ side: otherSide(state.side), selectedObjectIds: [] })),

  setSelectedObjectIds: (selectedObjectIds) => set({ selectedObjectIds }),

  markDirty: () => set((state) => (state.isDirty ? state : { ...state, isDirty: true })),

  markClean: () => set((state) => (state.isDirty ? { ...state, isDirty: false } : state)),

  setActiveTool: (activeTool) =>
    set((state) => ({ activeTool: state.activeTool === activeTool ? null : activeTool })),

  setPreviewMode: (previewMode) => set({ previewMode }),

  setZoom: (zoom) => set({ zoom: Math.min(2, Math.max(0.5, zoom)) }),

  setHistoryFlags: (canUndo, canRedo) => set({ canUndo, canRedo }),

  bumpCanvasVersion: () => set((state) => ({ canvasVersion: state.canvasVersion + 1 })),

  reset: () => set(initialState),
}));
