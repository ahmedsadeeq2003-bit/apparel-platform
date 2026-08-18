/**
 * Hand-authored shape/icon/graphic library for the Elements and Graphics
 * panels. Pure data -- no Fabric import here, so it stays testable and
 * usable from both the panel UI (thumbnail rendering) and the insertion
 * logic in useDesignEditor.ts. Every shape is vector (native Fabric
 * primitives or plain SVG path data), so everything stays fully editable
 * after insertion -- never a flattened image.
 */

export type ArtworkPart =
  | { kind: "path"; d: string; fill?: string }
  | { kind: "circle"; cx: number; cy: number; r: number; fill?: string };

export type ArtworkShape =
  | { kind: "rect" }
  | { kind: "circle" }
  | { kind: "triangle" }
  | { kind: "polygon"; points: { x: number; y: number }[] }
  | { kind: "path"; d: string }
  | { kind: "group"; parts: ArtworkPart[] };

export type ArtworkDef = {
  id: string;
  label: string;
  category: string;
  /** Group compositions with more than one visual tone (e.g. the smiley's
   * face vs. eyes) don't support a uniform recolor -- singles and
   * single-tone groups do. */
  recolorable: boolean;
  defaultFill: string;
  shape: ArtworkShape;
};

function star(points: number, outerR: number, innerR: number): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    result.push({ x: 50 + r * Math.cos(angle), y: 50 + r * Math.sin(angle) });
  }
  return result;
}

const BRUSH_STROKE_D =
  "M4 26c18-14 46-20 74-18 30 2 46 14 74 12 24-2 44-10 66-14-6 10-30 22-58 26-32 4-52-6-82-6-26 0-56 8-74 0z";

const SPRAY_BLOB_D =
  "M76 18c22-9 46 2 54 22 5 13 1 24-4 36 14-2 27 6 31 19 5 17-7 33-25 36-16 3-30-6-40-18-9 11-24 17-38 12-16-6-23-23-18-38-15 2-29-7-32-22-4-18 9-34 27-36 3-15 15-27 30-30 5-1 10-1 15 1z";

function halftoneRing(count: number, radius: number, r: number, offset: number): ArtworkPart[] {
  return Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * Math.PI * 2 + offset;
    return {
      kind: "circle" as const,
      cx: 100 + Math.cos(angle) * radius,
      cy: 100 + Math.sin(angle) * radius,
      r,
    };
  });
}

export const ELEMENTS: ArtworkDef[] = [
  { id: "el-circle", label: "Circle", category: "Shapes", recolorable: true, defaultFill: "#1b1815", shape: { kind: "circle" } },
  { id: "el-square", label: "Square", category: "Shapes", recolorable: true, defaultFill: "#1b1815", shape: { kind: "rect" } },
  { id: "el-triangle", label: "Triangle", category: "Shapes", recolorable: true, defaultFill: "#1b1815", shape: { kind: "triangle" } },
  { id: "el-star", label: "Star", category: "Stars", recolorable: true, defaultFill: "#c1623a", shape: { kind: "polygon", points: star(5, 48, 20) } },
  {
    id: "el-heart",
    label: "Heart",
    category: "Hearts",
    recolorable: true,
    defaultFill: "#c1623a",
    shape: { kind: "path", d: "M50,88 C10,60 -8,30 15,10 C30,-3 47,5 50,20 C53,5 70,-3 85,10 C108,30 90,60 50,88 Z" },
  },
  {
    id: "el-arrow",
    label: "Arrow",
    category: "Arrows",
    recolorable: true,
    defaultFill: "#1b1815",
    shape: { kind: "path", d: "M0,35 L60,35 L60,15 L100,50 L60,85 L60,65 L0,65 Z" },
  },
  {
    id: "el-flame",
    label: "Flame",
    category: "Flames",
    recolorable: true,
    defaultFill: "#c1623a",
    shape: { kind: "path", d: "M50,98 C25,98 12,80 15,58 C17,44 26,34 30,20 C31,34 38,30 38,18 C50,32 46,45 52,40 C60,33 58,20 58,10 C72,26 82,42 80,58 C88,66 85,84 70,92 C64,96 58,98 50,98 Z" },
  },
  {
    id: "el-crown",
    label: "Crown",
    category: "Crowns",
    recolorable: true,
    defaultFill: "#c1623a",
    shape: { kind: "path", d: "M5,70 L15,28 L35,50 L50,12 L65,50 L85,28 L95,70 L95,88 L5,88 Z" },
  },
  {
    id: "el-flower",
    label: "Flower",
    category: "Flowers",
    recolorable: true,
    defaultFill: "#8b9574",
    shape: {
      kind: "group",
      parts: [
        { kind: "circle", cx: 68, cy: 50, r: 13 },
        { kind: "circle", cx: 55.6, cy: 67.1, r: 13 },
        { kind: "circle", cx: 35.4, cy: 60.6, r: 13 },
        { kind: "circle", cx: 35.4, cy: 39.4, r: 13 },
        { kind: "circle", cx: 55.6, cy: 32.9, r: 13 },
        { kind: "circle", cx: 50, cy: 50, r: 9 },
      ],
    },
  },
  {
    id: "el-smiley",
    label: "Smiley",
    category: "Smiley faces",
    recolorable: false,
    defaultFill: "#f2c14e",
    shape: {
      kind: "group",
      parts: [
        { kind: "circle", cx: 50, cy: 50, r: 48 },
        { kind: "circle", cx: 35, cy: 42, r: 6, fill: "#1b1815" },
        { kind: "circle", cx: 65, cy: 42, r: 6, fill: "#1b1815" },
        { kind: "path", d: "M30,58 C40,72 60,72 70,58 C60,66 40,66 30,58 Z", fill: "#1b1815" },
      ],
    },
  },
  {
    id: "el-doodle",
    label: "Brush mark",
    category: "Hand-drawn elements",
    recolorable: true,
    defaultFill: "#1b1815",
    shape: { kind: "path", d: BRUSH_STROKE_D },
  },
  {
    id: "el-line",
    label: "Decorative line",
    category: "Decorative lines",
    recolorable: true,
    defaultFill: "#1b1815",
    shape: { kind: "path", d: "M0,45 C30,30 70,60 100,45 L100,55 C70,70 30,40 0,55 Z" },
  },
  {
    id: "el-abstract",
    label: "Abstract mark",
    category: "Abstract marks",
    recolorable: true,
    defaultFill: "#6e5c4c",
    shape: { kind: "path", d: "M20,80 C-5,55 5,20 35,10 C60,2 90,15 92,40 C94,62 70,65 60,50 C50,35 30,45 32,62 C33,72 45,75 50,68" },
  },
];

export const GRAPHICS: ArtworkDef[] = [
  {
    id: "gfx-streetwear",
    label: "Lightning bolt",
    category: "Streetwear",
    recolorable: true,
    defaultFill: "#1b1815",
    shape: { kind: "path", d: "M60,0 L20,55 L45,55 L30,100 L85,40 L55,40 Z" },
  },
  {
    id: "gfx-illustration",
    label: "Mountain badge",
    category: "Illustration",
    recolorable: false,
    defaultFill: "#6e5c4c",
    shape: {
      kind: "group",
      parts: [
        { kind: "circle", cx: 78, cy: 22, r: 12 },
        { kind: "path", d: "M0,90 L35,30 L55,60 L70,40 L100,90 Z" },
      ],
    },
  },
  {
    id: "gfx-graffiti",
    label: "Spray splatter",
    category: "Graffiti",
    recolorable: true,
    defaultFill: "#c1623a",
    shape: {
      kind: "group",
      parts: [
        { kind: "path", d: SPRAY_BLOB_D },
        { kind: "circle", cx: 168, cy: 34, r: 7 },
        { kind: "circle", cx: 182, cy: 58, r: 4 },
        { kind: "circle", cx: 18, cy: 150, r: 6 },
        { kind: "circle", cx: 34, cy: 172, r: 3.5 },
        { kind: "circle", cx: 150, cy: 176, r: 5 },
        { kind: "circle", cx: 10, cy: 70, r: 3 },
      ],
    },
  },
  {
    id: "gfx-abstract",
    label: "Halftone burst",
    category: "Abstract",
    recolorable: true,
    defaultFill: "#1b1815",
    shape: {
      kind: "group",
      parts: [
        ...halftoneRing(6, 14, 3, 0),
        ...halftoneRing(10, 34, 4.5, 0.3),
        ...halftoneRing(14, 56, 6, 0.6),
        ...halftoneRing(18, 80, 7.5, 0.9),
      ],
    },
  },
  {
    id: "gfx-retro",
    label: "Sunburst badge",
    category: "Retro",
    recolorable: true,
    defaultFill: "#c1623a",
    shape: { kind: "polygon", points: star(12, 50, 32) },
  },
  {
    id: "gfx-minimal",
    label: "Three dots",
    category: "Minimal",
    recolorable: true,
    defaultFill: "#1b1815",
    shape: {
      kind: "group",
      parts: [
        { kind: "circle", cx: 20, cy: 50, r: 9 },
        { kind: "circle", cx: 50, cy: 50, r: 9 },
        { kind: "circle", cx: 80, cy: 50, r: 9 },
      ],
    },
  },
  {
    id: "gfx-sports",
    label: "Shield badge",
    category: "Sports",
    recolorable: true,
    defaultFill: "#3f4a3d",
    shape: { kind: "path", d: "M50,0 L95,20 L95,58 C95,84 75,98 50,100 C25,98 5,84 5,58 L5,20 Z" },
  },
  {
    id: "gfx-music",
    label: "Music note",
    category: "Music",
    recolorable: true,
    defaultFill: "#1b1815",
    shape: {
      kind: "group",
      parts: [
        { kind: "circle", cx: 25, cy: 78, r: 14 },
        { kind: "path", d: "M37,78 L37,8 L62,18 L62,34 L37,26 Z" },
      ],
    },
  },
  {
    id: "gfx-lifestyle",
    label: "Leaf mark",
    category: "Lifestyle",
    recolorable: true,
    defaultFill: "#8b9574",
    shape: { kind: "path", d: "M50,95 C15,72 5,30 50,3 C95,30 85,72 50,95 Z" },
  },
];
