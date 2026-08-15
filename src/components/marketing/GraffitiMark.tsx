/**
 * Hand-drawn decorative marks — spray-paint splatter, halftone burst, and a
 * marker-scribble underline. Pure SVG, `currentColor`-driven so callers set
 * tone/opacity via className (e.g. `text-accent/60`). Purely ornamental.
 */

export function SpraySplatter({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 200" className={className} fill="currentColor">
      <path d="M76 18c22-9 46 2 54 22 5 13 1 24-4 36 14-2 27 6 31 19 5 17-7 33-25 36-16 3-30-6-40-18-9 11-24 17-38 12-16-6-23-23-18-38-15 2-29-7-32-22-4-18 9-34 27-36 3-15 15-27 30-30 5-1 10-1 15 1z" />
      <circle cx="168" cy="34" r="7" />
      <circle cx="182" cy="58" r="4" />
      <circle cx="18" cy="150" r="6" />
      <circle cx="34" cy="172" r="3.5" />
      <circle cx="150" cy="176" r="5" />
      <circle cx="10" cy="70" r="3" />
    </svg>
  );
}

export function HalftoneBurst({ className = "" }: { className?: string }) {
  const rings = [
    { r: 3, count: 6, radius: 14 },
    { r: 4.5, count: 10, radius: 34 },
    { r: 6, count: 14, radius: 56 },
    { r: 7.5, count: 18, radius: 80 },
  ];

  return (
    <svg aria-hidden viewBox="0 0 200 200" className={className} fill="currentColor">
      {rings.flatMap((ring, ringIndex) =>
        Array.from({ length: ring.count }).map((_, i) => {
          const angle = (i / ring.count) * Math.PI * 2 + ringIndex * 0.3;
          const cx = 100 + Math.cos(angle) * ring.radius;
          const cy = 100 + Math.sin(angle) * ring.radius;
          return (
            <circle
              key={`${ringIndex}-${i}`}
              cx={cx}
              cy={cy}
              r={ring.r}
              opacity={1 - ringIndex * 0.18}
            />
          );
        }),
      )}
    </svg>
  );
}

export function ScribbleUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 300 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={7}
      strokeLinecap="round"
    >
      <path d="M6 20C60 8 140 6 168 14C196 22 240 6 294 12" />
    </svg>
  );
}
