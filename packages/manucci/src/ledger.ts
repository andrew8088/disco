import { AccountId, LedgerId, TransactionId } from "./id";
import { Transaction } from "./manucci";

type SimpleTransaction = {
  from: string;
  to: string;
  amount: number;
};

export class Ledger {
  ledgerId: LedgerId;
  transactions: Transaction[] = [];
  accounts = new Map<string, AccountId>();

  constructor() {
    this.ledgerId = LedgerId();
  }

  addTransaction(transaction: SimpleTransaction) {
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
    const id = this.accounts.get(name) || this.accounts.set(name, AccountId()).get(name);
    if (!id) throw new Error("Could not get account id");
    return id;
  }
}
