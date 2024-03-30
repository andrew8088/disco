import { describe, it, expect } from "vitest";
import * as p from ".";
import { getException } from "./test-utils";

describe("record", () => {
  const schema = p.record(p.string(), p.or([p.number(), p.boolean()]));

  it("works", () => {
    expect(schema.parse({ a: 1, b: true })).toEqual({ a: 1, b: true });
  });

  it("throws", () => {
    const err = getException(() => schema.parse({ b: "true" }));
    expect(err.errors).toHaveLength(2);
    expect(err.errors).toContain('value `"true"` is not a number');
    expect(err.errors).toContain('value `"true"` is not a boolean');
  });
});
