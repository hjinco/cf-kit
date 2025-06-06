/// <reference types="vitest" />

export default {
  test: {
    globals: true,
    include: ["**/*.{test,spec}.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
};
