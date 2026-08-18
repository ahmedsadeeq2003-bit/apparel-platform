/** The generated templates (public/assets/templates/**) express `letterSpacing`
 * as a CSS-style absolute value in the same design-space units as `fontSize`
 * (e.g. fontSize 130, letterSpacing 8 -- the same mental model as CSS
 * `letter-spacing: 8px` on a 130px font). Fabric's `charSpacing` instead is
 * unitless: thousandths of an em, i.e. resolution-independent of fontSize.
 * Converting by their ratio (rather than passing the raw value through, or
 * scaling it like `left`/`top`) is what makes the tracking visually match
 * the template regardless of the editor's canvas scale, since it's already
 * relative to type size, not to the template's design canvas. */
export function toCharSpacing(letterSpacing: number | undefined, fontSize: number): number {
  if (!letterSpacing || fontSize <= 0) return 0;
  return Math.round((letterSpacing / fontSize) * 1000);
}
