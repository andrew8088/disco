import { describe, expect, it } from "vitest";
import { Ledger } from "./ledger";

describe("manucci", () => {
  it("works", () => {
    const ledger = new Ledger();
    ledger.addTransaction({ from: "Alice", to: "Bob", amount: 100 });
    expect(ledger.getBalance("Alice")).toBe(-100);
    expect(ledger.getBalance("Bob")).toBe(100);
  });
});
