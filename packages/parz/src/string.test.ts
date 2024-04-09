import { describe, it, expect } from "vitest";
import { getExceptionSync } from "@disco/test-utils";

import string from "./string";

describe("string", () => {
  it("works", () => {
    expect(string().parse("hello")).toBe("hello");
  });

  it("throws for non-string", () => {
    const err = getExceptionSync(() => string().parse(42));
    expect(err.message).toBe("value `42` is not a string");
  });

  it("mocks", () => {
    const mock = string().mock();
    expect(typeof mock).toBe("string");
  });
});
