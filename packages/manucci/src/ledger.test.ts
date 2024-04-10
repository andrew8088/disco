import { describe, expect, it, beforeEach } from "vitest";
import { Ledger, LedgerHooks } from "./ledger";
import { captureCallbackArgs } from "@disco/test-utils";
import { AccountId, EntryId, LedgerId, TransactionId } from "./id";

describe("manucci", () => {
  let ledger: Ledger;

  function eventPromise<E extends keyof LedgerHooks>(event: E, count = 2) {
    const e = captureCallbackArgs<LedgerHooks[E]>(count);
    ledger.hook(event, e.callback as never);
    return e.promise;
  }

  beforeEach(() => {
    ledger = new Ledger();
  });

  it("works for simple transactions", async () => {
    await ledger.addTransaction({ from: "Alice", to: "Bob", amount: 100 });
    expect(ledger.getBalance("Alice")).toBe(-100);
    expect(ledger.getBalance("Bob")).toBe(100);
  });

  it("balances across multiple transactions", async () => {
    await ledger.addTransaction({ from: "Alice", to: "Bob", amount: 100 });
    await ledger.addTransaction({ from: "Alice", to: "Charlie", amount: 50 });
    expect(ledger.getBalance("Alice")).toBe(-150);
    expect(ledger.getBalance("Bob")).toBe(100);
    expect(ledger.getBalance("Charlie")).toBe(50);

    await ledger.addTransaction({ from: "Bob", to: "Charlie", amount: 25 });
    expect(ledger.getBalance("Bob")).toBe(75);
    expect(ledger.getBalance("Charlie")).toBe(75);
  });

  it("handles complex transactions", async () => {
    const promise = eventPromise("account:updated", 3);

    await ledger.addTransaction([
      { from: "Alice", amount: 100 },
      { to: "Bob", amount: 50 },
      { to: "Charlie", amount: 50 },
    ]);

    const updatedAccounts = Object.fromEntries((await promise).map((a) => [a.name, a.balance]));

    expect(ledger.getBalance("Alice")).toBe(-100);
    expect(ledger.getBalance("Bob")).toBe(50);
    expect(ledger.getBalance("Charlie")).toBe(50);

    expect(updatedAccounts).toMatchObject({
      Alice: -100,
      Bob: 50,
      Charlie: 50,
    });
  });

  it("omits one account update event for a tranaction with multiple entries from one account", async () => {
    const promise = eventPromise("account:updated");

    await ledger.addTransaction([
      { from: "Alice", amount: 100 },
      { from: "Alice", amount: 50 },
      { to: "Bob", amount: 150 },
    ]);

    const updatedAccounts = Object.fromEntries((await promise).map((a) => [a.name, a.balance]));

    expect(updatedAccounts).toMatchObject({
      Alice: -150,
      Bob: 150,
    });
  });

  it("emits new account events", async () => {
    const promise = eventPromise("account:created");

    await ledger.addTransaction({ from: "Alice", to: "Bob", amount: 100 });

    const accountNames = (await promise).map((a) => a.name);
    expect(accountNames).toContain("Alice");
    expect(accountNames).toContain("Bob");
  });

  it("emits new transaction events", async () => {
    const promise = eventPromise("transaction:created");

    await ledger.addTransaction({ from: "Alice", to: "Bob", amount: 100 });
    await ledger.addTransaction({ to: "Alice", from: "Bob", amount: 10 });

    const amounts = (await promise).flatMap((t) => t.entries.map((e) => e.amount));
    expect(amounts).toContain(-100);
    expect(amounts).toContain(100);
    expect(amounts).toContain(-10);
    expect(amounts).toContain(10);
  });

  it("serializes accounts", async () => {
    await ledger.addTransaction({ from: "Alice", to: "Bob", amount: 100 });
    await ledger.addTransaction({ from: "Alice", to: "Charlie", amount: 50 });

    const accounts = ledger.serializeAccounts();
    expect(accounts).toMatchObject([
      { name: "Alice", balance: -150 },
      { name: "Bob", balance: 100 },
      { name: "Charlie", balance: 50 },
    ]);
  });

  it("serializes transactions", async () => {
    await ledger.addTransaction({ from: "Alice", to: "Bob", amount: 100 });
    await ledger.addTransaction({ from: "Alice", to: "Charlie", amount: 50 });

    const transactions = ledger.serializeTransactions();

    for (const trx of transactions) {
      expect(trx.createdAt).toBeInstanceOf(Date);
      expect(TransactionId.parse(trx.transactionId)).toBe(trx.transactionId);
      expect(LedgerId.parse(trx.ledgerId)).toBe(trx.ledgerId);
    }
  });

  it("serializes entries", async () => {
    const trx = await ledger.addTransaction({ from: "Alice", to: "Bob", amount: 100, note: "for pizza" });

    const accounts = ledger.serializeAccounts();
    const entries = ledger.serializeEntries();

    const aliceEntry = entries.find((e) => accounts.find((a) => a.accountId === e.accountId)?.name === "Alice");
    const bobEntry = entries.find((e) => accounts.find((a) => a.accountId === e.accountId)?.name === "Bob");

    for (const entry of entries) {
      expect(entry.transactionId).toBe(trx.transactionId);
      expect(EntryId.parse(entry.entryId)).toBe(entry.entryId);
      expect(AccountId.parse(entry.accountId)).toBe(entry.accountId);
      expect(TransactionId.parse(entry.transactionId)).toBe(entry.transactionId);
    }

    expect(aliceEntry).toMatchObject({ amount: -100, note: "for pizza" });
    expect(bobEntry).toMatchObject({ amount: 100 });
  });
});
