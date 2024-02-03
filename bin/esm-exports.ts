import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, parse } from "node:path";
import { argv, cwd } from "node:process";

import glob from "fast-glob";
import normalize from "normalize-path";
import yargs from "yargs";

const basename = (path: string) => parse(path).name;

const isFileExists = async (uri: string): Promise<boolean> => {
  return new Promise((resolve) => {
    resolve(existsSync(uri));
  });
};

const args = await yargs(argv.slice(2))
  .options({
    dist: {
      default: "./dist/",
      type: "string",
    },
    pattern: {
      default: "**/index.mjs",
      type: "string",
    },
    entrypoint: {
      type: "string",
    },
  })
  .parse();

const main = async () => {
  const root = cwd();
  const pkg = join(root, "package.json");
  const isExistsPackageJson = await isFileExists(pkg);
  if (isExistsPackageJson) {
    const content = await readFile(pkg, { encoding: "utf-8" });
    const json = JSON.parse(content);

    const entries = await glob(normalize(join(args.dist, args.pattern)));
    const exports: Record<string, Record<string, string>> = {};

    if (args.entrypoint) {
      const base = basename(args.entrypoint);
      exports["."] = {
        import: join(args.dist, `${base}.mjs`),
        require: join(args.dist, `${base}.cjs`),
        types: join(args.dist, `${base}.d.ts`),
      };
    }

    entries.sort((a, b) => a.localeCompare(b));

    for (const entry of entries) {
      const dir = dirname(entry);
      const base = basename(entry);

      exports[`./${normalize(join(dir.substring(dir.length), base))}`] = {
        import: `./${normalize(join(dir, `${base}.mjs`))}`,
        require: `./${normalize(join(dir, `${base}.cjs`))}`,
        types: `./${normalize(join(dir, `${base}.d.ts`))}`,
      };
    }

    json["exports"] = exports;
    await writeFile(pkg, JSON.stringify(json, null, 2));
  }
};

await main();
