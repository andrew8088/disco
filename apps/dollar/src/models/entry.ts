import * as z from "@disco/parz";
import { getDb, Id } from "../database";
import { select, input } from "@inquirer/prompts";
import { parseAmount } from "../utils";
import * as Account from "./account";
import { calendar } from "../inquirer-calendar";
import { mustFind } from "@disco/common";

export function create(entry: Entry) {
  const journalEntryId = createJournalEntry(entry.date, entry.description);
  createTransactions(journalEntryId, entry.amount, entry.fromAccountId, entry.toAccountId);
}

export function createJournalEntry(date: Date, description: string) {
  const stmt = getDb().prepare("INSERT INTO journal_entries (date, description) VALUES (?, ?)");
  const result = stmt.run(date.toISOString(), description);
  return result.lastInsertRowid;
}

export function createTransactions(
  journalEntryId: Id,
  amount: number,
  fromAccountId: Id,
  toAccountId: Id,
) {
  const stmt = getDb().prepare(
    "INSERT INTO transactions (journal_entry_id, account_id, amount) VALUES (?, ?, ?)",
  );

  const fromTrxId = stmt.run(journalEntryId, fromAccountId, -1 * amount);
  const toTrxId = stmt.run(journalEntryId, toAccountId, amount);
  return { fromTrxId: fromTrxId.lastInsertRowid, toTrxId: toTrxId.lastInsertRowid };
}

const entryParser = z.object({
  fromAccountId: z.number(),
  toAccountId: z.or([z.number(), z.bigint()]),
  date: z.date(),
  description: z.string(),
  amount: z.number(),
});

type Entry = z.Infer<typeof entryParser>;

type PartialWith<T, N> = {
  [P in keyof T]?: T[P] | N;
};

export async function complete(entry: PartialWith<Entry, undefined | null>): Promise<Entry> {
  let { fromAccountId, toAccountId, date, description, amount } = entry;

  const accounts = Account.find();

  if (!fromAccountId) {
    const fromAccount = await select({
      message: "Select a `from` account",
      choices: Account.toChoices(accounts),
    });
    fromAccountId = fromAccount.id;
  } else {
    const fromAccount = mustFind(accounts, (a) => a.id === fromAccountId);
    console.log(`❯ cached from account: ${fromAccount.name}`);
  }

  if (!toAccountId) {
    const toAccount = await select({
      message: "Select a `to` account",
      choices: Account.toChoices(accounts),
    });
    toAccountId = toAccount.id;
  } else {
    const toAccount = mustFind(accounts, (a) => a.id === toAccountId);
    console.log(`❯ cached to account: ${toAccount.name}`);
  }

  if (!date) {
    date = await calendar({ message: "Select a date" });
  } else {
    console.log(`❯ cached date: ${date.toISOString()}`);
  }
  if (!description) {
    description = await input({ message: "Enter a description" });
  } else {
    console.log(`❯ cached description: ${description}`);
  }

  if (!amount) {
    amount = parseAmount(await input({ message: "Enter an amount (e.g. 10.00)" }));
  } else {
    console.log(`❯ cached amount: ${amount}`);
  }

  return { fromAccountId, toAccountId, date, description, amount };
}
