import { describe, expectTypeOf, it } from "vitest";

import array from "./array";
import number from "./number";
import or from "./or";
import string from "./string";

const schema = array(number());

describe("array types", () => {
  it("returns the expected type", () => {
    const result = schema.parse(null);
    expectTypeOf(result).toEqualTypeOf<number[]>();
  });

  it("works for nested arrays", () => {
    const schema = array(or([number(), string()]));
    const result = schema.parse(null);
    expectTypeOf(result).toEqualTypeOf<Array<number | string>>();
  });
});
