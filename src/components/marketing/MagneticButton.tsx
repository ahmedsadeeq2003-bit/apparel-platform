"use client";

import Link from "next/link";
import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/** A CTA that leans toward the cursor within its own bounds -- the
 * "magnetic button" interaction. Desktop-only by construction: it only ever
 * moves in response to a real `mousemove` over the element, which touch
 * input never dispatches, so no separate touch-detection branch is needed.
 * Disabled outright under reduced motion (renders a static link). */
export function MagneticButton({
  href,
  children,
  className = "",
  style,
  strength = 0.35,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  strength?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  if (reduceMotion) {
    return (
      <Link href={href} className={className} style={style}>
        {children}
      </Link>
    );
  }

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    x.set((e.clientX - (bounds.left + bounds.width / 2)) * strength);
    y.set((e.clientY - (bounds.top + bounds.height / 2)) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div style={{ x: springX, y: springY, display: "inline-block" }}>
      <Link
        ref={ref}
        href={href}
        className={className}
        style={style}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </Link>
    </motion.div>
  );
}
