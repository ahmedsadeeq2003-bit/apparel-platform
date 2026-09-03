"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/layout/Container";
import { MagneticButton } from "@/components/marketing/MagneticButton";
import { CampaignGarment } from "@/components/apparel/CampaignGarment";
import type { CustomerSubmission } from "@/components/marketing/FreshOffThePress";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * No public "customer designs" data source exists anywhere in this codebase
 * -- the `designs` table (src/lib/editor/actions.ts) stores private,
 * per-user saved designs with no opt-in-to-share flag and no public query,
 * matching FreshOffThePress's own documented reasoning on the homepage.
 * `submissions` is always `[]` from the page today; this section is built
 * to render real work the moment that data exists, but never fabricates a
 * customer, a design, or a handle to fill the gap in the meantime.
 */
const COPY = {
  public: {
    eyebrow: "Customer designs",
    heading: "See what others made.",
    emptyHeading: "Your design could be next.",
    emptyCopy: "No customer designs to show here yet -- be one of the first to make something and wear it.",
  },
  authenticated: {
    eyebrow: "Your designs",
    heading: "Your creative workspace.",
    emptyHeading: "This is where your designs will live.",
    emptyCopy: "Every design you save from the editor shows up here. Start your first one and it'll appear the moment you save it.",
  },
} as const;

export function CustomerDesignsSection({
  submissions,
  startDesigningHref = "/products",
  variant = "public",
  editorHrefFor,
}: {
  submissions: CustomerSubmission[];
  /** Where "Start designing" goes in the empty state -- /inspiration (no
   * prop passed) keeps its existing /products default; /design-hub passes
   * a real editor href instead, since a CTA living inside the Design Hub
   * page itself should never bounce back out to /products and skip the
   * editor it's meant to lead into. */
  startDesigningHref?: string;
  /** "public" (default, unchanged) is /inspiration's anonymous "customer
   * designs" gallery framing. "authenticated" is Design Hub's own saved
   * designs -- same layout/empty-state mechanics, copy reframed as the
   * signed-in customer's own workspace rather than other people's work. */
  variant?: "public" | "authenticated";
  /** Makes each non-empty-state card open that exact design for editing
   * (`/editor/new?designId=...`). Only ever passed for `variant:
   * "authenticated"` -- these are always the current user's OWN designs
   * there (RLS-scoped, see lib/editor/queries.ts's getMyDesigns), so
   * deep-linking into the editor is safe. /inspiration's `public` variant
   * never passes this: those submissions are, or will be, OTHER people's
   * opted-in work, which must never be deep-linkable into an editing
   * session -- RLS would block the load anyway (getDesignById only ever
   * returns the caller's own rows), but the card itself simply isn't a
   * link in that context, rather than relying on that as the only guard. */
  editorHrefFor?: (submission: CustomerSubmission) => string;
}) {
  const reduceMotion = useReducedMotion();
  const hasReal = submissions.length > 0;
  const copy = COPY[variant];

  return (
    <section id="customer-designs" className="scroll-mt-24 py-section">
      <Container>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-col gap-2"
        >
          <span className="text-label font-semibold uppercase tracking-[0.18em] text-accent">{copy.eyebrow}</span>
          <h2 className="font-display text-display-xl text-foreground">{copy.heading}</h2>
        </motion.div>

        {hasReal ? (
          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
            {submissions.slice(0, 8).map((submission) => {
              const preview = (
                <CampaignGarment
                  canvasJson={submission.canvasJson}
                  hex={submission.hex}
                  side={submission.side}
                  label={submission.designName}
                  className="w-full transition-transform duration-300 group-hover:scale-[1.02]"
                  shadowIntensity={0.9}
                />
              );
              return editorHrefFor ? (
                <Link
                  key={submission.id}
                  href={editorHrefFor(submission)}
                  aria-label={`Continue editing ${submission.designName}`}
                  className="group block"
                >
                  {preview}
                </Link>
              ) : (
                <div key={submission.id}>{preview}</div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.15, ease: EASE }}
            className="mt-12 flex flex-col items-center gap-6 rounded-sm border border-dashed border-border py-20 text-center"
          >
            <h3 className="font-display text-display-md text-foreground">{copy.emptyHeading}</h3>
            <p className="max-w-sm text-body text-muted">{copy.emptyCopy}</p>
            <MagneticButton
              href={startDesigningHref}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-7 text-body-sm font-semibold uppercase tracking-wide text-accent-foreground transition-opacity hover:opacity-90"
            >
              Start designing
            </MagneticButton>
          </motion.div>
        )}
      </Container>
    </section>
  );
}
