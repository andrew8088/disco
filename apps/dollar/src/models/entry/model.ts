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
  };
  toAccount: {
    id: Id;
    name: string;
    amount: number;
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

export function findByAccountId(accountId: Id): JournalEntry[] {
  return TransactionQuery.findByAccountId(accountId)
    .map((t) => {
      const entry = EntryQuery.findById(t.journal_entry_id);
      return hydrateAndRender(entry);
    })
    .toSorted((a, b) => a.date.getTime() - b.date.getTime());
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
    },
    toAccount: {
      id: toAccount.id,
      name: toAccount.name,
      amount: toTrx.amount,
    },
  };
}
