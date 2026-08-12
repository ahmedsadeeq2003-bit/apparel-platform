import { create } from "zustand";
import { otherSide, type EditorSide } from "./side";

type EditorState = {
  side: EditorSide;
  selectedObjectIds: string[];
  isDirty: boolean;
};

type EditorActions = {
  setSide: (side: EditorSide) => void;
  toggleSide: () => void;
  setSelectedObjectIds: (ids: string[]) => void;
  markDirty: () => void;
  markClean: () => void;
  reset: () => void;
};

export type EditorStore = EditorState & EditorActions;

const initialState: EditorState = {
  side: "front",
  selectedObjectIds: [],
  isDirty: false,
};

export const useEditorStore = create<EditorStore>((set) => ({
  ...initialState,

  setSide: (side) => set({ side, selectedObjectIds: [] }),

  toggleSide: () =>
    set((state) => ({ side: otherSide(state.side), selectedObjectIds: [] })),

  setSelectedObjectIds: (selectedObjectIds) => set({ selectedObjectIds }),

  markDirty: () => set((state) => (state.isDirty ? state : { ...state, isDirty: true })),

  markClean: () => set((state) => (state.isDirty ? { ...state, isDirty: false } : state)),

  reset: () => set(initialState),
}));
