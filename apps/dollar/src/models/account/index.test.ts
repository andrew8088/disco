import { describe, expect, it } from "vitest";
import * as AccountQuery from "./query";

describe("AccountQuery", () => {
  it("inserts and finds", async () => {
    const id = AccountQuery.insert({
      name: "test account",
      description: "test",
      type: "asset",
    });

    const account = AccountQuery.findById(id);
    expect(account).toEqual({
      id,
      name: "test account",
      description: "test",
      type: "asset",
    });
  });
});
