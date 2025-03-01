import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";
import Staticus from "./staticus";
import { getFixtureDir, getTmpDir } from "./testHelpers";
import { walk } from "./util/dir";

describe("staticus", () => {
  it("does a basic copy", async () => {
    const baseDir = getFixtureDir("basic");
    const output = await getTmpDir();

    const site = new Staticus({
      baseDir,
      output,
      collections: [
        {
          src: Staticus.fromFilesIn("."),
          transform: Staticus.passthrough(),
        },
      ],
    });

    await site.build();

    const sourceFiles = await Array.fromAsync(walk(baseDir));
    const outputFiles = await Array.fromAsync(walk(output));

    expect(sourceFiles.length).toEqual(outputFiles.length);

    for await (const [idx, file] of Object.entries(sourceFiles)) {
      expect(await fs.readFile(file, "utf-8")).toEqual(
        await fs.readFile(outputFiles[idx], "utf-8"),
      );
    }
  });
});
