import { it, expect, describe } from "vitest";
import { curry } from "./curry";

describe("curry", () => {
  it("should curry a function", () => {
    const add = (a: number, b: number, c: number) => a + b + c;

    const curriedAdd = curry(add);

    expect(curriedAdd(1)(2)(3)).toEqual(6);
  });
});
