import { basename, dirname, extname, join, resolve } from "node:path";
import { cwd } from "node:process";

import glob from "fast-glob";
import normalize from "normalize-path";
import { type PluginOption, UserConfig, defineConfig as d } from "vite";

const relative = (...paths: string[]) => resolve(cwd(), ...paths);

const getImports = ({
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
    const dir = dirname(cur).substring(baseDir.length - 1);
    const ext = extname(cur);
    const entry = basename(cur, ext);
    w[normalize(join(dir, entry))] = relative(cur);

    return w;
  }, {} as Record<string, string>);
};

// https://vitejs.dev/config/
const defineConfig = ({
  baseDir = "./src",
  patterns = [
    "**/*.ts",
    "**/*.tsx",
    "!**/*.spec.ts",
    "!**/*.spec.tsx",
    "!**/*.stories.tsx",
  ],
  externals = [],
  plugins = [],
  fileName = "[name].[format]",
}: {
  baseDir?: string;
  patterns?: string[];
  externals?: string[];
  plugins?: PluginOption[];
  fileName?:
    | string
    | ((format: string, entryName: string) => string)
    | undefined;
}): UserConfig =>
  d({
    plugins: [plugins],
    build: {
      // do not copy public directory
      copyPublicDir: false,
      lib: {
        entry: getImports({ baseDir, patterns }),
        fileName,
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
