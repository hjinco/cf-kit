import type { Format } from "./format";

export const cacheKey = (
  keyRaw: string,
  width: number,
  quality: number,
  fmt: Format
) => `${keyRaw}/w${width}_q${quality}.${fmt}`;
