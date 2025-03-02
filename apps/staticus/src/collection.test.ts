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
      writer(item) {
        out.push(item);
      },
    });

    await c.build();

    expect(out[0]).toEqual({
      originalPath: "./post1.md",
      originalContent: "Hello, world!",
    });
  });
});
