import { describe, expect, it } from "vitest";
import collection from "./collection";
import { BaseItem } from "./reader";

describe("Collection", () => {
  it("passes data from the reader to the transformer to the writer", async () => {
    const out: Array<BaseItem> = [];
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
      async writer(items) {
        out.push(...(await Array.fromAsync(items)));
      },
    });

    await c.build({
      srcDir: "",
      destDir: "",
    });

    expect(out[0]).toEqual({
      originalPath: "./post1.md",
      originalContent: "Hello, world!",
    });
  });
});
