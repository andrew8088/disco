import { describe, it, expectTypeOf } from "vitest";
import * as p from ".";

describe("record types", () => {
  it("works", () => {
    const schema = p.record(p.string(), p.or([p.number(), p.boolean()]));

    expectTypeOf(schema.parse({})).toEqualTypeOf<Record<string, number | boolean>>();
  });
});
