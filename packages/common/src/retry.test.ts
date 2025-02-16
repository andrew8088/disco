import { getException } from "@disco/test-utils";
import { describe, expect, it } from "vitest";
import { Retry } from "./retry";

describe("retry", () => {
  it("tries X times", async () => {
    const r = Retry.basic();

    const err = await getException(() =>
      r.run(() => {
        throw "oops";
      }),
    );

    expect(err?.message).toEqual("retry failed");
    expect(err?.cause).toEqual("oops");
  });
});
