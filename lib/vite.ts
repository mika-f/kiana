import { dirname, join, parse, resolve } from "node:path";
import { cwd } from "node:process";

import glob from "fast-glob";
import normalize from "normalize-path";
import { defineConfig as d, type PluginOption } from "vite";

const basename = (path: string) => parse(path).name;

const relative = (...paths: string[]) => resolve(cwd(), ...paths);

const getEntries = ({
  baseDir,
  patterns,
}: {
  baseDir: string;
  patterns: string[];
}): Record<string, string> => {
  const entries = glob
    .sync(patterns, { cwd: baseDir })
    .map((w) => normalize(join(baseDir, w)));

  return entries.reduce((w, cur) => {
    const dir = dirname(cur).substring(baseDir.length);
    const entry = basename(cur);
    w[normalize(join(dir, entry))] = relative(cur);

    return w;
  }, {} as Record<string, string>);
};

const defineConfig = ({
  baseDir = "./src/",
  patterns = ["**/*.ts", "**/*.tsx", "!**/*.spec.ts", "!**/*.spec.tsx"],
  externals = [],
  plugins = [],
}: {
  baseDir?: string;
  patterns?: string[];
  externals?: string[];
  plugins?: PluginOption[];
}) =>
  d({
    plugins: [...plugins],
    build: {
      // do not copy public directory
      copyPublicDir: false,
      lib: {
        entry: getEntries({ baseDir, patterns }),
        fileName: (format, name) => {
          const base = basename(name);
          return `${base}.${format === "cjs" ? "cjs" : "mjs"}`;
        },
        formats: ["es", "cjs"],
      },
      rollupOptions: {
        external: [...externals],
        output: {
          // keep module structure
          preserveModules: true,
        },
      },
    },
  });

export { defineConfig };
