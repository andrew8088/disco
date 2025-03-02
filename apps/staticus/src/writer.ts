import fs from "node:fs/promises";
import path from "node:path";
import { Options } from "./staticus";

export async function write(
  files: AsyncIterable<{ content: string; outputPath: string }>,
  options: Options,
) {
  for await (const file of files) {
    const outputPath = path.join(options.destDir, file.outputPath);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, file.content);
  }
}
