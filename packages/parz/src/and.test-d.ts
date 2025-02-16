import { expectTypeOf, it } from "vitest";

import and from "./and";
import object from "./object";
import string from "./string";

it("returns intersection types", () => {
  const hasNameSchema = object({ name: string() });
  const hasTitleSchema = object({ title: string() });

  const result1 = and([hasNameSchema, hasTitleSchema]).parse("42");
  expectTypeOf(result1).toEqualTypeOf<{ name: string; title: string }>();
});
