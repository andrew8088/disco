import { describe, expect, it } from "vitest";
import { collection } from "./collection";

describe("Collection", () => {
  it("passes data from the reader to the transformer to the writer", async () => {
    const c = collection({
      async *reader() {
        yield {
          originalPath: "./post1.md",
          originalContent: "Hello, world!",
        };
      },
      async *transformer(items) {
        for await (const item of items) {
          yield item;
        }
      },
    });

    const out = await Array.fromAsync(
      c.build({
        srcDir: "",
        destDir: "",
      }),
    );

    expect(out[0]).toEqual({
      originalPath: "./post1.md",
      originalContent: "Hello, world!",
    });
  });
});
