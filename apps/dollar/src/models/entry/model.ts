import { mustFind } from "@disco/common";
import { Id } from "../../database";
import * as AccountQuery from "../account/query";
import * as TransactionQuery from "../transaction/query";
import * as EntryQuery from "./query";

type CreateEntryData = {
  date: Date;
  description: string;
  amount: number;
  fromAccountId: Id;
  toAccountId: Id;
};

type JournalEntry = {
  id: Id;
  date: Date;
  description: string;
  fromAccount: {
    id: Id;
    name: string;
    amount: number;
    transactionId: Id;
  };
  toAccount: {
    id: Id;
    name: string;
    amount: number;
    transactionId: Id;
  };
};

export function create(data: CreateEntryData): JournalEntry {
  const journalEntryId = EntryQuery.insert({
    description: data.description,
    date: data.date,
  });

  TransactionQuery.insert({
    journalEntryId,
    accountId: data.fromAccountId,
    amount: data.amount * -1,
  });

  TransactionQuery.insert({
    journalEntryId,
    accountId: data.toAccountId,
    amount: data.amount,
  });

  const entry = EntryQuery.findById(journalEntryId);
  return hydrateAndRender(entry);
}

export function findAll(): JournalEntry[] {
  return EntryQuery.findAll().map(hydrateAndRender);
}

export function findByAccountId(accountId: Id): JournalEntry[] {
  return TransactionQuery.findByAccountId(accountId)
    .map((t) => {
      const entry = EntryQuery.findById(t.journal_entry_id);
      return hydrateAndRender(entry);
    })
    .toSorted((a, b) => a.date.getTime() - b.date.getTime());
}

export function calculateCurrentBalance(accountId: Id, entries: JournalEntry[]): number {
  let balance = 0;
  for (const entry of entries) {
    if (entry.fromAccount.id === accountId) {
      balance += entry.fromAccount.amount;
    } else {
      balance += entry.toAccount.amount;
    }
  }

  return balance;
}

type UserForm<T> = {
  [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K] | Promise<T[K]>;
};

export async function complete(
  partialEntry: Partial<CreateEntryData>,
  form: UserForm<CreateEntryData>,
): Promise<CreateEntryData> {
  let { fromAccountId, toAccountId, date, description, amount } = partialEntry;

  if (!fromAccountId) {
    fromAccountId = await form.getFromAccountId();
  }

  if (!toAccountId) {
    toAccountId = await form.getToAccountId();
  }

  if (!date) {
    date = await form.getDate();
  }
  if (!description) {
    description = await form.getDescription();
  }

  if (!amount) {
    amount = await form.getAmount();
  }

  return { fromAccountId, toAccountId, date, description, amount };
}

function hydrateAndRender(entry: EntryQuery.EntryObject): JournalEntry {
  const transactions = TransactionQuery.findByEntryId(entry.id);

  const fromAccountId = mustFind(transactions, (t) => t.amount < 0).account_id;
  const toAccountId = mustFind(transactions, (t) => t.amount > 0).account_id;

  const fromAccount = AccountQuery.findById(fromAccountId);
  const toAccount = AccountQuery.findById(toAccountId);

  return render(entry, transactions, fromAccount, toAccount);
}

function render(
  entry: EntryQuery.EntryObject,
  transactions: TransactionQuery.TransactionObject[],
  fromAccount: AccountQuery.AccountObject,
  toAccount: AccountQuery.AccountObject,
): JournalEntry {
  const fromTrx = mustFind(transactions, (t) => t.account_id === fromAccount.id);
  const toTrx = mustFind(transactions, (t) => t.account_id === toAccount.id);

  return {
    id: entry.id,
    date: new Date(entry.date),
    description: entry.description,
    fromAccount: {
      id: fromAccount.id,
      name: fromAccount.name,
      amount: fromTrx.amount,
      transactionId: fromTrx.id,
    },
    toAccount: {
      id: toAccount.id,
      name: toAccount.name,
      amount: toTrx.amount,
      transactionId: toTrx.id,
    },
  };
}
