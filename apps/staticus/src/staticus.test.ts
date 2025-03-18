import fs from "node:fs/promises";
import { mustFind } from "@disco/common";
import * as z from "valibot";
import { describe, expect, it } from "vitest";
import { collection } from "./collection";
import * as reader from "./reader";
import staticus from "./staticus";
import { getFixtureDir, getTmpDir } from "./testHelpers";
import * as transformers from "./transformers";
import { walk } from "./util/dir";
import * as writer from "./writer";

async function* mapAsync<T, U>(
  items: AsyncIterable<T>,
  fn: (x: T) => Promise<U>,
): AsyncGenerator<U> {
  for await (const item of items) {
    yield fn(item);
  }
}

describe("staticus", () => {
  it("does a basic copy", async () => {
    const srcDir = getFixtureDir("basic");
    const destDir = await getTmpDir();

    const a = reader.glob("**/*.{md,html}")({ srcDir });
    const c = mapAsync(a, async (item) => ({
      ...item,
      content: item.originalContent,
      outputPath: item.originalPath,
    }));

    await writer.write(c, { destDir });

    const sourceFiles = await Array.fromAsync(walk(srcDir));
    const outputFiles = await Array.fromAsync(walk(destDir));

    expect(sourceFiles.length).toEqual(outputFiles.length);

    for await (const [idx, file] of Object.entries(sourceFiles)) {
      const originalFile = await fs.readFile(file, "utf-8");
      const newFile = await fs.readFile(outputFiles[Number(idx)], "utf-8");
      expect(originalFile).toEqual(newFile);
    }
  });

  it("does a markdown conversion", async () => {
    const srcDir = getFixtureDir("basic");
    const destDir = await getTmpDir();

    const a = reader.glob("notes/*.md")({ srcDir });
    const b = transformers.yamlFrontMatter(a, z.record(z.string(), z.string()), {
      required: false,
    });
    const c = transformers.markdown(b);
    const d = mapAsync(c, async (item) => ({
      ...item,
      outputPath: item.originalPath,
    }));

    await writer.write(d, { destDir });

    const sourceFiles = await Array.fromAsync(walk(srcDir + "/notes"));
    const outputFiles = await Array.fromAsync(walk(destDir));
    expect(sourceFiles.length).toEqual(outputFiles.length);

    for await (const [idx, file] of Object.entries(sourceFiles)) {
      const originalFile = await fs.readFile(file, "utf-8");
      const newFile = await fs.readFile(outputFiles[Number(idx)], "utf-8");

      const mdTitle = mustFind(originalFile.split("\n"), (line) => line.startsWith("##"))
        .replace("##", "")
        .trim();

      const htmlTitle = mustFind(newFile.split("\n"), (line) => line.startsWith("<h2>"))
        .replace("<h2>", "")
        .replace("</h2>", "")
        .trim();

      expect(mdTitle).toEqual(htmlTitle);
    }
  });
  it("does a markdown conversion", async () => {
    const s = staticus(
      {
        srcDir: getFixtureDir("basic"),
        destDir: await getTmpDir(),
      },
      {
        notes: collection({
          reader: reader.glob("notes/*.md"),
          transformer: function (items) {
            const b = transformers.yamlFrontMatter(items, z.record(z.string(), z.string()), {
              required: false,
            });
            const c = transformers.markdown(b);
            const d = mapAsync(c, async (item) => ({
              ...item,
              outputPath: item.originalPath,
            }));

            return d;
          },
          writer: writer.write,
        }),
      },
    );

    await s.build();
  });
});
