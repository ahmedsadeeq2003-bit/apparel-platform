export type EditorSide = "front" | "back";

export function otherSide(side: EditorSide): EditorSide {
  return side === "front" ? "back" : "front";
}
