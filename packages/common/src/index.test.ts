import { it, expect, describe } from "vitest";
import { deferred, pipe } from "./index";

describe("deferred", () => {
  it("resolves the promise", () => {
    expect.assertions(1);
    const { resolve, promise } = deferred();
    promise.then((value) => expect(value).toEqual(1));
    resolve(1);
  });

  it("rejects the promise", () => {
    expect.assertions(1);
    const { reject, promise } = deferred();
    promise.catch((value) => expect(value).toEqual(1));
    reject(1);
  });
});

describe("pipe", () => {
  it("works", () => {
    const x = pipe((n: number) => {
      if (n > 0) return "positive" as const;
      if (n < 0) return "negative" as const;
      return "zero" as const;
    })
      .pipe((s) => {
        switch (s) {
          case "positive":
            return 91;
          case "negative":
            return 82;
          default:
            throw "boom";
        }
      })
      .pipe((n) => n % 10);

    expect(x(20)).toBe(1);
    expect(() => x(0)).toThrowError("boom");
    expect(x(-20)).toBe(2);
  });
});
