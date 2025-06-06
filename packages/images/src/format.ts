export type Raster = "avif" | "webp" | "jpeg" | "png" | "gif";
export type Format = Raster;

const parseAccept = (h: string | null): string[] =>
  h
    ? h
        .toLowerCase()
        .split(",")
        .map((t) => t.split(";")[0].trim())
    : [];

export const chooseFormat = (accept: string | null): Format | null => {
  const a = parseAccept(accept);
  if (a.includes("image/avif")) return "avif";
  if (a.includes("image/webp")) return "webp";
  return null;
};

export const isSupportedFormat = (
  format: string | undefined
): format is Format => {
  if (!format) return false;
  return ["avif", "webp", "jpeg", "png", "gif"].includes(format);
};

export const mimeType = (format: Format) => {
  switch (format) {
    case "avif":
      return "image/avif";
    case "webp":
      return "image/webp";
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
  }
};
