import { describe, expect, it, beforeEach } from "vitest";
import { Ledger, LedgerHooks } from "./ledger";
import { captureCallbackArgs } from "@disco/test-utils";

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

    const amounts = (await promise).flatMap((t) => t.entries.map((e) => e.value));
    expect(amounts).toContain(-100);
    expect(amounts).toContain(100);
    expect(amounts).toContain(-10);
    expect(amounts).toContain(10);
  });
});
