import * as z from "valibot";
import { describe, expect, it } from "vitest";
import * as transformers from "./transformers";

describe("transformers", () => {
  describe("yamlFrontMatter", () => {
    it("parses yaml front-matter out of the content", async () => {
      async function* files() {
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
        transformers.yamlFrontMatter(
          files(),
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
