import { describe, it, expect } from "vitest";
import { getExceptionSync } from "@disco/test-utils";

import string from "./string";
import number from "./number";
import or from "./or";

describe("or", () => {
  const schema = or([string(), number()]);

  it("works", () => {
    expect(schema.parse("hello")).toBe("hello");
    expect(schema.parse(42)).toBe(42);
  });

  it("throws", () => {
    const err = getExceptionSync(() => schema.parse(true));

    expect(err.errors).toHaveLength(2);
    expect(err.errors).toContain("value `true` is not a string");
    expect(err.errors).toContain("value `true` is not a number");
  });
});
