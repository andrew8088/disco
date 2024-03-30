import { describe, it, expect } from "vitest";
import { getException } from "./test-utils";

import boolean from "./boolean";

describe("boolean", () => {
  it("works", () => {
    expect(boolean().parse(false)).toBe(false);
  });

  it("throws for non-boolean", () => {
    const err = getException(() => boolean().parse("true"));
    expect(err.message).toBe('value `"true"` is not a boolean');
  });

  it("mocks", () => {
    const mock = boolean().mock();
    expect(typeof mock).toBe("boolean");
  });
});
