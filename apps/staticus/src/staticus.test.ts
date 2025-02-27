import * as fs from "node:fs/promises";
import * as nPath from "node:path";
import { describe, expect, it } from "vitest";
import Staticus from "./staticus";
import { getFixtureDir, getTmpDir } from "./testHelpers";

describe("staticus", () => {
  it("works", async () => {
    const src = getFixtureDir("basic");
    const dest = await getTmpDir();

    const site = new Staticus({
      src,
      dest,
    });

    await site.build();

    const homepage = await fs.readFile(nPath.join(dest, "index.html"), "utf8");
    expect(homepage.trim()).toEqual("<h1>hello world</h1>");
  });
});
