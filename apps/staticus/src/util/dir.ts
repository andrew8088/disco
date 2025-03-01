import fs from "node:fs/promises";
import nPath from "node:path";

export type File = { path: string; content: string };
export type TransformFn = (data: File) => Promise<File>;

export async function* walk(root: string, recursive = true): AsyncGenerator<string> {
  const entries = await fs.readdir(root, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = nPath.join(root, entry.name);

    if (entry.isFile()) {
      yield fullPath;
    } else if (entry.isDirectory() && recursive) {
      yield* walk(fullPath, recursive);
    }
  }
}

export async function* read(src: string, recursive = true): AsyncGenerator<File> {
  for await (const path of walk(src, recursive)) {
    const content = await fs.readFile(path, "utf-8");
    yield { path, content };
  }
}

export async function transform(src: string, fn: TransformFn) {
  for await (const file of read(src)) {
    const { path: newPath, content } = await fn(file);
    await fs.writeFile(newPath, content);
  }
}

export async function copy(src: string, dest: string) {
  await transform(src, async (file) => {
    const newPath = file.path.replace(src, dest);
    await fs.mkdir(nPath.dirname(newPath), { recursive: true });
    return { path: newPath, content: file.content };
  });
}
