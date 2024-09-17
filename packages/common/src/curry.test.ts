import { it, expect, describe } from "vitest";
import { curry } from "./curry";

function add(a: number, b: number, c: number) {
  return a + b + c;
}

describe("curry", () => {
  it.each([
    ["no args", curry(add)(1)(2)(3)],
    ["initial args", curry(add, [1])(2)(3)],
    ["all args", curry(add, [1, 2, 3])()],
  ])("should curry a function with %s", (_label, result) => {
    expect(result).toEqual(6);
  });
});
