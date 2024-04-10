import { Hookable } from "hookable";
import { AccountId, LedgerId, TransactionId } from "./id";
import { Account, Transaction } from "./manucci";

type SimpleTransaction = {
  from: string;
  to: string;
  amount: number;
  note?: string;
};

type ComplexTransaction = (
  | { from: string; amount: number; note?: string }
  | {
      to: string;
      amount: number;
      note?: string;
    }
)[];

type LedgerHooks = {
  "account:created": (account: Account) => void;
  "transaction:created": (transaction: Transaction) => void;
};

export class Ledger extends Hookable<LedgerHooks> {
  ledgerId: LedgerId;
  transactions: Transaction[] = [];
  accounts = new Map<string, AccountId>();

  constructor() {
    super();
    this.ledgerId = LedgerId();

    this.hook("transaction:created", (transaction) => {
      this.transactions.push(transaction);
    });
  }

  async addTransaction(transaction: SimpleTransaction | ComplexTransaction) {
    const trx = Array.isArray(transaction)
      ? this.#fromComplexTransaction(transaction)
      : this.#fromSimpleTransaction(transaction);

    await this.callHook("transaction:created", trx);
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

    this.callHook("account:created", {
      accountId,
      name,
    });

    return accountId;
  }

  #fromSimpleTransaction(transaction: SimpleTransaction): Transaction {
    return {
      ledgerId: this.ledgerId,
      transactionId: TransactionId(),
      entries: [
        {
          value: 0 - transaction.amount,
          accountId: this.#getAccountId(transaction.from),
          note: transaction.note ?? "",
        },
        {
          value: transaction.amount,
          accountId: this.#getAccountId(transaction.to),
          note: "",
        },
      ],
      createdAt: new Date(),
    };
  }

  #fromComplexTransaction(transaction: ComplexTransaction): Transaction {
    return {
      ledgerId: this.ledgerId,
      transactionId: TransactionId(),
      entries: transaction.map((entry) => {
        if ("from" in entry) {
          return {
            value: 0 - entry.amount,
            accountId: this.#getAccountId(entry.from),
            note: entry.note ?? "",
          };
        } else {
          return {
            value: entry.amount,
            accountId: this.#getAccountId(entry.to),
            note: entry.note ?? "",
          };
        }
      }),
      createdAt: new Date(),
    };
  }
}
