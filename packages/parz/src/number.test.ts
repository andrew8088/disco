import { describe, it, expect } from "vitest";
import { getException } from "./test-utils";

import number from "./number";

describe("number", () => {
  it("works", () => {
    expect(number().parse(42)).toBe(42);
  });

  it("throws for non-number", () => {
    const err = getException(() => number().parse("hello"));
    expect(err.message).toBe('value `"hello"` is not a number');
  });
  it("mocks", () => {
    const mock = number().mock();
    expect(typeof mock).toBe("number");
  });
});
