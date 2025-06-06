import { describe, it, expect } from "vitest";
import { pickVariant } from "../variant";

describe("pickVariant", () => {
  const variants = [
    { w: 100, q: 75 },
    { w: 200, q: 80 },
    { w: 400, q: 85 },
    { w: 800 }, // No quality specified, should default to 75
  ];

  describe("width selection strategy", () => {
    it("should pick exact width match", () => {
      const result = pickVariant(variants, { w: 200 });
      expect(result).toEqual({ width: 200, quality: 80 });
    });

    it("should pick smallest width greater than requested", () => {
      // Requesting 150, should pick 200 (smallest >= 150)
      const result = pickVariant(variants, { w: 150 });
      expect(result).toEqual({ width: 200, quality: 80 });
    });

    it("should pick smallest width greater than requested (multiple options)", () => {
      // Requesting 250, should pick 400 (smallest >= 250), not 800
      const result = pickVariant(variants, { w: 250 });
      expect(result).toEqual({ width: 400, quality: 85 });
    });

    it("should pick largest available when no width is greater than requested", () => {
      // Requesting 1000, no variants >= 1000, should pick largest (800)
      const result = pickVariant(variants, { w: 1000 });
      expect(result).toEqual({ width: 800, quality: 75 });
    });

    it("should pick largest available for very large requests", () => {
      // Requesting 900, should pick 800 (largest available)
      const result = pickVariant(variants, { w: 900 });
      expect(result).toEqual({ width: 800, quality: 75 });
    });

    it("should pick smallest variant when requesting very small width", () => {
      // Requesting 50, should pick 100 (smallest >= 50)
      const result = pickVariant(variants, { w: 50 });
      expect(result).toEqual({ width: 100, quality: 75 });
    });
  });

  describe("quality as tiebreaker", () => {
    it("should consider quality when multiple variants have same width >= requested", () => {
      const variantsEqual = [
        { w: 200, q: 75 },
        { w: 200, q: 85 },
      ];

      // Both have width 200 >= 150, should pick the one with quality closer to 80
      const result = pickVariant(variantsEqual, { w: 150, q: 80 });
      expect(result).toEqual({ width: 200, quality: 75 });
    });

    it("should consider quality when no variants >= requested and multiple have same max width", () => {
      const variantsEqual = [
        { w: 100, q: 75 },
        { w: 100, q: 85 },
      ];

      // No variants >= 200, both have max width 100, should pick quality closer to 80
      const result = pickVariant(variantsEqual, { w: 200, q: 80 });
      expect(result).toEqual({ width: 100, quality: 75 });
    });

    it("should use default quality 75 as tiebreaker when no quality specified in request", () => {
      const variantsEqual = [
        { w: 200, q: 90 },
        { w: 200, q: 75 },
      ];

      // Both have same width, no quality specified, should pick the one closer to default quality (75)
      const result = pickVariant(variantsEqual, { w: 150 });
      expect(result).toEqual({ width: 200, quality: 75 });
    });

    it("should use default quality 75 when not specified in variant", () => {
      const result = pickVariant(variants, { w: 800 });
      expect(result).toEqual({ width: 800, quality: 75 });
    });
  });

  describe("input validation", () => {
    it("should throw error for non-integer width", () => {
      expect(() => pickVariant(variants, { w: 200.5 })).toThrow(
        "Width must be a positive integer"
      );
    });

    it("should throw error for negative width", () => {
      expect(() => pickVariant(variants, { w: -200 })).toThrow(
        "Width must be a positive integer"
      );
    });

    it("should throw error for zero width", () => {
      expect(() => pickVariant(variants, { w: 0 })).toThrow(
        "Width must be a positive integer"
      );
    });

    it("should throw error for non-integer quality", () => {
      expect(() => pickVariant(variants, { w: 200, q: 75.5 })).toThrow(
        "Quality must be a positive integer between 1 and 100"
      );
    });

    it("should throw error for quality out of range", () => {
      expect(() => pickVariant(variants, { w: 200, q: 150 })).toThrow(
        "Quality must be a positive integer between 1 and 100"
      );
    });

    it("should throw error for zero quality", () => {
      expect(() => pickVariant(variants, { w: 200, q: 0 })).toThrow(
        "Quality must be a positive integer between 1 and 100"
      );
    });
  });

  describe("variants validation", () => {
    it("should throw error for empty variants array", () => {
      expect(() => pickVariant([], { w: 200 })).toThrow(
        "Allowed variants must be a non-empty array"
      );
    });

    it("should throw error for variants with invalid width", () => {
      const invalidVariants = [{ w: -100, q: 75 }];
      expect(() => pickVariant(invalidVariants, { w: 200 })).toThrow(
        "All variant widths must be positive integers"
      );
    });

    it("should throw error for variants with invalid quality", () => {
      const invalidVariants = [{ w: 100, q: 150 }];
      expect(() => pickVariant(invalidVariants, { w: 200 })).toThrow(
        "All variant qualities must be positive integers between 1 and 100"
      );
    });

    it("should throw error for variants with zero quality", () => {
      const invalidVariants = [{ w: 100, q: 0 }];
      expect(() => pickVariant(invalidVariants, { w: 200 })).toThrow(
        "All variant qualities must be positive integers between 1 and 100"
      );
    });
  });

  describe("edge cases", () => {
    it("should handle single variant", () => {
      const singleVariant = [{ w: 300, q: 80 }];
      const result = pickVariant(singleVariant, { w: 500 });
      expect(result).toEqual({ width: 300, quality: 80 });
    });

    it("should handle variant without quality", () => {
      const variantNoQuality = [{ w: 300 }];
      const result = pickVariant(variantNoQuality, { w: 300 });
      expect(result).toEqual({ width: 300, quality: 75 });
    });
  });
});
