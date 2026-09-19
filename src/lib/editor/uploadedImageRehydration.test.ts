import { describe, expect, it } from "vitest";
import { collectSourcePaths, withRefreshedImageSources } from "./uploadedImageRehydration";

const IMAGE_OBJECT = { type: "image", src: "https://storage.example/old-signed-url", sourcePath: "user-1/abc.png" };
const TEXT_OBJECT = { type: "i-text", text: "Hello" };

describe("collectSourcePaths", () => {
  it("returns an empty array for null or a design with no uploaded images", () => {
    expect(collectSourcePaths(null)).toEqual([]);
    expect(collectSourcePaths({ objects: [TEXT_OBJECT] })).toEqual([]);
  });

  it("finds a sourcePath on a top-level object", () => {
    expect(collectSourcePaths({ objects: [TEXT_OBJECT, IMAGE_OBJECT] })).toEqual(["user-1/abc.png"]);
  });

  it("finds sourcePaths nested inside a Group's own objects array", () => {
    const grouped = { objects: [{ type: "group", objects: [IMAGE_OBJECT, TEXT_OBJECT] }] };
    expect(collectSourcePaths(grouped)).toEqual(["user-1/abc.png"]);
  });

  it("collects multiple sourcePaths across several objects", () => {
    const second = { ...IMAGE_OBJECT, sourcePath: "user-1/def.png" };
    expect(collectSourcePaths({ objects: [IMAGE_OBJECT, second] })).toEqual(["user-1/abc.png", "user-1/def.png"]);
  });
});

describe("withRefreshedImageSources", () => {
  it("returns null unchanged", () => {
    expect(withRefreshedImageSources(null, new Map())).toBeNull();
  });

  it("replaces src for an object whose sourcePath has a fresh URL", () => {
    const fresh = new Map([["user-1/abc.png", "https://storage.example/fresh-signed-url"]]);
    const result = withRefreshedImageSources({ objects: [IMAGE_OBJECT] }, fresh) as { objects: { src: string }[] };
    expect(result.objects[0].src).toBe("https://storage.example/fresh-signed-url");
  });

  it("leaves src untouched when no fresh URL was resolved for that sourcePath", () => {
    const result = withRefreshedImageSources({ objects: [IMAGE_OBJECT] }, new Map()) as { objects: { src: string }[] };
    expect(result.objects[0].src).toBe("https://storage.example/old-signed-url");
  });

  it("refreshes an image nested inside a Group", () => {
    const fresh = new Map([["user-1/abc.png", "https://storage.example/fresh-signed-url"]]);
    const grouped = { objects: [{ type: "group", objects: [IMAGE_OBJECT] }] };
    const result = withRefreshedImageSources(grouped, fresh) as { objects: { objects: { src: string }[] }[] };
    expect(result.objects[0].objects[0].src).toBe("https://storage.example/fresh-signed-url");
  });

  it("never mutates the input object", () => {
    const fresh = new Map([["user-1/abc.png", "https://storage.example/fresh-signed-url"]]);
    const original = { objects: [{ ...IMAGE_OBJECT }] };
    withRefreshedImageSources(original, fresh);
    expect(original.objects[0].src).toBe("https://storage.example/old-signed-url");
  });

  it("leaves objects with no sourcePath (text, library artwork) completely unchanged", () => {
    const fresh = new Map([["user-1/abc.png", "https://storage.example/fresh-signed-url"]]);
    const result = withRefreshedImageSources({ objects: [TEXT_OBJECT] }, fresh);
    expect(result).toEqual({ objects: [TEXT_OBJECT] });
  });
});
