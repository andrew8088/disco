import { describe, it, expect } from "vitest";
import { getException } from "./test-utils";

import literal from "./literal";

describe("literal", () => {
  it.each([
    ["string", "string"],
    ["number", 42],
    ["boolean", true],
    ["null", null],
    ["undefined", undefined],
  ])("works for %p", (_type, value) => {
    expect(literal(value).parse(value)).toBe(value);
  });

  it("throws for other values", () => {
    const err = getException(() => literal("42").parse(42));
    expect(err.message).toBe('value `42` is not "42"');
  });

  it("mocks", () => {
    expect(literal("42").mock()).toBe("42");
    expect(literal(-10).mock()).toBe(-10);
    expect(literal(null).mock()).toBe(null);
  });
});
