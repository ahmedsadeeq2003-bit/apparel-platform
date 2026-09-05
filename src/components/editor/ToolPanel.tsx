"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowRight, MagnifyingGlass, UploadSimple, X } from "@phosphor-icons/react";
import { ArtworkThumbnail } from "@/components/editor/ArtworkThumbnail";
import { CampaignGarment } from "@/components/apparel/CampaignGarment";
import { EDITORIAL_GARMENT_COLORS } from "@/lib/templates/garmentColors";
import { ELEMENTS, GRAPHICS, type ArtworkDef } from "@/lib/editor/artwork";
import type { DesignCategory } from "@/lib/assets/manifest";
import {
  ALL_ARTWORK,
  ARTWORK_CATEGORIES,
  ARTWORK_CATEGORY_LABELS,
  filterArtwork,
} from "@/lib/assets/artworkSearch";
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
                aria-label={`Add ${def.label} to your design`}
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

/** The real 67-piece STITCH artwork library (public/assets/designs/**),
 * browsable and searchable via the exact same data/filter logic
 * ArtworkLibrary (Design Hub/Inspiration) already uses -- ALL_ARTWORK +
 * filterArtwork from lib/assets/artworkSearch.ts, not a second reading of
 * the manifest -- so search parity between the editor's own panel and the
 * external library isn't a second implementation to keep in sync.
 * Rendered via plain `<img>` (browsers treat an `<img src="*.svg">` as a
 * static raster/vector image and never execute markup inside it -- the
 * safe way to preview an untrusted-by-default SVG) rather than inlining
 * the SVG markup. */
function AssetLibraryGrid({ onInsert }: { onInsert: (path: string) => void }) {
  const [category, setCategory] = useState<DesignCategory | "all">("all");
  const [query, setQuery] = useState("");
  const results = useMemo(() => filterArtwork(ALL_ARTWORK, { category, query }), [category, query]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-body-sm font-semibold text-foreground">STITCH Artwork Library</h3>
        <p className="mt-1 text-[0.7rem] text-muted">{ALL_ARTWORK.length} pieces, ready to place and recolor.</p>
      </div>

      <label className="relative flex items-center">
        <span className="sr-only">Search artwork by name or category</span>
        <MagnifyingGlass size={14} className="pointer-events-none absolute left-3 text-muted" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artwork..."
          className="h-9 w-full rounded-full border border-border bg-surface pl-9 pr-8 text-body-sm text-foreground outline-none transition-colors placeholder:text-muted focus-visible:border-accent"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2.5 flex h-5 w-5 items-center justify-center text-muted hover:text-foreground"
          >
            <X size={12} weight="bold" />
          </button>
        )}
      </label>

      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
        <button
          type="button"
          onClick={() => setCategory("all")}
          aria-pressed={category === "all"}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-[0.7rem] font-medium uppercase tracking-wide transition-colors ${
            category === "all" ? "border-foreground bg-foreground text-background" : "border-border text-muted hover:text-foreground"
          }`}
        >
          All
        </button>
        {ARTWORK_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[0.7rem] font-medium uppercase tracking-wide transition-colors ${
              category === c ? "border-foreground bg-foreground text-background" : "border-border text-muted hover:text-foreground"
            }`}
          >
            {ARTWORK_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onInsert(item.path)}
              aria-label={`Add ${item.name} to your design`}
              title={item.name}
              className="flex aspect-square items-center justify-center rounded-sm border border-border bg-surface p-3 transition-colors hover:border-accent"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static SVG asset, no next/image optimization needed for a fixed-size local vector */}
              <img src={item.path} alt={item.name} className="h-full w-full object-contain" draggable={false} />
            </button>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-body-sm text-muted">Nothing matches &ldquo;{query}&rdquo;.</p>
      )}
    </div>
  );
}

/**
 * The DB-backed `design_templates` system, previewed here exactly the way
 * TemplatesShowcase already previews it on Design Hub/Inspiration -- a real
 * CampaignGarment composite (real garment photo + the template's actual
 * canvas_json + the same curated-color resolution, EDITORIAL_GARMENT_COLORS)
 * rather than a text-only row. A customer opening this panel mid-session
 * should see the same "this is a real shirt design" language they already
 * saw browsing templates outside the editor, not a plainer, second
 * representation of the same content. "Editable template" + "Customize"
 * make explicit that clicking loads a real, still-editable composition --
 * distinct from the Graphics panel's "Add to design" for a single artwork
 * piece (see ArtworkGrid/AssetLibraryGrid below).
 */
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
                aria-label={`Customize ${template.name}`}
                className="group flex flex-col gap-2 rounded-sm border border-border bg-surface p-2 text-left transition-colors hover:border-accent"
              >
                <div className="relative overflow-hidden rounded-[2px] bg-background">
                  <CampaignGarment
                    canvasJson={template.canvas_json}
                    hex={EDITORIAL_GARMENT_COLORS[category.slug] ?? "#EDEADF"}
                    side={template.print_area === "back" ? "back" : "front"}
                    label={`${template.name}, ${category.name} template`}
                    className="w-full transition-transform duration-300 group-hover:scale-[1.03]"
                    shadowIntensity={0.5}
                  />
                </div>
                <div className="flex flex-col gap-0.5 px-0.5">
                  <span className="truncate text-body-sm font-medium text-foreground">{template.name}</span>
                  <span className="flex items-center gap-1 text-[0.65rem] font-medium text-muted transition-colors group-hover:text-accent">
                    Customize
                    <ArrowRight size={10} weight="bold" aria-hidden />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
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
  onInsertArtwork,
  onInsertSvgAsset,
  onUpload,
  onClose,
}: {
  activeTool: EditorTool;
  templateGroups: { category: TemplateCategory; templates: DesignTemplate[] }[];
  onApplyTemplate: (template: DesignTemplate) => void;
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
        {activeTool === "templates" && <TemplatesPanel groups={templateGroups} onApply={onApplyTemplate} />}
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
