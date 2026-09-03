"use client";

import {
  ArrowsClockwise,
  CaretDown,
  CaretUp,
  Copy,
  Eye,
  EyeSlash,
  Trash,
} from "@phosphor-icons/react";
import { EDITOR_FONTS } from "@/lib/editor/fonts";
import type { ActiveObjectProps, LayerInfo, UpdatableProps } from "@/hooks/useDesignEditor";

const TEXT_ALIGN_OPTIONS = ["left", "center", "right"] as const;

function ObjectControls({
  active,
  onUpdate,
  onDuplicate,
  onDelete,
}: {
  active: ActiveObjectProps;
  onUpdate: (props: UpdatableProps) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-border p-4">
      <div className="flex items-center justify-between">
        <span className="text-body-sm font-semibold text-foreground">
          {active.isText ? "Text" : "Object"}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDuplicate}
            aria-label="Duplicate"
            title="Duplicate (Ctrl+D)"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <Copy size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete"
            title="Delete"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-danger"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      {active.isText && (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted">Font</span>
            <select
              value={EDITOR_FONTS.find((f) => f.fabricFamily === active.fontFamily)?.id ?? EDITOR_FONTS[0].id}
              onChange={(e) => {
                const font = EDITOR_FONTS.find((f) => f.id === e.target.value);
                if (font) onUpdate({ fontFamily: font.fabricFamily });
              }}
              className="h-10 rounded-sm border border-border bg-surface px-3 text-body-sm text-foreground outline-none focus-visible:border-accent"
            >
              {EDITOR_FONTS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.label} · {font.direction}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted">Size</span>
              <input
                type="number"
                min={8}
                max={200}
                value={active.fontSize ?? 32}
                onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
                className="h-10 rounded-sm border border-border bg-surface px-3 text-body-sm text-foreground outline-none focus-visible:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted">Weight</span>
              <select
                value={String(active.fontWeight ?? "400")}
                onChange={(e) => onUpdate({ fontWeight: e.target.value })}
                className="h-10 rounded-sm border border-border bg-surface px-3 text-body-sm text-foreground outline-none focus-visible:border-accent"
              >
                <option value="400">Regular</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted">Letter spacing</span>
              <input
                type="number"
                min={-100}
                max={800}
                step={10}
                value={active.charSpacing ?? 0}
                onChange={(e) => onUpdate({ charSpacing: Number(e.target.value) })}
                className="h-10 rounded-sm border border-border bg-surface px-3 text-body-sm text-foreground outline-none focus-visible:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted">Line height</span>
              <input
                type="number"
                min={0.8}
                max={3}
                step={0.1}
                value={active.lineHeight ?? 1.16}
                onChange={(e) => onUpdate({ lineHeight: Number(e.target.value) })}
                className="h-10 rounded-sm border border-border bg-surface px-3 text-body-sm text-foreground outline-none focus-visible:border-accent"
              />
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted">Align</span>
            <div className="flex gap-1">
              {TEXT_ALIGN_OPTIONS.map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => onUpdate({ textAlign: align })}
                  aria-pressed={active.textAlign === align}
                  className={`flex-1 rounded-sm border py-2 text-[0.7rem] font-medium capitalize transition-colors ${
                    active.textAlign === align
                      ? "border-accent text-accent"
                      : "border-border text-muted hover:text-foreground"
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {active.fill && (
        <label className="flex items-center justify-between gap-3">
          <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted">Color</span>
          <input
            type="color"
            value={active.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="h-9 w-14 cursor-pointer rounded-sm border border-border bg-transparent"
          />
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-wide text-muted">
          <ArrowsClockwise size={12} /> Rotation
        </span>
        <input
          type="range"
          min={-180}
          max={180}
          value={active.angle}
          onChange={(e) => onUpdate({ angle: Number(e.target.value) })}
          className="accent-accent"
        />
      </label>
    </div>
  );
}

function LayersPanel({
  layers,
  onSelect,
  onToggleVisible,
  onReorder,
  onDelete,
}: {
  layers: LayerInfo[];
  onSelect: (id: string) => void;
  onToggleVisible: (id: string, visible: boolean) => void;
  onReorder: (id: string, direction: "up" | "down") => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col p-4">
      <span className="text-body-sm font-semibold text-foreground">Layers</span>
      {layers.length === 0 ? (
        <p className="mt-3 text-body-sm text-muted">Nothing on this side yet.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1">
          {layers.map((layer) => (
            <li
              key={layer.id}
              className={`group flex items-center gap-2 rounded-sm px-2 py-1.5 ${
                layer.active ? "bg-surface" : "hover:bg-surface"
              }`}
            >
              <button
                type="button"
                onClick={() => onToggleVisible(layer.id, !layer.visible)}
                aria-label={layer.visible ? "Hide layer" : "Show layer"}
                className="flex h-6 w-6 shrink-0 items-center justify-center text-muted hover:text-foreground"
              >
                {layer.visible ? <Eye size={14} /> : <EyeSlash size={14} />}
              </button>
              <button
                type="button"
                onClick={() => onSelect(layer.id)}
                className={`min-w-0 flex-1 truncate text-left text-body-sm ${
                  layer.active ? "text-accent" : "text-foreground"
                }`}
              >
                {layer.label}
              </button>
              <button
                type="button"
                onClick={() => onReorder(layer.id, "up")}
                aria-label="Bring forward"
                className="flex h-6 w-6 shrink-0 items-center justify-center text-muted opacity-0 hover:text-foreground group-hover:opacity-100"
              >
                <CaretUp size={12} />
              </button>
              <button
                type="button"
                onClick={() => onReorder(layer.id, "down")}
                aria-label="Send backward"
                className="flex h-6 w-6 shrink-0 items-center justify-center text-muted opacity-0 hover:text-foreground group-hover:opacity-100"
              >
                <CaretDown size={12} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(layer.id)}
                aria-label="Delete layer"
                className="flex h-6 w-6 shrink-0 items-center justify-center text-muted opacity-0 hover:text-danger group-hover:opacity-100"
              >
                <Trash size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RightPanel({
  activeObject,
  layers,
  onUpdate,
  onDuplicate,
  onDelete,
  onDeleteLayer,
  onSelectLayer,
  onToggleVisible,
  onReorder,
}: {
  activeObject: ActiveObjectProps | null;
  layers: LayerInfo[];
  onUpdate: (props: UpdatableProps) => void;
  onDuplicate: () => void;
  /** Deletes whatever's currently selected -- the object-controls trash
   * icon's contract. Deliberately NOT reused for the layers list below: a
   * no-argument "delete selected" silently ignores the `id` a specific
   * layer row would pass it, which is exactly the bug `onDeleteLayer`
   * exists to avoid. */
  onDelete: () => void;
  /** Deletes one specific object by id, regardless of what (if anything)
   * is currently selected -- what each layer row's own trash icon needs. */
  onDeleteLayer: (id: string) => void;
  onSelectLayer: (id: string) => void;
  onToggleVisible: (id: string, visible: boolean) => void;
  onReorder: (id: string, direction: "up" | "down") => void;
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto md:w-80 md:border-l md:border-border">
      {activeObject && (
        <ObjectControls
          active={activeObject}
          onUpdate={onUpdate}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      )}
      <LayersPanel
        layers={layers}
        onSelect={onSelectLayer}
        onToggleVisible={onToggleVisible}
        onReorder={onReorder}
        onDelete={onDeleteLayer}
      />
    </div>
  );
}
