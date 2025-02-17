import { describe, expect, it } from "vitest";
import * as AccountQuery from "../account/query";
import * as EntryQuery from "../entry/query";
import * as TransactionQuery from "./query";

describe("TransactionQuery", () => {
  it("inserts and finds", async () => {
    const accountId = AccountQuery.insert({
      name: "test account",
      description: "test",
      type: "asset",
    });

    const journalEntryId = EntryQuery.insert({
      description: "",
      date: new Date(),
    });

    const id1 = TransactionQuery.insert({
      journalEntryId,
      accountId,
      amount: 3,
    });
    const id2 = TransactionQuery.insert({
      journalEntryId,
      accountId,
      amount: -3,
    });

    const entries = TransactionQuery.findByEntryId(journalEntryId);

    const entry1 = entries.find((e) => e.id === id1);
    expect(entry1).toEqual({
      id: id1,
      journal_entry_id: journalEntryId,
      account_id: accountId,
      amount: 3,
    });

    const entry2 = entries.find((e) => e.id === id2);
    expect(entry2).toEqual({
      id: id2,
      journal_entry_id: journalEntryId,
      account_id: accountId,
      amount: -3,
    });
  });
});
