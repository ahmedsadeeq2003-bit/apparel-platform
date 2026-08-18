"use client";

import { useMemo, useRef, useState } from "react";
import { UploadSimple } from "@phosphor-icons/react";
import { ArtworkThumbnail } from "@/components/editor/ArtworkThumbnail";
import { ELEMENTS, GRAPHICS, type ArtworkDef } from "@/lib/editor/artwork";
import { designAssets, templateAssets, type AssetEntry, type DesignCategory } from "@/lib/assets/manifest";
import type { DesignTemplate, TemplateCategory } from "@/lib/templates/queries";
import type { EditorTool } from "@/lib/editor/store";

function groupByCategory(items: ArtworkDef[]): Map<string, ArtworkDef[]> {
  const groups = new Map<string, ArtworkDef[]>();
  for (const item of items) {
    const list = groups.get(item.category) ?? [];
    list.push(item);
    groups.set(item.category, list);
  }
  return groups;
}

function ArtworkGrid({ items, onInsert }: { items: ArtworkDef[]; onInsert: (def: ArtworkDef) => void }) {
  const groups = useMemo(() => groupByCategory(items), [items]);

  return (
    <div className="flex flex-col gap-6">
      {Array.from(groups.entries()).map(([category, defs]) => (
        <div key={category}>
          <h3 className="text-body-sm font-semibold text-foreground">{category}</h3>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {defs.map((def) => (
              <button
                key={def.id}
                type="button"
                onClick={() => onInsert(def)}
                aria-label={`Add ${def.label}`}
                title={def.label}
                className="flex aspect-square items-center justify-center rounded-sm border border-border bg-surface p-3 transition-colors hover:border-accent"
              >
                <ArtworkThumbnail def={def} className="h-full w-full" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const DESIGN_CATEGORY_LABELS: Record<DesignCategory, string> = {
  typography: "Typography",
  graffiti: "Graffiti",
  illustration: "Illustration",
  abstract: "Abstract",
  minimal: "Minimal",
  "graphic-art": "Graphic Art",
};

/** The externally generated STITCH artwork-library SVGs (public/assets/
 * designs/**), grouped by category from the manifest. Rendered via plain
 * `<img>` (browsers treat an `<img src="*.svg">` as a static raster/vector
 * image and never execute markup inside it -- the safe way to preview an
 * untrusted-by-default SVG) rather than inlining the SVG markup. */
function AssetLibraryGrid({ onInsert }: { onInsert: (path: string) => void }) {
  const categories = Object.keys(designAssets) as DesignCategory[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-body-sm font-semibold text-foreground">STITCH Artwork Library</h3>
        <p className="mt-1 text-[0.7rem] text-muted">
          {Object.values(designAssets).reduce((n, list) => n + list.length, 0)} pieces, ready to place and recolor.
        </p>
      </div>
      {categories.map((category) => {
        const items = designAssets[category];
        if (items.length === 0) return null;
        return (
          <div key={category}>
            <h4 className="text-body-sm font-semibold text-foreground">{DESIGN_CATEGORY_LABELS[category]}</h4>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onInsert(item.path)}
                  aria-label={`Add ${item.name}`}
                  title={item.name}
                  className="flex aspect-square items-center justify-center rounded-sm border border-border bg-surface p-3 transition-colors hover:border-accent"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- static SVG asset, no next/image optimization needed for a fixed-size local vector */}
                  <img src={item.path} alt={item.name} className="h-full w-full object-contain" draggable={false} />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TemplatesPanel({
  groups,
  onApply,
}: {
  groups: { category: TemplateCategory; templates: DesignTemplate[] }[];
  onApply: (template: DesignTemplate) => void;
}) {
  if (groups.length === 0) {
    return <p className="text-body-sm text-muted">No templates available right now.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ category, templates }) => (
        <div key={category.id}>
          <h3 className="text-body-sm font-semibold text-foreground">{category.name}</h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => onApply(template)}
                className="flex flex-col gap-2 rounded-sm border border-border bg-surface p-3 text-left transition-colors hover:border-accent"
              >
                <span className="text-body-sm font-medium text-foreground">{template.name}</span>
                <span className="text-[0.7rem] text-muted">
                  {template.print_area === "front_and_back" ? "Front + back" : template.design_type.replace(/_/g, " ")}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The externally generated STITCH templates (public/assets/templates/**),
 * applied through `applyGeneratedTemplate` (a separate loader from the
 * DB-backed `applyTemplate` above -- see useDesignEditor.ts). Shown as its
 * own grouped section rather than merged into `groups` above, since these
 * aren't `DesignTemplate` rows and don't have a live canvas_json preview to
 * render from without fetching first. */
function GeneratedTemplatesPanel({ onApply }: { onApply: (path: string) => void }) {
  const categories = Object.keys(templateAssets) as (keyof typeof templateAssets)[];

  return (
    <div className="mt-8 flex flex-col gap-6 border-t border-border pt-6">
      <h3 className="text-body-sm font-semibold text-foreground">STITCH Template Library</h3>
      {categories.map((category) => {
        const items: AssetEntry[] = templateAssets[category];
        if (items.length === 0) return null;
        return (
          <div key={category}>
            <h4 className="text-body-sm font-semibold text-foreground">{DESIGN_CATEGORY_LABELS[category]}</h4>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onApply(item.path)}
                  className="flex flex-col gap-2 rounded-sm border border-border bg-surface p-3 text-left transition-colors hover:border-accent"
                >
                  <span className="text-body-sm font-medium text-foreground">{item.name}</span>
                  <span className="text-[0.7rem] text-muted">Front print</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UploadPanel({ onUpload }: { onUpload: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onUpload(file);
      }}
      className={`flex flex-col items-center gap-3 rounded-sm border-2 border-dashed p-8 text-center transition-colors ${
        isDragging ? "border-accent bg-surface" : "border-border"
      }`}
    >
      <UploadSimple size={28} className="text-muted" />
      <p className="text-body-sm text-muted">Drag an image here, or</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-full border border-border px-4 py-2 text-body-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
      >
        Choose a file
      </button>
      <p className="text-[0.7rem] text-muted">PNG, JPG or WebP</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function ToolPanel({
  activeTool,
  templateGroups,
  onApplyTemplate,
  onApplyGeneratedTemplate,
  onInsertArtwork,
  onInsertSvgAsset,
  onUpload,
  onClose,
}: {
  activeTool: EditorTool;
  templateGroups: { category: TemplateCategory; templates: DesignTemplate[] }[];
  onApplyTemplate: (template: DesignTemplate) => void;
  onApplyGeneratedTemplate: (path: string) => void;
  onInsertArtwork: (def: ArtworkDef) => void;
  onInsertSvgAsset: (path: string) => void;
  onUpload: (file: File) => void;
  onClose: () => void;
}) {
  if (!activeTool) return null;

  const titles: Record<Exclude<EditorTool, null>, string> = {
    templates: "Templates",
    elements: "Elements",
    graphics: "Graphics",
    upload: "Upload",
  };

  return (
    <div className="flex h-full w-full flex-col md:w-72">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
        <span className="text-body-sm font-semibold text-foreground">{titles[activeTool]}</span>
        <button type="button" onClick={onClose} className="text-body-sm text-muted">
          Close
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {activeTool === "templates" && (
          <>
            <TemplatesPanel groups={templateGroups} onApply={onApplyTemplate} />
            <GeneratedTemplatesPanel onApply={onApplyGeneratedTemplate} />
          </>
        )}
        {activeTool === "elements" && <ArtworkGrid items={ELEMENTS} onInsert={onInsertArtwork} />}
        {activeTool === "graphics" && (
          <>
            <ArtworkGrid items={GRAPHICS} onInsert={onInsertArtwork} />
            <div className="mt-8 border-t border-border pt-6">
              <AssetLibraryGrid onInsert={onInsertSvgAsset} />
            </div>
          </>
        )}
        {activeTool === "upload" && <UploadPanel onUpload={onUpload} />}
      </div>
    </div>
  );
}
