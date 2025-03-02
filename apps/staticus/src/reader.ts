import fs from "node:fs/promises";

export type BaseItem = { originalPath: string; originalContent: string };

export async function* files(src: AsyncIterable<string>): AsyncGenerator<BaseItem> {
  for await (const path of src) {
    yield {
      originalPath: path,
      originalContent: await fs.readFile(path, "utf-8"),
    };
  }
}
