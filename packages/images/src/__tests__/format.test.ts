import { describe, it, expect } from "vitest";
import { chooseFormat, isSupportedFormat, mimeType } from "../format";

describe("format module", () => {
  describe("chooseFormat", () => {
    it("should return avif for avif accept header", () => {
      const result = chooseFormat("image/avif,image/webp,*/*");
      expect(result).toBe("avif");
    });

    it("should return webp for webp accept header", () => {
      const result = chooseFormat("image/webp,*/*");
      expect(result).toBe("webp");
    });

    it("should prefer avif over webp", () => {
      const result = chooseFormat("image/webp,image/avif,*/*");
      expect(result).toBe("avif");
    });

    it("should return null for unsupported formats", () => {
      const result = chooseFormat("image/jpeg,image/png");
      expect(result).toBeNull();
    });

    it("should handle null accept header", () => {
      const result = chooseFormat(null);
      expect(result).toBeNull();
    });

    it("should handle quality parameters in accept header", () => {
      const result = chooseFormat("image/webp;q=0.8,image/avif;q=0.9");
      expect(result).toBe("avif");
    });

    it("should be case insensitive", () => {
      const result = chooseFormat("IMAGE/AVIF,IMAGE/WEBP");
      expect(result).toBe("avif");
    });
  });

  describe("isSupportedFormat", () => {
    it("should return true for supported formats", () => {
      expect(isSupportedFormat("avif")).toBe(true);
      expect(isSupportedFormat("webp")).toBe(true);
      expect(isSupportedFormat("jpeg")).toBe(true);
      expect(isSupportedFormat("png")).toBe(true);
      expect(isSupportedFormat("gif")).toBe(true);
    });

    it("should return false for unsupported formats", () => {
      expect(isSupportedFormat("bmp")).toBe(false);
      expect(isSupportedFormat("tiff")).toBe(false);
      expect(isSupportedFormat("svg")).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isSupportedFormat(undefined)).toBe(false);
    });

    it("should return false for null", () => {
      expect(isSupportedFormat(null as any)).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isSupportedFormat("")).toBe(false);
    });
  });

  describe("mimeType", () => {
    it("should return correct mime types", () => {
      expect(mimeType("avif")).toBe("image/avif");
      expect(mimeType("webp")).toBe("image/webp");
      expect(mimeType("jpeg")).toBe("image/jpeg");
      expect(mimeType("png")).toBe("image/png");
      expect(mimeType("gif")).toBe("image/gif");
    });
  });
});
