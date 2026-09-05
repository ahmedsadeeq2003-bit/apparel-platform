"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import {
  ArrowsClockwise,
  CaretDown,
  CaretUp,
  Copy,
  Eye,
  EyeSlash,
  Image as ImageIcon,
  SquaresFour,
  Sparkle,
  TextT,
  Trash,
} from "@phosphor-icons/react";
import { EDITOR_FONTS } from "@/lib/editor/fonts";
import type { ActiveObjectProps, LayerInfo, UpdatableProps } from "@/hooks/useDesignEditor";

const EASE = [0.16, 1, 0.3, 1] as const;
const TEXT_ALIGN_OPTIONS = ["left", "center", "right"] as const;

const PANEL_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.14, ease: EASE } },
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted">{children}</span>;
}

/** Contextual controls for a single selected object -- what actually shows
 * here depends on what kind of object it is: text gets typography controls,
 * anything with a fill gets a color swatch, everything gets rotation. This
 * is the "when text is selected / when artwork is selected" split the
 * design brief asks for, driven by the object's own real properties
 * (`active.isText`, `active.fill`) rather than a second type-tracking
 * system. */
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
        <span className="flex items-center gap-1.5 text-body-sm font-semibold text-foreground">
          {active.isText ? <TextT size={14} className="text-accent" /> : <ImageIcon size={14} className="text-accent" />}
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
            <FieldLabel>Font</FieldLabel>
            <select
              value={EDITOR_FONTS.find((f) => f.fabricFamily === active.fontFamily)?.id ?? EDITOR_FONTS[0].id}
              onChange={(e) => {
                const font = EDITOR_FONTS.find((f) => f.id === e.target.value);
                if (font) onUpdate({ fontFamily: font.fabricFamily });
              }}
              className="h-10 rounded-sm border border-border bg-surface px-3 text-body-sm text-foreground outline-none transition-colors focus-visible:border-accent"
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
              <FieldLabel>Size</FieldLabel>
              <input
                type="number"
                min={8}
                max={200}
                value={active.fontSize ?? 32}
                onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
                className="h-10 rounded-sm border border-border bg-surface px-3 text-body-sm text-foreground outline-none transition-colors focus-visible:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <FieldLabel>Weight</FieldLabel>
              <select
                value={String(active.fontWeight ?? "400")}
                onChange={(e) => onUpdate({ fontWeight: e.target.value })}
                className="h-10 rounded-sm border border-border bg-surface px-3 text-body-sm text-foreground outline-none transition-colors focus-visible:border-accent"
              >
                <option value="400">Regular</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <FieldLabel>Letter spacing</FieldLabel>
              <input
                type="number"
                min={-100}
                max={800}
                step={10}
                value={active.charSpacing ?? 0}
                onChange={(e) => onUpdate({ charSpacing: Number(e.target.value) })}
                className="h-10 rounded-sm border border-border bg-surface px-3 text-body-sm text-foreground outline-none transition-colors focus-visible:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <FieldLabel>Line height</FieldLabel>
              <input
                type="number"
                min={0.8}
                max={3}
                step={0.1}
                value={active.lineHeight ?? 1.16}
                onChange={(e) => onUpdate({ lineHeight: Number(e.target.value) })}
                className="h-10 rounded-sm border border-border bg-surface px-3 text-body-sm text-foreground outline-none transition-colors focus-visible:border-accent"
              />
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Align</FieldLabel>
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
          <FieldLabel>Color</FieldLabel>
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

/** Shown instead of ObjectControls when more than one object is selected
 * (a Fabric ActiveSelection) -- these have no stamped .id of their own, so
 * they never satisfy `activeObject`'s single-object contract; this reads
 * the count already tracked in the store rather than inventing a second
 * multi-select model. The two actions here (duplicate/delete) already
 * operate on Fabric's own getActiveObjects() -- the whole selection -- with
 * no change needed to make them "group-aware." */
function MultiSelectControls({
  count,
  onDuplicate,
  onDelete,
}: {
  count: number;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border p-4">
      <span className="text-body-sm font-semibold text-foreground">{count} objects selected</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDuplicate}
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-sm border border-border text-body-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          <Copy size={15} /> Duplicate
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-sm border border-border text-body-sm font-medium text-foreground transition-colors hover:border-danger hover:text-danger"
        >
          <Trash size={15} /> Delete
        </button>
      </div>
    </div>
  );
}

/** Shown when nothing is selected at all -- rather than a blank void below
 * the layers list, this gives the panel a real job: orient the customer
 * (what they're designing) and offer the same quick-start actions the
 * empty canvas prompt does, so the right panel stays useful throughout the
 * session, not just once something's selected. */
function IdleState({
  designLabel,
  onOpenTemplates,
  onOpenGraphics,
  onAddText,
}: {
  designLabel: string;
  onOpenTemplates: () => void;
  onOpenGraphics: () => void;
  onAddText: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border p-4">
      <div className="flex flex-col gap-1">
        <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted">Designing</span>
        <span className="text-body-sm font-semibold text-foreground">{designLabel}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {[
          { label: "Browse templates", icon: SquaresFour, onClick: onOpenTemplates },
          { label: "Browse artwork", icon: ImageIcon, onClick: onOpenGraphics },
          { label: "Add text", icon: TextT, onClick: onAddText },
        ].map(({ label, icon: Icon, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-body-sm text-foreground transition-colors hover:bg-surface"
          >
            <Icon size={15} className="text-accent" />
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-start gap-2 rounded-sm bg-surface p-3 text-[0.75rem] leading-relaxed text-muted">
        <Sparkle size={13} className="mt-0.5 shrink-0 text-accent" weight="fill" />
        Click anything on the shirt to select it -- font, size, color and
        rotation all show up right here.
      </div>
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
              className={`group flex items-center gap-2 rounded-sm px-2 py-1.5 transition-colors ${
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
  multiSelectCount,
  designLabel,
  layers,
  onUpdate,
  onDuplicate,
  onDelete,
  onDeleteLayer,
  onSelectLayer,
  onToggleVisible,
  onReorder,
  onOpenTemplates,
  onOpenGraphics,
  onAddText,
}: {
  activeObject: ActiveObjectProps | null;
  /** Count of currently selected objects when it's more than one (a Fabric
   * ActiveSelection) -- 0/1 when the contextual state should instead be
   * driven by `activeObject`/the idle state. */
  multiSelectCount: number;
  /** "{Product}, {Color}" -- shown in the idle state so the panel still
   * orients the customer even with nothing selected. */
  designLabel: string;
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
  onOpenTemplates: () => void;
  onOpenGraphics: () => void;
  onAddText: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const stateKey = activeObject ? `object-${activeObject.id}` : multiSelectCount > 1 ? "multi" : "idle";

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto md:w-80 md:border-l md:border-border">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stateKey}
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          exit={reduceMotion ? undefined : "exit"}
          variants={PANEL_VARIANTS}
        >
          {activeObject ? (
            <ObjectControls active={activeObject} onUpdate={onUpdate} onDuplicate={onDuplicate} onDelete={onDelete} />
          ) : multiSelectCount > 1 ? (
            <MultiSelectControls count={multiSelectCount} onDuplicate={onDuplicate} onDelete={onDelete} />
          ) : (
            <IdleState
              designLabel={designLabel}
              onOpenTemplates={onOpenTemplates}
              onOpenGraphics={onOpenGraphics}
              onAddText={onAddText}
            />
          )}
        </motion.div>
      </AnimatePresence>
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
