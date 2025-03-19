import { GlobOptionsWithoutFileTypes } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { StaticusOptions } from "./staticus";

export type BaseItem = { originalPath: string; originalContent: string };

export async function* files(src: AsyncIterable<string>, root: string): AsyncGenerator<BaseItem> {
  for await (const filepath of src) {
    yield {
      originalPath: filepath,
      originalContent: await fs.readFile(path.join(root, filepath), "utf-8"),
    };
  }
}

export function glob(pattern: string, { exclude }: { exclude?: string[] } = {}) {
  return function (options: Pick<StaticusOptions, "srcDir">) {
    const globOpts = {
      cwd: options.srcDir,
      exclude,
      withFileTypes: false,
    } as GlobOptionsWithoutFileTypes;
    return files(fs.glob(pattern, globOpts), options.srcDir);
  };
}
