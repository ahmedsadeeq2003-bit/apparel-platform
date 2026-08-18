import type { ArtworkDef } from "@/lib/editor/artwork";

/** Renders an ArtworkDef as a small SVG icon for panel grids -- a plain SVG
 * reading of the same shape data the Fabric insertion logic builds from, so
 * the thumbnail always matches what actually gets placed on the canvas. */
export function ArtworkThumbnail({ def, className = "" }: { def: ArtworkDef; className?: string }) {
  const { shape, defaultFill } = def;

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      {shape.kind === "rect" && <rect x="8" y="8" width="84" height="84" fill={defaultFill} />}
      {shape.kind === "circle" && <circle cx="50" cy="50" r="42" fill={defaultFill} />}
      {shape.kind === "triangle" && <polygon points="50,6 94,94 6,94" fill={defaultFill} />}
      {shape.kind === "polygon" && (
        <polygon points={shape.points.map((p) => `${p.x},${p.y}`).join(" ")} fill={defaultFill} />
      )}
      {shape.kind === "path" && <path d={shape.d} fill={defaultFill} />}
      {shape.kind === "group" &&
        shape.parts.map((part, i) =>
          part.kind === "circle" ? (
            <circle key={i} cx={part.cx} cy={part.cy} r={part.r} fill={part.fill ?? defaultFill} />
          ) : (
            <path key={i} d={part.d} fill={part.fill ?? defaultFill} />
          ),
        )}
    </svg>
  );
}
