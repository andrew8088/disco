import { getExceptionSync } from "@disco/test-utils";
import { describe, expect, it } from "vitest";

import and from "./and";
import number from "./number";
import object from "./object";
import string from "./string";

describe("and", () => {
  const hasNameSchema = object({ name: string() });
  const hasTitleSchema = object({ age: number() });
  const schema = and([hasNameSchema, hasTitleSchema]);

  it("works", () => {
    expect(schema.parse({ name: "Deep Thought", age: 42 })).toEqual({
      name: "Deep Thought",
      age: 42,
    });
  });

  it("throws", () => {
    const err = getExceptionSync(() => schema.parse({ age: "42" }));

    expect(err.errors).toHaveLength(2);
    expect(err.errors).toContain("key `name` is missing");
    expect(err.errors).toContain('key `age`: value `"42"` is not a number');
  });
});
