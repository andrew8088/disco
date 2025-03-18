import path from "node:path";
import { describe, expect, it } from "vitest";
import * as reader from "./reader";

describe("reader", () => {
  describe("glob", () => {
    it("works", async () => {
      const root = path.join(__dirname, "..", "fixtures", "basic", "notes", "*.md");
      const files = await Array.fromAsync(reader.glob(root)({ srcDir: "/" }));
      expect(files).toHaveLength(3);
      expect(files[0].originalPath).toContain("aaa.md");
      expect(files[0].originalContent).toContain("Post Title 1");
    });
  });
});
