import { describe, it, expect } from "vitest";
import { cacheKey } from "../cache";

describe("cacheKey", () => {
  it("should generate cache key with all parameters", () => {
    const result = cacheKey("image.jpg", 200, 80, "webp");
    expect(result).toBe("image.jpg/w200_q80.webp");
  });

  it("should generate cache key for different formats", () => {
    const result = cacheKey("photo.png", 400, 75, "avif");
    expect(result).toBe("photo.png/w400_q75.avif");
  });

  it("should generate cache key for JPEG", () => {
    const result = cacheKey("test.gif", 800, 90, "jpeg");
    expect(result).toBe("test.gif/w800_q90.jpeg");
  });

  it("should handle different widths", () => {
    expect(cacheKey("img.jpg", 100, 75, "webp")).toBe("img.jpg/w100_q75.webp");
    expect(cacheKey("img.jpg", 1920, 75, "webp")).toBe(
      "img.jpg/w1920_q75.webp"
    );
  });

  it("should handle different qualities", () => {
    expect(cacheKey("img.jpg", 200, 10, "webp")).toBe("img.jpg/w200_q10.webp");
    expect(cacheKey("img.jpg", 200, 100, "webp")).toBe(
      "img.jpg/w200_q100.webp"
    );
  });

  it("should handle original key with path", () => {
    const result = cacheKey("folder/subfolder/image.jpg", 300, 85, "png");
    expect(result).toBe("folder/subfolder/image.jpg/w300_q85.png");
  });

  it("should handle original key with special characters", () => {
    const result = cacheKey("image-with_special.chars.jpg", 500, 60, "gif");
    expect(result).toBe("image-with_special.chars.jpg/w500_q60.gif");
  });
});
