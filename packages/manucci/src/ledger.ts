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
  "account:updated": (account: Account) => void;
  "transaction:created": (transaction: Transaction) => void;
};

export class Ledger extends Hookable<LedgerHooks> {
  ledgerId: LedgerId;
  transactions: Transaction[] = [];
  accounts = new Map<string, Account>();

  constructor() {
    super();
    this.ledgerId = LedgerId();

    this.hook("transaction:created", async (transaction) => {
      // 1. store the transaction
      this.transactions.push(transaction);

      // 2. update the account balances
      const updatedAccounts = [];
      for (const entry of transaction.entries) {
        const account = this.#getAccountById(entry.accountId);
        if (!account) {
          throw new Error("Account not found for existing transaction");
        }
        account.balance += entry.value;
        updatedAccounts.push(account);
      }
      for (const account of updatedAccounts) {
        await this.callHook("account:updated", account);
      }
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
    return this.#getAccount(name).balance;
  }

  // ====== Hook handlers ======

  // ====== Utility functions ======
  #getAccount(name: string, { createIfNotExists } = { createIfNotExists: false }): Account {
    let account = this.accounts.get(name);

    if (!account) {
      if (!createIfNotExists) {
        throw new Error(`Account not found: ${name}`);
      }

      account = {
        accountId: AccountId(),
        name,
        balance: 0,
      };

      this.accounts.set(name, account);
      this.callHook("account:created", account);
    }

    return account;
  }
  #getAccountById(accountId: AccountId): Account {
    for (const account of this.accounts.values()) {
      if (account.accountId === accountId) {
        return account;
      }
    }
    throw new Error("Account not found");
  }

  #fromSimpleTransaction(transaction: SimpleTransaction): Transaction {
    return {
      ledgerId: this.ledgerId,
      transactionId: TransactionId(),
      entries: [
        {
          value: 0 - transaction.amount,
          accountId: this.#getAccount(transaction.from, { createIfNotExists: true }).accountId,
          note: transaction.note ?? "",
        },
        {
          value: transaction.amount,
          accountId: this.#getAccount(transaction.to, { createIfNotExists: true }).accountId,
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
            accountId: this.#getAccount(entry.from, { createIfNotExists: true }).accountId,
            note: entry.note ?? "",
          };
        } else {
          return {
            value: entry.amount,
            accountId: this.#getAccount(entry.to, { createIfNotExists: true }).accountId,
            note: entry.note ?? "",
          };
        }
      }),
      createdAt: new Date(),
    };
  }
}
