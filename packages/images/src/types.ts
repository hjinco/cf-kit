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
