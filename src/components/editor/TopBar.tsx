"use client";

import { ArrowClockwise, ArrowCounterClockwise, Eye, FloppyDisk, ShoppingCartSimple } from "@phosphor-icons/react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/Button";

export function TopBar({
  designName,
  onDesignNameChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isDirty,
  isSaving,
  onSave,
  previewMode,
  onTogglePreview,
  onAddToCart,
}: {
  designName: string;
  onDesignNameChange: (value: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  previewMode: boolean;
  onTogglePreview: () => void;
  onAddToCart: () => void;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <Wordmark />
        {!previewMode && (
          <input
            value={designName}
            onChange={(e) => onDesignNameChange(e.target.value)}
            placeholder="Untitled design"
            aria-label="Design name"
            className="hidden min-w-0 max-w-[220px] rounded-sm border border-transparent bg-transparent px-2 py-1 text-body-sm font-medium text-foreground outline-none transition-colors hover:border-border focus-visible:border-accent sm:block"
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        {!previewMode && (
          <>
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ArrowCounterClockwise size={18} />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo"
              title="Redo (Ctrl+Shift+Z)"
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ArrowClockwise size={18} />
            </button>

            <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

            {isDirty && !isSaving && (
              <span className="hidden text-body-sm text-muted sm:inline">Unsaved changes</span>
            )}

            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="flex h-9 items-center gap-2 rounded-full border border-border px-3 text-body-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
            >
              <FloppyDisk size={16} />
              <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onTogglePreview}
          className={`flex h-9 items-center gap-2 rounded-full border px-3 text-body-sm font-medium transition-colors ${
            previewMode
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border text-foreground hover:border-accent hover:text-accent"
          }`}
        >
          <Eye size={16} />
          <span className="hidden sm:inline">{previewMode ? "Exit preview" : "Preview"}</span>
        </button>

        <Button
          variant="primary"
          onClick={onAddToCart}
          className="!min-h-9 gap-2 !px-3 uppercase tracking-wide text-body-sm font-semibold sm:!px-5"
        >
          <ShoppingCartSimple size={16} />
          <span className="hidden sm:inline">Add to cart</span>
        </Button>
      </div>
    </header>
  );
}
