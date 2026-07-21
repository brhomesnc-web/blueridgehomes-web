import { defineConfig } from "vitest/config";
import path from "node:path";

// TipTap's Editor needs a DOM; happy-dom is the documented harness.
export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
