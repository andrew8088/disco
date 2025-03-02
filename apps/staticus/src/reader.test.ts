import fs from "node:fs/promises";
import path from "node:path";
import * as z from "valibot";
import { describe, expect, it } from "vitest";
import * as reader from "./reader";

describe("reader", () => {
  describe("files", () => {
    it("accepts files", async () => {
      const root = path.join(__dirname, "..", "fixtures", "basic", "notes", "*.md");
      const files = await Array.fromAsync(reader.files(fs.glob(root)));
      expect(files).toHaveLength(3);
      expect(files[0].originalPath).toContain("aaa.md");
      expect(files[0].originalContent).toContain("Post Title 1");
    });
  });

  describe("yamlFrontMatter", () => {
    it("parses yaml front-matter out of the content", async () => {
      async function* start() {
        yield {
          originalPath: "./post1.md",
          originalContent: `---
title: hello
name: john doe
number: 42
date: 2025-01-01T00:00:00.000Z
---

Hello, world!`,
        };
      }

      const results = await Array.fromAsync(
        reader.yamlFrontMatter(
          start(),
          z.object({
            title: z.string(),
            name: z.string(),
            number: z.number(),
            date: z.date(),
          }),
        ),
      );

      expect(results[0]).toEqual({
        data: {
          title: "hello",
          name: "john doe",
          number: 42,
          date: new Date("2025-01-01T00:00:00.000Z"),
        },
        content: "Hello, world!",
        originalPath: "./post1.md",
        originalContent: `---
title: hello
name: john doe
number: 42
date: 2025-01-01T00:00:00.000Z
---

Hello, world!`,
      });
    });
  });
});
