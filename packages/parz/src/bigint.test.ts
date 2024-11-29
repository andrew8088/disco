import { describe, it, expect } from "vitest";
import { getExceptionSync } from "@disco/test-utils";

import bigint from "./bigint";

describe("bigint", () => {
  it("works", () => {
    expect(bigint().parse(42n)).toBe(42n);
  });

  it("throws for non-bigint", () => {
    const err = getExceptionSync(() => bigint().parse("hello"));
    expect(err.message).toBe('value `"hello"` is not a bigint');
  });
  it("mocks", () => {
    const mock = bigint().mock();
    expect(typeof mock).toBe("bigint");
  });
});
