import { getExceptionSync } from "@disco/test-utils";
import { describe, expect, it } from "vitest";

import array from "./array";
import boolean from "./boolean";
import literal from "./literal";
import number from "./number";
import object from "./object";
import or from "./or";
import string from "./string";

describe("array", () => {
  const schema = array(or([literal("a"), literal("b")]));

  it("works", () => {
    expect(schema.parse(["a"])).toEqual(["a"]);
    expect(schema.parse(["b", "a"])).toEqual(["b", "a"]);
  });

  it("throws for non-arrays", () => {
    const err = getExceptionSync(() => schema.parse({}));
    expect(err.errors).toContain("value `{}` is not an array");
  });

  it("throws", () => {
    const err = getExceptionSync(() => schema.parse(["c"]));
    expect(err.errors).toContain('index `0`: value `"c"` is not "a"');
    expect(err.errors).toContain('index `0`: value `"c"` is not "b"');
  });

  it("throws complex", () => {
    const schema = array(
      or([
        object({
          name: string(),
          age: number(),
        }),
        array(boolean()),
      ]),
    );

    const err = getExceptionSync(() => schema.parse([{}, undefined]));
    expect(err.errors).toHaveLength(5);
    expect(err.errors).toContain("index `0`: key `name` is missing");
    expect(err.errors).toContain("index `0`: key `age` is missing");
    expect(err.errors).toContain("index `0`: value `{}` is not an array");
    expect(err.errors).toContain("index `1`: value `undefined` is not an object");
    expect(err.errors).toContain("index `1`: value `undefined` is not an array");
  });

  it("mock", () => {
    const schema = array(
      object({
        name: string(),
        age: number(),
      }),
    );

    const mock = schema.mock();
    expect(mock.length).toBeGreaterThan(0);

    for (const v of mock) {
      expect(typeof v.name).toEqual("string");
      expect(typeof v.age).toEqual("number");
    }
  });
});
