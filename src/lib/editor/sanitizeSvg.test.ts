// @vitest-environment jsdom
//
// DOMPurify needs a real DOM (window/document) to operate -- the rest of
// this project's tests run under vitest's default "node" environment (see
// vitest.config.ts), so this one file opts into jsdom via the directive
// above rather than changing the global test environment for everything
// else. The production code (sanitizeSvg.ts) makes no such distinction --
// it always runs in the browser, where `window` is already the real thing.

import { describe, expect, it } from "vitest";
import { sanitizeSvgMarkup } from "./sanitizeSvg";

describe("sanitizeSvgMarkup", () => {
  it("preserves legitimate shapes, fills, and strokes", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M 10,10 L 90,90" fill="#ff0000" stroke="#000000" stroke-width="4"/>
      <circle cx="50" cy="50" r="20" fill="#00ff00" opacity="0.5"/>
    </svg>`;
    const clean = sanitizeSvgMarkup(svg);
    expect(clean).not.toBeNull();
    expect(clean).toContain("path");
    expect(clean).toContain("circle");
    expect(clean).toContain("#ff0000");
    expect(clean).toContain("stroke-width");
  });

  it("strips a <script> tag entirely", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><script>alert(document.cookie)</script><rect width="10" height="10"/></svg>`;
    const clean = sanitizeSvgMarkup(svg);
    expect(clean).not.toBeNull();
    expect(clean?.toLowerCase()).not.toContain("<script");
    expect(clean?.toLowerCase()).not.toContain("alert(");
    expect(clean).toContain("rect");
  });

  it("strips an onload/onclick event-handler attribute", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><rect width="10" height="10" onclick="alert(2)"/></svg>`;
    const clean = sanitizeSvgMarkup(svg);
    expect(clean).not.toBeNull();
    expect(clean?.toLowerCase()).not.toContain("onload");
    expect(clean?.toLowerCase()).not.toContain("onclick");
    expect(clean).toContain("rect");
  });

  it("strips a javascript: URI", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><rect width="10" height="10"/></a></svg>`;
    const clean = sanitizeSvgMarkup(svg);
    expect(clean).not.toBeNull();
    expect(clean?.toLowerCase()).not.toContain("javascript:");
  });

  it("strips foreignObject content", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><div>hi</div></foreignObject><rect width="10" height="10"/></svg>`;
    const clean = sanitizeSvgMarkup(svg);
    expect(clean).not.toBeNull();
    expect(clean?.toLowerCase()).not.toContain("foreignobject");
    expect(clean).toContain("rect");
  });

  it("strips an external href on a <use>/<image> element", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><image href="https://evil.example.com/track.png" width="1" height="1"/><rect width="10" height="10"/></svg>`;
    const clean = sanitizeSvgMarkup(svg);
    expect(clean).not.toBeNull();
    expect(clean).not.toContain("evil.example.com");
  });

  it("keeps a same-document fragment href on <use> (a legitimate internal reference)", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><defs><path id="p1" d="M0,0 L1,1"/></defs><use href="#p1"/></svg>`;
    const clean = sanitizeSvgMarkup(svg);
    expect(clean).not.toBeNull();
    expect(clean).toContain('href="#p1"');
  });

  it("keeps a data: URI href on <image> (an embedded raster, common in real exports)", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><image href="data:image/png;base64,AAAA" width="10" height="10"/></svg>`;
    const clean = sanitizeSvgMarkup(svg);
    expect(clean).not.toBeNull();
    expect(clean).toContain("data:image/png");
  });

  it("returns null for markup with no real <svg> root after sanitization", () => {
    expect(sanitizeSvgMarkup("<script>alert(1)</script>")).toBeNull();
    expect(sanitizeSvgMarkup("")).toBeNull();
    expect(sanitizeSvgMarkup("not svg at all")).toBeNull();
  });
});
