import { describe, expect, it } from "vitest";
import { MAX_UPLOAD_BYTES } from "@/lib/editor/constants";
import { validateUpload } from "@/lib/editor/uploadValidation";

function fakeFile(type: string, size: number): File {
  return { type, size } as File;
}

describe("validateUpload", () => {
  it("accepts PNG, JPG, WebP, and SVG under the size limit", () => {
    for (const type of ["image/png", "image/jpeg", "image/webp", "image/svg+xml"]) {
      expect(validateUpload(fakeFile(type, 1024))).toEqual({ ok: true });
    }
  });

  it("rejects an unsupported file type", () => {
    const result = validateUpload(fakeFile("application/pdf", 1024));
    expect(result.ok).toBe(false);
  });

  it("rejects a file over the size limit", () => {
    const result = validateUpload(fakeFile("image/png", MAX_UPLOAD_BYTES + 1));
    expect(result.ok).toBe(false);
  });

  it("accepts a file exactly at the size limit", () => {
    expect(validateUpload(fakeFile("image/png", MAX_UPLOAD_BYTES))).toEqual({ ok: true });
  });
});
