import { describe, expect, it } from "vitest";
import { captureCallbackArgs } from ".";

describe("test-utils", () => {
  describe("captureCallbackArgs", () => {
    it("works", async () => {
      let count = 0;
      const e = captureCallbackArgs(1);
      const p = e.promise.then(() => count++);

      e.callback(1);
      await p;

      expect(count).toBe(1);
    });
  });
});
