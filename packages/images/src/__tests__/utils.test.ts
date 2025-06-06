import { describe, it, expect } from "vitest";
import { createErrorResponse, createImageResponse } from "../utils";

describe("utils", () => {
  describe("createErrorResponse", () => {
    it("should create error response with correct message and status", () => {
      const response = createErrorResponse("Test error", 400);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(400);
    });

    it("should create 404 error response", () => {
      const response = createErrorResponse("Not found", 404);

      expect(response.status).toBe(404);
    });

    it("should create 500 error response", () => {
      const response = createErrorResponse("Internal server error", 500);

      expect(response.status).toBe(500);
    });
  });

  describe("createImageResponse", () => {
    it("should create image response with correct headers", () => {
      const mockStream = new ReadableStream();
      const response = createImageResponse(mockStream, "image/webp");

      expect(response).toBeInstanceOf(Response);
      expect(response.headers.get("Content-Type")).toBe("image/webp");
      expect(response.headers.get("Cache-Control")).toBe(
        "public, max-age=31536000, immutable"
      );
      expect(response.headers.get("Vary")).toBe("Accept");
    });

    it("should create image response for different content types", () => {
      const mockStream = new ReadableStream();
      const response = createImageResponse(mockStream, "image/avif");

      expect(response.headers.get("Content-Type")).toBe("image/avif");
    });

    it("should create image response for JPEG", () => {
      const mockStream = new ReadableStream();
      const response = createImageResponse(mockStream, "image/jpeg");

      expect(response.headers.get("Content-Type")).toBe("image/jpeg");
    });
  });
});
