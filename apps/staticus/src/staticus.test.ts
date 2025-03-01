import fs from "node:fs/promises";
import { mustFind } from "@disco/common";
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
      collections: [Staticus.passthrough(".")],
    });

    await site.build();

    const sourceFiles = await Array.fromAsync(walk(baseDir));
    const outputFiles = await Array.fromAsync(walk(output));

    expect(sourceFiles.length).toEqual(outputFiles.length);

    for await (const [idx, file] of Object.entries(sourceFiles)) {
      const originalFile = await fs.readFile(file, "utf-8");
      const newFile = await fs.readFile(outputFiles[Number(idx)], "utf-8");
      expect(originalFile).toEqual(newFile);
    }
  });

  it("does a markdown conversion", async () => {
    const baseDir = getFixtureDir("basic");
    const output = await getTmpDir();

    const site = new Staticus({
      baseDir,
      output,
      collections: [Staticus.markdown("notes")],
    });

    await site.build();

    const sourceFiles = await Array.fromAsync(walk(baseDir + "/notes"));
    const outputFiles = await Array.fromAsync(walk(output));
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

  it("works with two collections", async () => {
    const baseDir = getFixtureDir("basic");
    const output = await getTmpDir();

    const site = new Staticus({
      baseDir,
      output,
      collections: [Staticus.passthrough(".", { recursive: false }), Staticus.markdown("notes")],
    });

    await site.build();

    const originalIndex = await fs.readFile(baseDir + "/index.html", "utf-8");
    const newIndex = await fs.readFile(output + "/index.html", "utf-8");

    expect(originalIndex).toEqual(newIndex);

    const sourceFiles = await Array.fromAsync(walk(baseDir + "/notes"));
    const outputFiles = await Array.fromAsync(walk(output + "/notes"));
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
});
