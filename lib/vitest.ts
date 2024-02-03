import { defineConfig as d } from "vitest/config";

const defineConfig = () =>
  d({
    test: {
      globals: true,
      globalSetup: "./global-setup.ts",
    },
  });

export { defineConfig };
