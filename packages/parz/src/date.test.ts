import { describe, it, expect } from "vitest";
import { getExceptionSync } from "@disco/test-utils";

import date from "./date";

describe("date", () => {
  it("works", () => {
    const d = new Date();
    expect(date().parse(d)).toBe(d);
  });

  it("throws for non-date", () => {
    const err = getExceptionSync(() => date().parse("hello"));
    expect(err.message).toBe('value `"hello"` is not a date');
  });
  it("mocks", () => {
    const mock = date().mock();
    expect(mock instanceof Date).toBe(true);
  });
});
