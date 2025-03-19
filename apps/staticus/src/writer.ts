import fs from "node:fs/promises";
import path from "node:path";
import { StaticusOptions } from "./staticus";

export async function write(
  files: AsyncIterable<{ content: string; outputPath: string }>,
  options: Pick<StaticusOptions, "destDir">,
) {
  for await (const file of files) {
    const outputPath = path.join(options.destDir, file.outputPath);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, file.content);
  }
}
