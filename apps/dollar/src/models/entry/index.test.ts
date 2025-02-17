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

  it("findByAccountId", () => {
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
    for (let i = 1; i <= 10; i++) {
      date.setDate(date.getDate() + i);
      EntryModel.create({
        date,
        description: "entry",
        amount: i,
        fromAccountId,
        toAccountId,
      });
    }

    const fromEntries = EntryModel.findByAccountId(fromAccountId);
    const toEntries = EntryModel.findByAccountId(toAccountId);

    expect(fromEntries).toHaveLength(10);
    expect(toEntries).toHaveLength(10);

    for (let i = 0; i < fromEntries.length - 1; i++) {
      expect(fromEntries[i].date.valueOf()).toBeLessThan(fromEntries[i + 1].date.valueOf());

      expect(toEntries[i].date.valueOf()).toBeLessThan(toEntries[i + 1].date.valueOf());
    }
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
        transactionId: 1,
      },
      toAccount: {
        id: toAccountId,
        name: "to",
        amount: 10,
        transactionId: 2,
      },
    });
  });

  it("completes", async () => {
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
    const entry = await EntryModel.complete(
      {},
      {
        getDate: () => date,
        getDescription: () => "test",
        getAmount: () => 10,
        getFromAccountId: () => fromAccountId,
        getToAccountId: () => toAccountId,
      },
    );

    expect(entry).toEqual({
      date,
      description: "test",
      amount: 10,
      fromAccountId,
      toAccountId,
    });
  });
});
