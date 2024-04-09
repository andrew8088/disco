import { describe, expect, it } from "vitest";
import { Ledger } from "./ledger";
import { Account } from "./manucci";

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

    const p = new Promise<string[]>((resolve) => {
      const accountNames: string[] = [];

      ledger.hook("account:create", (account: Account) => {
        accountNames.push(account.name);

        if (accountNames.length === 2) {
          resolve(accountNames);
        }
      });
    });

    ledger.addTransaction({ from: "Alice", to: "Bob", amount: 100 });

    const accountNames = await p;

    expect(accountNames).toContain("Alice");
    expect(accountNames).toContain("Bob");
  });
});
