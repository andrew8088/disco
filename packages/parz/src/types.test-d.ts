import { expectTypeOf, it } from "vitest";

import string from "./string";
import { Infer } from "./types";

it("infers", () => {
  const schema = string();
  expectTypeOf("testing").toEqualTypeOf<Infer<typeof schema>>();
});
