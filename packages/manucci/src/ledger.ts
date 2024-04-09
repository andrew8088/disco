import { Hookable } from "hookable";
import { AccountId, LedgerId, TransactionId } from "./id";
import { Transaction } from "./manucci";

type SimpleTransaction = {
  from: string;
  to: string;
  amount: number;
};

type ComplexTransaction = (
  | { from: string; amount: number }
  | {
      to: string;
      amount: number;
    }
)[];

export class Ledger extends Hookable {
  ledgerId: LedgerId;
  transactions: Transaction[] = [];
  accounts = new Map<string, AccountId>();

  constructor() {
    super();
    this.ledgerId = LedgerId();
  }

  addTransaction(transaction: SimpleTransaction | ComplexTransaction) {
    if (Array.isArray(transaction)) {
      const entries = transaction.map((entry) => {
        if ("from" in entry) {
          return {
            value: 0 - entry.amount,
            accountId: this.#getAccountId(entry.from),
            note: "",
          };
        } else {
          return {
            value: entry.amount,
            accountId: this.#getAccountId(entry.to),
            note: "",
          };
        }
      });

      this.transactions.push({
        ledgerId: this.ledgerId,
        transactionId: TransactionId(),
        entries,
        createdAt: new Date(),
      });
    } else {
      const entry1 = {
        value: 0 - transaction.amount,
        accountId: this.#getAccountId(transaction.from),
        note: "",
      };

      const entry2 = {
        value: transaction.amount,
        accountId: this.#getAccountId(transaction.to),
        note: "",
      };

      this.transactions.push({
        ledgerId: this.ledgerId,
        transactionId: TransactionId(),
        entries: [entry1, entry2],
        createdAt: new Date(),
      });
    }
    return this;
  }

  getBalance(name: string) {
    let bal = 0;

    for (const transaction of this.transactions) {
      for (const entry of transaction.entries) {
        if (entry.accountId === this.#getAccountId(name)) {
          bal += entry.value;
        }
      }
    }

    return bal;
  }

  #getAccountId(name: string) {
    const id = this.accounts.get(name);

    if (id) {
      return id;
    }

    const accountId = AccountId();
    this.accounts.set(name, accountId);

    this.callHook("account:create", {
      accountId,
      name,
    });

    return accountId;
  }
}
