import { describe, expect, it } from "vitest";
import collection from "./collection";

type T = { originalPath: string; originalContent: string };

describe("Collection", () => {
  it("passes data from the reader to the transformer to the writer", async () => {
    const out: Array<T> = [];
    const c = collection<T, T>({
      async *reader() {
        yield {
          originalPath: "./post1.md",
          originalContent: "Hello, world!",
        };
      },
      transformer(item) {
        return item;
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
