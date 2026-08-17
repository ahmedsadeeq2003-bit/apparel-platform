"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CampaignGarment } from "@/components/apparel/CampaignGarment";

const EASE = [0.16, 1, 0.3, 1] as const;

/** A design a customer opted in to share at checkout ("Show my design in
 * Fresh Off the Press"). Deliberately has no name/photo field -- this
 * section shows the design, never the person, since no opt-in identity
 * capture exists yet and none should be invented. Checkout doesn't write
 * these yet, so `submissions` is always [] for now; the empty-state
 * fallback below stands in until it does. */
export type CustomerSubmission = {
  id: string;
  canvasJson: object;
  hex: string;
  side: "front" | "back";
  designName: string;
};

const ROTATIONS = [-4, 3, -2, 5, -3, 2] as const;
const LIFTS = ["0.5rem", "-1rem", "1.5rem", "-0.5rem", "1rem", "-1.5rem"] as const;

type GalleryItem = { canvasJson: object; hex: string; side: "front" | "back"; designName: string; key: string };

/** The runway itself -- the track's horizontal position is tied to how far
 * the section has scrolled through the viewport (the same technique
 * WhatIsStitch's crossing mark uses), so normal vertical scrolling reads as
 * the gallery drifting past like a runway. Cards overlap and sit at
 * alternating heights/rotations, exhibition-style, and reveal category/name
 * only on hover. Reduced motion gets the plain static grid below instead.
 *
 * A `position: sticky` pin (so the section holds still while the track
 * slides) was the first approach, but `<main>` carries a page-wide
 * `overflow-x-hidden` (guarding against unrelated full-bleed decoration
 * elsewhere on the page) -- any ancestor with non-visible overflow breaks
 * `sticky` for everything inside it, which is a much bigger, page-wide
 * change to take on just for this one section. This scroll-tied (not
 * scroll-pinned) version delivers the same "gallery moves horizontally as
 * you scroll" idea without touching that.
 *
 * The horizontal shift is computed in real pixels from the track's actual
 * scrollWidth vs. the visible viewport width (measured via ResizeObserver),
 * not a guessed percentage -- a fixed percentage of the track's own width
 * has no way to know how much wider than the viewport that track actually
 * is, so it either stops short of the last card or overshoots into empty
 * space past it, depending on item count and screen width. */
function Runway({ items, showingReal }: { items: GalleryItem[]; showingReal: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxShift, setMaxShift] = useState(0);

  useEffect(() => {
    const measure = () => {
      const viewportWidth = viewportRef.current?.clientWidth ?? 0;
      const trackWidth = trackRef.current?.scrollWidth ?? 0;
      setMaxShift(Math.max(0, trackWidth - viewportWidth));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (trackRef.current) observer.observe(trackRef.current);
    if (viewportRef.current) observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, [items.length]);

  const { scrollYProgress } = useScroll({ target: viewportRef, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -maxShift]);

  return (
    <div ref={viewportRef} className="relative flex items-center overflow-hidden py-6">
      <motion.div ref={trackRef} className="flex items-center gap-8 pl-6" style={{ x }}>
        {items.map((item, index) => (
          <motion.div
            key={item.key}
            className="group flex w-[64vw] shrink-0 flex-col items-center gap-4 sm:w-[38vw] md:w-[26vw] lg:w-[20vw]"
            style={{ transform: `translateY(${LIFTS[index % LIFTS.length]}) rotate(${ROTATIONS[index % ROTATIONS.length]}deg)` }}
            whileHover={{ scale: 1.04, rotate: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="relative w-full overflow-visible">
              <CampaignGarment
                canvasJson={item.canvasJson}
                hex={item.hex}
                side={item.side}
                label={item.designName}
                className="w-full"
                shadowIntensity={1.1}
              />
            </div>
            <div className="flex flex-col items-center gap-1 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <p className="text-body-sm font-medium text-foreground">{item.designName}</p>
              {!showingReal && (
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.08em] text-muted">
                  From the STITCH library
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function StaticGrid({ items, showingReal }: { items: GalleryItem[]; showingReal: boolean }) {
  return (
    <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4">
      {items.map((item, index) => (
        <div key={item.key} className="flex flex-col items-center gap-3">
          <CampaignGarment
            canvasJson={item.canvasJson}
            hex={item.hex}
            side={item.side}
            label={item.designName}
            className="w-full max-w-[180px]"
            style={{ transform: `rotate(${ROTATIONS[index % ROTATIONS.length]}deg)` }}
            shadowIntensity={0.8}
          />
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-body-sm font-medium text-foreground">{item.designName}</p>
            {!showingReal && (
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.08em] text-muted">
                From the STITCH library
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function FreshOffThePress({
  submissions,
  fallback,
}: {
  submissions: CustomerSubmission[];
  fallback: { canvasJson: object; hex: string; side: "front" | "back"; label: string; designName: string }[];
}) {
  const reduceMotion = useReducedMotion();
  const showingReal = submissions.length > 0;
  const raw = showingReal ? submissions : fallback;
  const items: GalleryItem[] = raw
    .slice(0, 6)
    .map((item) => ({
      key: "id" in item ? item.id : item.designName,
      canvasJson: item.canvasJson,
      hex: item.hex,
      side: item.side,
      designName: item.designName,
    }));

  if (items.length === 0) return null;

  return (
    <Section>
      <Container>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <span className="text-label font-semibold uppercase tracking-[0.18em] text-muted">
            Fresh off the press
          </span>
          <h2 className="mt-3 font-display text-display-xl text-foreground">
            Made by STITCH Customers
          </h2>
          <p className="mt-2 max-w-md text-body-lg text-muted">
            {showingReal
              ? "Real designs, shared by the people who made them."
              : "Customers will soon be able to share their finished designs here. Until then, here's a taste from the STITCH library."}
          </p>
        </motion.div>
      </Container>

      {reduceMotion ? (
        <Container>
          <StaticGrid items={items} showingReal={showingReal} />
        </Container>
      ) : (
        <Runway items={items} showingReal={showingReal} />
      )}
    </Section>
  );
}
