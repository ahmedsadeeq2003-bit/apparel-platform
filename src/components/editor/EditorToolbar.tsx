"use client";

import { Button } from "@/components/ui/Button";
import type { EditorSide } from "@/lib/editor/side";

export function EditorToolbar({
  side,
  isDirty,
  canDelete,
  isReady,
  onAddText,
  onDeleteSelected,
  onToggleSide,
}: {
  side: EditorSide;
  isDirty: boolean;
  canDelete: boolean;
  isReady: boolean;
  onAddText: () => void;
  onDeleteSelected: () => void;
  onToggleSide: () => void;
}) {
  const otherSideLabel = side === "front" ? "back" : "front";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary" onClick={onAddText} disabled={!isReady}>
        Add text
      </Button>
      <Button
        variant="secondary"
        onClick={onDeleteSelected}
        disabled={!isReady || !canDelete}
      >
        Delete selected
      </Button>
      <Button variant="secondary" onClick={onToggleSide} disabled={!isReady}>
        Switch to {otherSideLabel}
      </Button>
      {isDirty && (
        <span className="text-body-sm text-muted">Unsaved changes</span>
      )}
    </div>
  );
}
