import { Hookable } from "hookable";
import { Account, AccountId } from "./account";
import { EntryId, LedgerId, TransactionId } from "./id";
import {
  ComplexTransactionCreatePayload,
  Entry,
  SimpleTransactionCreatePayload,
  Transaction,
  TransactionCreatePayload,
  TransactionRow,
} from "./types";

export type LedgerHooks = {
  "account:created": Account;
  "account:updated": Account;
  "transaction:created": Transaction;
};

export class Ledger extends Hookable<{ [K in keyof LedgerHooks]: (arg: LedgerHooks[K]) => void }> {
  ledgerId: LedgerId;
  #transactions: Transaction[] = [];
  #accounts = new Map<string, Account>();

  constructor() {
    super();
    this.ledgerId = LedgerId();

    this.hook("transaction:created", async (transaction) => {
      this.#onTransactionCreated(transaction);
    });
  }

  async addTransaction(transaction: TransactionCreatePayload) {
    const trx = Array.isArray(transaction)
      ? this.#fromComplexTransaction(transaction)
      : this.#fromSimpleTransaction(transaction);

    this.#transactions.push(trx);
    await this.callHook("transaction:created", trx);
    return trx;
  }

  getBalance(name: string) {
    return this.#getAccount(name).balance;
  }

  serializeAccounts() {
    return Array.from(this.#accounts.values());
  }

  serializeTransactions(): TransactionRow[] {
    return this.#transactions.map(({ entries, ...t }) => t);
  }

  serializeEntries() {
    return this.#transactions.flatMap((trx) => trx.entries);
  }

  // ====== Hook handlers ======
  async #onTransactionCreated(transaction: Transaction) {
    // 1. update the account balances
    const updatedAccounts = new Set<Account>();
    for (const entry of transaction.entries) {
      const account = this.#getAccountById(entry.accountId);
      account.balance += entry.amount;
      updatedAccounts.add(account);
    }
    for (const account of updatedAccounts) {
      await this.callHook("account:updated", account);
    }
  }

  // ====== Utility functions ======
  #getAccount(name: string, { createIfNotExists } = { createIfNotExists: false }): Account {
    let account = this.#accounts.get(name);

    if (!account) {
      if (!createIfNotExists) {
        throw new Error(`Account not found: ${name}`);
      }

      account = {
        accountId: AccountId(),
        name,
        balance: 0,
        createdAt: new Date(),
      };

      this.#accounts.set(name, account);
      this.callHook("account:created", account);
    }

    return account;
  }
  #getAccountById(accountId: AccountId): Account {
    for (const account of this.#accounts.values()) {
      if (account.accountId === accountId) {
        return account;
      }
    }
    throw new Error(`Account not found for ID: ${accountId}`);
  }

  #fromSimpleTransaction(transaction: SimpleTransactionCreatePayload): Transaction {
    const transactionId = TransactionId();
    return {
      ledgerId: this.ledgerId,
      transactionId,
      entries: [
        this.#toEntry(
          transactionId,
          transaction.from,
          0 - transaction.amount,
          transaction.note ?? "",
        ),
        this.#toEntry(transactionId, transaction.to, transaction.amount),
      ],
      createdAt: new Date(),
    };
  }

  #fromComplexTransaction(transaction: ComplexTransactionCreatePayload): Transaction {
    const transactionId = TransactionId();
    return {
      ledgerId: this.ledgerId,
      transactionId,
      entries: transaction.map((entry) => {
        if ("from" in entry) {
          return this.#toEntry(transactionId, entry.from, 0 - entry.amount, entry.note ?? "");
        } else {
          return this.#toEntry(transactionId, entry.to, entry.amount, entry.note ?? "");
        }
      }),
      createdAt: new Date(),
    };
  }

  #toEntry(transactionId: TransactionId, accountName: string, amount: number, note = ""): Entry {
    return {
      entryId: EntryId(),
      transactionId,
      amount,
      accountId: this.#getAccount(accountName, { createIfNotExists: true }).accountId,
      note,
    };
  }
}
