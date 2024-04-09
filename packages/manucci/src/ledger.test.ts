import { describe, expect, it } from "vitest";
import { Ledger } from "./ledger";
import { Account, Transaction } from "./manucci";
import { captureCallbackArgs } from "@disco/test-utils";

describe("manucci", () => {
  it("works for simple transactions", () => {
    const ledger = new Ledger();
    ledger.addTransaction({ from: "Alice", to: "Bob", amount: 100 });
    expect(ledger.getBalance("Alice")).toBe(-100);
    expect(ledger.getBalance("Bob")).toBe(100);
  });

  it("balances across multiple transactions", () => {
    const ledger = new Ledger();
    ledger.addTransaction({ from: "Alice", to: "Bob", amount: 100 });
    ledger.addTransaction({ from: "Alice", to: "Charlie", amount: 50 });
    expect(ledger.getBalance("Alice")).toBe(-150);
    expect(ledger.getBalance("Bob")).toBe(100);
    expect(ledger.getBalance("Charlie")).toBe(50);

    ledger.addTransaction({ from: "Bob", to: "Charlie", amount: 25 });
    expect(ledger.getBalance("Bob")).toBe(75);
    expect(ledger.getBalance("Charlie")).toBe(75);
  });

  it("handles complex transactions", () => {
    const ledger = new Ledger();
    ledger.addTransaction([
      { from: "Alice", amount: 100 },
      { to: "Bob", amount: 50 },
      { to: "Charlie", amount: 50 },
    ]);

    expect(ledger.getBalance("Alice")).toBe(-100);
    expect(ledger.getBalance("Bob")).toBe(50);
    expect(ledger.getBalance("Charlie")).toBe(50);
  });

  it("emits new account events", async () => {
    const ledger = new Ledger();

    const { callback, promise } = captureCallbackArgs<Account>((_, arr) => arr.length === 2);

    ledger.hook("account:create", callback);
    ledger.addTransaction({ from: "Alice", to: "Bob", amount: 100 });

    const accountNames = (await promise).map((a) => a.name);
    expect(accountNames).toContain("Alice");
    expect(accountNames).toContain("Bob");
  });

  it("emits new transaction events", async () => {
    const ledger = new Ledger();

    const { callback, promise } = captureCallbackArgs<Transaction>((_, arr) => arr.length === 2);

    ledger.hook("transaction:create", callback);
    ledger.addTransaction({ from: "Alice", to: "Bob", amount: 100 });
    ledger.addTransaction({ to: "Alice", from: "Bob", amount: 10 });

    const amounts = (await promise).flatMap((t) => t.entries.map((e) => e.value));
    expect(amounts).toContain(-100);
    expect(amounts).toContain(100);
    expect(amounts).toContain(-10);
    expect(amounts).toContain(10);
  });
});
