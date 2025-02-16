import { expectTypeOf, it } from "vitest";

import literal from "./literal";

it("returns literal types", () => {
  const result1 = literal("42").parse("42");
  expectTypeOf(result1).toEqualTypeOf<"42">();

  const result2 = literal(42).parse(42);
  expectTypeOf(result2).toEqualTypeOf<42>();

  const result3 = literal(false).parse(false);
  expectTypeOf(result3).toEqualTypeOf<false>();

  const result4 = literal(null).parse(null);
  expectTypeOf(result4).toEqualTypeOf<null>();

  const result5 = literal(undefined).parse(undefined);
  expectTypeOf(result5).toEqualTypeOf<undefined>();
});
