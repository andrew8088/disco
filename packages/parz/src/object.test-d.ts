import { it, expectTypeOf } from "vitest";

import object from "./object";
import string from "./string";
import number from "./number";
import boolean from "./boolean";
import literal from "./literal";
import { Parz } from ".";

const schema = object({
  age: number(),
  name: string(),
});

it("returns the expected type", () => {
  const result = schema.parse({ name: "Deep Thought", age: 42 });
  expectTypeOf(result).toEqualTypeOf<{ name: string; age: number }>();
});

it("works for nested objects", () => {
  const schema = object({
    name: string(),
    address: object({
      number: number(),
      street: string(),
      onEarth: boolean(),
    }),
  });

  const result = schema.parse({
    name: "Deep Thought",
    address: {
      number: 42,
      street: "Answer",
      onEarth: false,
    },
  });

  expectTypeOf(result).toEqualTypeOf<{
    name: string;
    address: {
      number: number;
      street: string;
      onEarth: boolean;
    };
  }>();
});

it("mock strongly", () => {
  const schema = object({
    one: object({
      two: object({
        three: object({
          four: object({
            five: literal("42"),
          }),
        }),
      }),
    }),
  });

  expectTypeOf(schema.mock()).toEqualTypeOf<{
    one: {
      two: {
        three: {
          four: {
            five: "42";
          };
        };
      };
    };
  }>();
});

it("parses fields", () => {
  expectTypeOf(schema.field("name")).toEqualTypeOf<Parz<string>>();
});
