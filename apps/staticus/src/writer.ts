import fs from "node:fs/promises";
import path from "node:path";

export async function write(
  files: AsyncIterable<{ content: string; outputPath: string }>,
  { root }: { root: string },
) {
  for await (const file of files) {
    const outputPath = path.join(root, file.outputPath);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, file.content);
  }
}
