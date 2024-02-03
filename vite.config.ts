import { defineConfig } from "./lib/vite";

export default defineConfig({
  baseDir: "./lib/",
  externals: [
    "node:path",
    "node:process",
    "fast-glob",
    "normalize-path",
    "vite",
    "vitest",
    "vitest/config",
  ],
});
