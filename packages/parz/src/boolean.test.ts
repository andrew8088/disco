import { getExceptionSync } from "@disco/test-utils";
import { describe, expect, it } from "vitest";

import boolean from "./boolean";

describe("boolean", () => {
  it("works", () => {
    expect(boolean().parse(false)).toBe(false);
  });

  it("throws for non-boolean", () => {
    const err = getExceptionSync(() => boolean().parse("true"));
    expect(err.message).toBe('value `"true"` is not a boolean');
  });

  it("mocks", () => {
    const mock = boolean().mock();
    expect(typeof mock).toBe("boolean");
  });
});
