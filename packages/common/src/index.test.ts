import { it, expect, describe } from "vitest";
import { deferred } from "./index";

describe("deferred", () => {
  it("resolves the promise", () => {
    expect.assertions(1);
    const { resolve, promise } = deferred();
    promise.then((value) => expect(value).toEqual(1));
    resolve(1);
  });

  it("rejects the promise", () => {
    expect.assertions(1);
    const { reject, promise } = deferred();
    promise.catch((value) => expect(value).toEqual(1));
    reject(1);
  });
});
