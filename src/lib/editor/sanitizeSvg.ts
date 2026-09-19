import DOMPurify from "dompurify";

/**
 * Sanitizes customer-uploaded SVG markup before it's parsed into Fabric
 * objects (see useDesignEditor.ts's addImageFromFile). This is the one SVG
 * path in the app that carries genuinely untrusted input -- the artwork
 * library's own bundled SVGs (public/assets/designs/**) are STITCH's own
 * hand-authored files and never run through this.
 *
 * Uses DOMPurify's dedicated SVG profile rather than a homemade regex/
 * string scan (which can't reliably parse XML, and is exactly what we were
 * told not to build): it strips <script>, every on*="" event-handler
 * attribute, and javascript:-scheme URIs as part of its own well-tested
 * allowlist. FORBID_TAGS below is belt-and-suspenders on top of that
 * default behavior, not a replacement for it. The uponSanitizeAttribute
 * hook adds one further restriction DOMPurify doesn't apply out of the box:
 * <use>/<image> stay allowed (both appear in legitimate design-tool SVG
 * exports), but any href/xlink:href on them that isn't a same-document
 * fragment (#id) or an inline data: URI is stripped, so an uploaded SVG
 * can't be used to fetch or fingerprint an external URL.
 */
const EXTERNAL_HREF_ATTRS = new Set(["href", "xlink:href"]);

function stripExternalHref(_node: Element, data: { attrName: string; attrValue: string; keepAttr: boolean }) {
  if (!EXTERNAL_HREF_ATTRS.has(data.attrName.toLowerCase())) return;
  const value = data.attrValue.trim();
  if (value.startsWith("#") || value.startsWith("data:")) return;
  data.keepAttr = false;
}

/**
 * Returns the sanitized SVG markup, or `null` if sanitization stripped it
 * down to nothing renderable (e.g. the upload was entirely a <script> with
 * no real shapes) -- callers should treat that the same as loadSVGFromString
 * resolving zero objects.
 */
export function sanitizeSvgMarkup(rawSvgText: string): string | null {
  DOMPurify.addHook("uponSanitizeAttribute", stripExternalHref);
  let clean: string;
  try {
    clean = DOMPurify.sanitize(rawSvgText, {
      USE_PROFILES: { svg: true, svgFilters: true },
      // <use> isn't part of DOMPurify's default SVG profile (verified: it
      // strips the whole element, not just an attribute), but it's a
      // common, legitimate feature of real design-tool SVG exports
      // (referencing a shared <defs> shape) -- allowed back in here, with
      // the uponSanitizeAttribute hook below still restricting its href to
      // a same-document fragment or a data: URI, same as <image>.
      ADD_TAGS: ["use"],
      FORBID_TAGS: ["script", "foreignObject"],
      FORBID_ATTR: ["onload", "onerror", "onclick", "onmouseover"],
    });
  } finally {
    DOMPurify.removeHook("uponSanitizeAttribute");
  }

  const trimmed = clean.trim();
  if (!trimmed || !/<svg[\s>]/i.test(trimmed)) return null;
  return trimmed;
}
