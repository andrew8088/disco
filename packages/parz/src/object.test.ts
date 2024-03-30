import { describe, it, expect } from "vitest";
import { getException } from "./test-utils";

import object from "./object";
import string from "./string";
import number from "./number";
import boolean from "./boolean";
import literal from "./literal";

describe("object", () => {
  const schema = object({
    age: number(),
    name: string(),
  });

  it("works", () => {
    expect(schema.parse({ name: "Deep Thought", age: 42 })).toEqual({
      name: "Deep Thought",
      age: 42,
    });
  });

  it("works with empty objects (and ignores extra keys)", () => {
    expect(
      object({}).parse({
        name: "Deep Thought",
        age: 42,
      }),
    ).toEqual({
      name: "Deep Thought",
      age: 42,
    });
  });

  it.each([["string"], [42], [true], [undefined], [null], [[]]])("throws for %p", (value) => {
    const err = getException(() => schema.parse(value));
    expect(err.errors[0]).toBe(`value \`${JSON.stringify(value)}\` is not an object`);
  });

  it("throws for object with missing key", () => {
    const err = getException(() => schema.parse({ name: "Deep Thought" }));
    expect(err.errors[0]).toBe("key `age` is missing");
  });

  it("throws for object with wrongly-typed key", () => {
    const err = getException(() => schema.parse({ name: "Deep Thought", age: "42" }));
    expect(err.errors[0]).toBe('key `age`: value `"42"` is not a number');
  });

  it("throws for object with multiple wrongly-typed keys", () => {
    const err = getException(() => schema.parse({ name: 42, age: "42" }));
    expect(err.errors).toHaveLength(2);
    expect(err.errors).toContain('key `age`: value `"42"` is not a number');
    expect(err.errors).toContain("key `name`: value `42` is not a string");
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

    expect(
      schema.parse({
        name: "Deep Thought",
        address: {
          number: 42,
          street: "Answer",
          onEarth: false,
        },
      }),
    ).toEqual({
      name: "Deep Thought",
      address: {
        number: 42,
        street: "Answer",
        onEarth: false,
      },
    });
  });

  it("throws for nested objects with missing key", () => {
    const schema = object({
      name: string(),
      address: object({
        number: number(),
        street: string(),
        onEarth: boolean(),
      }),
    });

    const err = getException(() =>
      schema.parse({
        name: "Deep Thought",
        address: {
          number: 42,
          street: "Answer",
        },
      }),
    );
    expect(err.errors[0]).toBe("key `address`: key `onEarth` is missing");
  });

  it("works with nested literal values", () => {
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

    const err = getException(() =>
      schema.parse({
        one: {
          two: {
            three: {
              four: {
                five: "43",
              },
            },
          },
        },
      }),
    );
    expect(err.errors[0]).toBe('key `one`: key `two`: key `three`: key `four`: key `five`: value `"43"` is not "42"');
  });

  it("mock", () => {
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

    expect(schema.mock()).toEqual({
      one: {
        two: {
          three: {
            four: {
              five: "42",
            },
          },
        },
      },
    });
  });
});
