import { it, expectTypeOf } from "vitest";

import object from "./object";
import string from "./string";
import and from "./and";

it("returns intersection types", () => {
  const hasNameSchema = object({ name: string() });
  const hasTitleSchema = object({ title: string() });

  const result1 = and([hasNameSchema, hasTitleSchema]).parse("42");
  expectTypeOf(result1).toEqualTypeOf<{ name: string; title: string }>();
});
