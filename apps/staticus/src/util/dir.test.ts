import nPath from "node:path";
import { describe, expect, it } from "vitest";
import { getFixtureDir, getTmpDir } from "../testHelpers";
import * as dir from "./dir";

describe("dir", () => {
  describe("walk", () => {
    it("works", async () => {
      const src = getFixtureDir("basic");
      const arr = await Array.fromAsync(dir.walk(src));
      expect(arr).toContain(nPath.join(src, "index.html"));
    });
  });

  describe("read", () => {
    it("works", async () => {
      const src = getFixtureDir("basic");
      const arr = await Array.fromAsync(dir.read(src));
      expect(arr[0]).toEqual({
        path: nPath.join(src, "index.html"),
        content: "<h1>index page</h1>\n",
      });
    });
  });

  describe("copy", () => {
    it("works", async () => {
      const src = getFixtureDir("basic");
      const dest = await getTmpDir();
      await dir.copy(src, dest);

      const arr = await Array.fromAsync(dir.read(dest));
      expect(arr[0]).toEqual({
        path: nPath.join(dest, "index.html"),
        content: "<h1>index page</h1>\n",
      });
    });
  });
});
