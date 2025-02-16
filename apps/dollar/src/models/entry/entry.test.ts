import { describe, expect, it } from "vitest";
import * as AccountQuery from "../account/query";
import * as EntryModel from "./model";
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

describe("EntryModel", () => {
  it("creates", async () => {
    const fromAccountId = AccountQuery.insert({
      name: "from",
      description: "from",
      type: "asset",
    });

    const toAccountId = AccountQuery.insert({
      name: "to",
      description: "to",
      type: "liability",
    });

    const date = new Date();
    const entry = EntryModel.create({
      date,
      description: "entry",
      amount: 10,
      fromAccountId,
      toAccountId,
    });

    expect(entry).toEqual({
      id: 1,
      description: "entry",
      date: date,
      fromAccount: {
        id: fromAccountId,
        name: "from",
        amount: -10,
      },
      toAccount: {
        id: toAccountId,
        name: "to",
        amount: 10,
      },
    });
  });
});
