import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getTmpDir } from "./testHelpers";
import * as writer from "./writer";

describe("writer", () => {
  it("writes files", async () => {
    async function* start() {
      yield {
        content: "Hello, world!",
        outputPath: "./aaa.html",
      };
      yield {
        content: "Hello, world!",
        outputPath: "./bbb.html",
      };
    }

    const root = await getTmpDir();

    await writer.write(start(), { destDir: root, srcDir: "" });

    const files = await Array.fromAsync(fs.glob(path.join(root, "*.html")));

    expect(files[0]).toContain(path.join(root, "aaa.html"));
    expect(files[1]).toContain(path.join(root, "bbb.html"));
  });
});
