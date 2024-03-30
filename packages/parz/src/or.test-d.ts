import { it, expectTypeOf } from "vitest";

import literal from "./literal";
import or from "./or";

it("returns union types", () => {
  const result1 = or([literal("42"), literal(false)]).parse("42");
  expectTypeOf(result1).toEqualTypeOf<"42" | false>();
});
