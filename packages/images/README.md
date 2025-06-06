# @cf-kit/images

A high-performance image processing library for Cloudflare Workers that provides intelligent format negotiation, smart caching, and automatic variant selection using R2 storage and the Images Binding.

## Features

### 🎯 **Smart Format Negotiation**

Automatically serves the optimal image format based on client browser support:

- AVIF for modern browsers (best compression)
- WebP for browsers that support it
- Falls back to original format for compatibility

### ⚡ **Intelligent Caching**

- R2-based caching with automatic cache key generation
- Immutable cache headers for optimal CDN performance
- Background cache warming to minimize latency

### 🔧 **Automatic Variant Selection**

- Picks the best image size from your predefined variants
- Intelligent upscaling/downscaling logic
- Quality optimization based on available variants

### 🛡️ **Robust Error Handling**

- Comprehensive input validation
- Graceful error responses with detailed messages
- Type-safe error handling with custom error types

### 📝 **Full TypeScript Support**

- Complete type definitions for all interfaces
- Runtime type validation
- IntelliSense support for better developer experience

## Installation

```bash
npm install @cf-kit/images
# or
pnpm add @cf-kit/images
# or
yarn add @cf-kit/images
```

## Quick Start

```typescript
import { optimizeImage } from "@cf-kit/images";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const w = parseInt(url.searchParams.get("w") || "800");
    const q = parseInt(url.searchParams.get("q") || "75");

    return optimizeImage(
      {
        ctx,
        R2: env.IMAGES_BUCKET,
        Images: env.IMAGES_API,
        originKey: "photos/landscape.jpg",
        headers: request.headers,
        variants: [
          { w: 400, q: 80 },
          { w: 800, q: 75 },
          { w: 1200, q: 70 },
          { w: 1600, q: 65 },
        ],
      },
      { w, q }
    );
  },
};
```

## API Reference

### `optimizeImage(params, options)`

Processes and optimizes an image with automatic format negotiation and caching.

#### Parameters

**`params: ImageProcessingParams`**

| Property    | Type                             | Description                                              |
| ----------- | -------------------------------- | -------------------------------------------------------- |
| `ctx`       | `ExecutionContext`               | Cloudflare execution context for background tasks        |
| `R2`        | `R2Bucket`                       | R2 bucket instance for image storage and caching         |
| `Images`    | `ImagesBinding`                  | Cloudflare Images API binding for transformations        |
| `originKey` | `string`                         | Key/path of the original image in R2 storage             |
| `headers`   | `Headers`                        | Request headers for format negotiation                   |
| `variants`  | `Array<{w: number, q?: number}>` | Available image variants with width and optional quality |

**`options: ImageTransformOptions`**

| Property | Type                  | Description                        |
| -------- | --------------------- | ---------------------------------- |
| `w`      | `number`              | Desired width (1-10000 pixels)     |
| `q`      | `number` _(optional)_ | Quality level (1-100, default: 75) |

#### Returns

`Promise<Response>` - Optimized image response or error response

#### Example Response Headers

```
Content-Type: image/avif
Cache-Control: public, max-age=31536000, immutable
```

## Variant Selection Logic

The library uses intelligent logic to select the best variant:

1. **Preferred Strategy**: Finds the smallest variant width that's ≥ the requested width
2. **Fallback Strategy**: If no variants are large enough, uses the largest available variant
3. **Quality Matching**: When multiple variants have the same width, picks the one with quality closest to the requested quality

### Example Variant Selection

```typescript
const variants = [
  { w: 400, q: 80 },
  { w: 800, q: 75 },
  { w: 1200, q: 70 },
];

// Request: w=600, q=75
// Selected: { w: 800, q: 75 } (smallest width ≥ 600)

// Request: w=1500, q=75
// Selected: { w: 1200, q: 70 } (largest available, closest quality)
```

## Supported Image Formats

| Format   | MIME Type    | Browser Support | Compression     |
| -------- | ------------ | --------------- | --------------- |
| **AVIF** | `image/avif` | Modern browsers | Excellent       |
| **WebP** | `image/webp` | Most browsers   | Very good       |
| **JPEG** | `image/jpeg` | Universal       | Good            |
| **PNG**  | `image/png`  | Universal       | Good (lossless) |
| **GIF**  | `image/gif`  | Universal       | Basic           |

## Error Handling

All errors are returned as JSON responses with appropriate HTTP status codes:

### Common Error Responses

```typescript
// 400 Bad Request
{
  "error": "Width must be a positive integer between 1 and 10000",
  "statusCode": 400
}

// 404 Not Found
{
  "error": "Image not found",
  "statusCode": 404
}

// 400 Bad Request
{
  "error": "Unsupported image format: bmp",
  "statusCode": 400
}
```

### Error Types

The library exports a custom error type for better error handling:

```typescript
import { ProcessImageError } from "@cf-kit/images";

try {
  const response = await optimizeImage(params, options);
} catch (error) {
  if (error instanceof ProcessImageError) {
    console.error(`Error ${error.statusCode}: ${error.message}`);
  }
}
```

## Type Definitions

```typescript
export interface ImageProcessingParams {
  ctx: ExecutionContext;
  R2: R2Bucket;
  Images: ImagesBinding;
  originKey: string;
  headers: Headers;
  variants: {
    w: number;
    q?: number;
  }[];
}

export interface ImageTransformOptions {
  w: number;
  q?: number;
}

export interface CacheOptions {
  maxAge?: number;
  immutable?: boolean;
}

export interface ProcessImageError extends Error {
  statusCode: number;
  message: string;
}

export type Format = "avif" | "webp" | "jpeg" | "png" | "gif";
```

## Advanced Usage

### Custom Cache Configuration

```typescript
// The library automatically handles caching, but you can customize
// cache behavior by configuring your R2 bucket settings
```

### Format Override

```typescript
// The library automatically negotiates format based on Accept headers
// No manual format specification needed - it's handled intelligently
```

### Performance Tips

1. **Pre-generate Variants**: Define variants that match your common use cases
2. **Quality Settings**: Use appropriate quality levels (65-80 for most images)
3. **Cache Headers**: The library sets optimal cache headers automatically
4. **Background Processing**: Cache warming happens in the background for better performance

## License

MIT
