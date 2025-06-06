import {
  chooseFormat,
  isSupportedFormat,
  mimeType,
  type Format,
} from "./format";
import { pickVariant } from "./variant";
import { cacheKey } from "./cache";
import { createErrorResponse, createImageResponse } from "./utils";
import type { ImageProcessingParams, ImageTransformOptions } from "./types";

export type {
  ImageProcessingParams,
  ImageTransformOptions,
  CacheOptions,
  ProcessImageError,
} from "./types";
export type { Format } from "./format";

export async function optimizeImage(
  params: ImageProcessingParams,
  options: ImageTransformOptions
) {
  const { ctx, R2, Images, originKey, headers, variants } = params;
  const { w, q } = options;

  // Input validation
  if (!originKey || typeof originKey !== "string") {
    return createErrorResponse("Invalid origin key", 400);
  }

  if (!Number.isInteger(w) || w <= 0 || w > 10000) {
    return createErrorResponse(
      "Width must be a positive integer between 1 and 10000",
      400
    );
  }

  if (q !== undefined && (!Number.isInteger(q) || q < 1 || q > 100)) {
    return createErrorResponse(
      "Quality must be an integer between 1 and 100",
      400
    );
  }

  let format = chooseFormat(headers.get("accept"));
  const { width, quality } = pickVariant(variants, { w, q });

  let origObj: R2ObjectBody | null = null;

  if (format === null) {
    origObj = await R2.get(originKey);
    if (!origObj) {
      return createErrorResponse("Image not found", 404);
    }

    const contentType = origObj.httpMetadata?.contentType;
    if (!contentType) {
      return createErrorResponse("Unable to determine image format", 400);
    }

    const fmt = contentType.split("/")[1];
    if (!isSupportedFormat(fmt)) {
      return createErrorResponse(`Unsupported image format: ${fmt}`, 400);
    }
    format = fmt;
  }

  const key = cacheKey(originKey, width, quality, format);

  const hit = await R2.get(key).catch((e) => {
    console.error("Error checking cache:", e);
  });

  if (hit) {
    return createImageResponse(
      hit.body,
      hit.httpMetadata?.contentType ?? mimeType(format)
    );
  }

  if (origObj === null) {
    origObj = await R2.get(originKey);
    if (!origObj) {
      return createErrorResponse("Image not found", 404);
    }
  }

  const transformed = await Images.input(origObj.body)
    .transform({ width })
    .output({ format: mimeType(format), quality });

  const contentType = transformed.contentType();
  const imageBuffer = transformed.image();
  const [toClient, toR2] = imageBuffer.tee();

  ctx.waitUntil(
    R2.put(key, toR2, {
      httpMetadata: {
        contentType,
      },
    }).catch((error) => {
      console.error("Error caching transformed image:", error);
    })
  );

  return createImageResponse(toClient, contentType);
}
