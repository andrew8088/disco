import { getExceptionSync } from "@disco/test-utils";
import { describe, expect, it } from "vitest";

import number from "./number";
import or from "./or";
import string from "./string";

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
