import { it, expectTypeOf } from "vitest";

import literal from "./literal";
import string from "./string";
import or from "./or";

it("returns union types", () => {
  const result1 = or([literal("42"), literal(false)]).parse("42");
  expectTypeOf(result1).toEqualTypeOf<"42" | false>();
});

it("works with null", () => {
  const result1 = or([string(), literal(null)]).parse("42");
  expectTypeOf(result1).toEqualTypeOf<string | null>();
});

it("works with undefined", () => {
  const result1 = or([string(), literal(undefined)]).parse("42");
  expectTypeOf(result1).toEqualTypeOf<string | undefined>();
});
