import { it, expectTypeOf } from "vitest";

import { Infer } from "./types";
import string from "./string";

it("infers", () => {
  const schema = string();
  expectTypeOf("testing").toEqualTypeOf<Infer<typeof schema>>();
});
