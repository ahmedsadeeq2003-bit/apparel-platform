"use client";

import { Image as ImageIcon, Shapes, Sparkle, SquaresFour, TextT, UploadSimple } from "@phosphor-icons/react";
import type { EditorTool } from "@/lib/editor/store";

const TOOLS: { id: EditorTool; label: string; icon: typeof Shapes }[] = [
  { id: "templates", label: "Templates", icon: SquaresFour },
  { id: "elements", label: "Elements", icon: Shapes },
  { id: "graphics", label: "Graphics", icon: ImageIcon },
  { id: "upload", label: "Upload", icon: UploadSimple },
];

export function LeftToolbar({
  activeTool,
  onSelectTool,
  onAddText,
}: {
  activeTool: EditorTool;
  onSelectTool: (tool: EditorTool) => void;
  onAddText: () => void;
}) {
  return (
    <nav
      aria-label="Design tools"
      className="flex shrink-0 gap-1 border-border bg-background p-2 md:w-20 md:flex-col md:border-r md:p-3"
    >
      {TOOLS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelectTool(id)}
          aria-pressed={activeTool === id}
          className={`flex flex-1 flex-col items-center gap-1.5 rounded-sm px-2 py-3 text-[0.7rem] font-medium transition-colors md:flex-none ${
            activeTool === id
              ? "bg-surface text-accent"
              : "text-muted hover:bg-surface hover:text-foreground"
          }`}
        >
          <Icon size={20} weight={activeTool === id ? "fill" : "regular"} />
          {label}
        </button>
      ))}
      <button
        type="button"
        onClick={onAddText}
        className="flex flex-1 flex-col items-center gap-1.5 rounded-sm px-2 py-3 text-[0.7rem] font-medium text-muted transition-colors hover:bg-surface hover:text-foreground md:flex-none"
      >
        <TextT size={20} />
        Text
      </button>
      <span className="hidden items-center justify-center gap-1.5 px-2 pt-2 text-[0.65rem] text-accent md:flex md:flex-col">
        <Sparkle size={14} weight="fill" />
      </span>
    </nav>
  );
}
