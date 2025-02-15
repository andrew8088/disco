import * as z from "@disco/parz";
import { getDb, Id } from "../database";
import { select, input } from "@inquirer/prompts";
import { parseAmount } from "../utils";
import * as Account from "./account";
import { calendar } from "../inquirer-calendar";
import { groupBy, mustFind } from "@disco/common";

export function create(entry: BasicEntry) {
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

const basicEntryParser = z.object({
  fromAccountId: z.number(),
  toAccountId: z.or([z.number(), z.bigint()]),
  date: z.date(),
  description: z.string(),
  amount: z.number(),
});

export type BasicEntry = z.Infer<typeof basicEntryParser>;

type PartialWith<T, N> = {
  [P in keyof T]?: T[P] | N;
};

export async function complete(
  entry: PartialWith<BasicEntry, undefined | null>,
): Promise<BasicEntry> {
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

const reviewEntryParser = z.object({
  transaction_id: z.number(),
  journal_entry_id: z.number(),
  account_id: z.number(),
  account_name: z.string(),
  amount: z.number(),
  date: z.string(),
  description: z.string(),
});

const baseQuery = `
    SELECT t.id as transaction_id, journal_entry_id, account_id, a.name as account_name, amount, date, j.description
    FROM journal_entries j
    JOIN transactions t ON j.id = t.journal_entry_id
    JOIN accounts a ON t.account_id = a.id
`;

const whereAccountId = ` WHERE account_id = ?`;

export type FullEntry = {
  journal_entry_id: Id;
  date: Date;
  description: string;
  fromAccount: {
    account_id: Id;
    account_name: string;
    amount: number;
  };
  toAccount: {
    account_id: Id;
    account_name: string;
    amount: number;
  };
};

export function find(accountId?: Id): Array<FullEntry> {
  const stmt = getDb().prepare(baseQuery + (accountId ? whereAccountId : ""));
  const rows = z.array(reviewEntryParser).parse(accountId ? stmt.all(accountId) : stmt.all());
  const entries = groupBy(rows, (r) => String(r.journal_entry_id));

  return Object.values(entries).map((entries) => {
    const { journal_entry_id, date, description, ...fromAccount } = mustFind(
      entries,
      (e) => e.amount < 0,
    );
    const {
      journal_entry_id: _1,
      date: _2,
      description: _3,
      ...toAccount
    } = mustFind(entries, (e) => e.amount > 0);
    return { journal_entry_id, date: new Date(date), description, fromAccount, toAccount };
  });
}

export function update(id: Id, changes: Partial<BasicEntry>) {
  const stmt = getDb().prepare("UPDATE transactions SET account_id = ? WHERE id = ?");
  return stmt.run(changes.toAccountId, id);
}
