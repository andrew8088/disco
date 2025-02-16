import { getExceptionSync } from "@disco/test-utils";
import { describe, expect, it } from "vitest";

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
