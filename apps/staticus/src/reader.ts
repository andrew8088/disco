import fs from "node:fs/promises";
import path from "node:path";
import { Options } from "./staticus";

export type BaseItem = { originalPath: string; originalContent: string };

export async function* files(src: AsyncIterable<string>, root: string): AsyncGenerator<BaseItem> {
  for await (const filepath of src) {
    yield {
      originalPath: filepath,
      originalContent: await fs.readFile(path.join(root, filepath), "utf-8"),
    };
  }
}

export function glob(pattern: string) {
  return function (options: Options) {
    return files(fs.glob(pattern, { cwd: options.srcDir }), options.srcDir);
  };
}
