import { getExceptionSync } from "@disco/test-utils";
import { describe, expect, it } from "vitest";

import coerceDate from "./coerceDate";

describe("coerceDate", () => {
  it("works", () => {
    const d = coerceDate().parse("2025-01-01");
    expect(d.toISOString()).toBe("2025-01-01T00:00:00.000Z");
  });

  it("throws for non-date", () => {
    const err = getExceptionSync(() => coerceDate().parse("hello"));
    expect(err.message).toBe('value `"hello"` cannot be coerced to a date');
  });
  it("throws for non-string", () => {
    const err = getExceptionSync(() => coerceDate().parse(1));
    expect(err.message).toBe("value `1` is not a string and so cannot be coerced to a date");
  });
  it("throws for empty string", () => {
    const err = getExceptionSync(() => coerceDate().parse(""));
    expect(err.message).toBe('value `""` has length 0 and so cannot be coerced to a date');
  });
  it("mocks", () => {
    const mock = coerceDate().mock();
    expect(mock instanceof Date).toBe(true);
  });
});
