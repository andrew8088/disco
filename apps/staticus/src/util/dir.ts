import * as fs from "node:fs/promises";
import * as nPath from "node:path";

export async function* walk(root: string): AsyncGenerator<string> {
  const srcStat = await fs.stat(root);

  if (srcStat.isDirectory()) {
    const dir = await fs.opendir(root);
    for await (const entry of dir) {
      const srcPath = nPath.join(root, entry.name);
      yield* walk(srcPath);
    }
  } else {
    yield root;
  }
}

type File = { path: string; content: string };
type TransformFn = (data: File) => Promise<File>;

export async function* read(src: string): AsyncGenerator<File> {
  for await (const path of walk(src)) {
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
