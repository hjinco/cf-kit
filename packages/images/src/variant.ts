export const pickVariant = (
  variants: { w: number; q?: number }[],
  { w, q }: { w: number; q?: number }
): { width: number; quality: number } => {
  if (!Number.isInteger(w) || w <= 0) {
    throw new Error("Width must be a positive integer");
  }

  if (q !== undefined && (!Number.isInteger(q) || q <= 0 || q > 100)) {
    throw new Error("Quality must be a positive integer between 1 and 100");
  }

  if (variants.length === 0) {
    throw new Error("Allowed variants must be a non-empty array");
  }

  if (variants.some((v) => !Number.isInteger(v.w) || v.w <= 0)) {
    throw new Error("All variant widths must be positive integers");
  }

  if (
    variants.some(
      (v) =>
        v.q !== undefined && (!Number.isInteger(v.q) || v.q <= 0 || v.q > 100)
    )
  ) {
    throw new Error(
      "All variant qualities must be positive integers between 1 and 100"
    );
  }

  // First, try to find variants with width >= requested width
  const largerVariants = variants.filter((v) => v.w >= w);

  const variant = (
    largerVariants.length > 0 ? largerVariants : variants
  ).reduce((prev, curr) => {
    // For variants >= requested width, pick the smallest one
    // For variants < requested width, pick the largest one
    if (largerVariants.length > 0) {
      // Pick the smallest width that's >= requested width
      if (curr.w < prev.w) {
        return curr;
      }
      if (prev.w < curr.w) {
        return prev;
      }
      // If widths are equal, consider quality (use default 75 if not specified)
      if (curr.w === prev.w) {
        const prevQuality = prev.q ?? 75;
        const currQuality = curr.q ?? 75;
        const targetQuality = q ?? 75; // Use default quality if not specified
        const prevQualityDiff = Math.abs(prevQuality - targetQuality);
        const currQualityDiff = Math.abs(currQuality - targetQuality);
        return currQualityDiff < prevQualityDiff ? curr : prev;
      }
      return prev;
    } else {
      // No variants >= requested width, pick the largest available
      if (curr.w > prev.w) {
        return curr;
      }
      if (prev.w > curr.w) {
        return prev;
      }
      // If widths are equal, consider quality (use default 75 if not specified)
      if (curr.w === prev.w) {
        const prevQuality = prev.q ?? 75;
        const currQuality = curr.q ?? 75;
        const targetQuality = q ?? 75; // Use default quality if not specified
        const prevQualityDiff = Math.abs(prevQuality - targetQuality);
        const currQualityDiff = Math.abs(currQuality - targetQuality);
        return currQualityDiff < prevQualityDiff ? curr : prev;
      }
      return prev;
    }
  });

  return {
    width: variant.w,
    quality: variant.q ?? 75,
  };
};
