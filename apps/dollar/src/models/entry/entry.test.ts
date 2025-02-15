import { describe, expect, it } from "vitest";
import * as EntryQuery from "./query";

describe("EntryQuery", () => {
  it("inserts and finds", async () => {
    const date = new Date();
    const id = EntryQuery.insert({
      description: "test",
      date,
    });

    const entry = EntryQuery.findById(id);
    expect(entry).toEqual({
      id,
      date: date.toISOString(),
      description: "test",
      notes: null,
    });
  });
});
