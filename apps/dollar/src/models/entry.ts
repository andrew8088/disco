import { groupBy, mustFind } from "@disco/common";
import * as z from "@disco/parz";
import { Id, getDb } from "../database";

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
    return {
      journal_entry_id,
      date: new Date(date),
      description,
      fromAccount,
      toAccount,
    };
  });
}

export function update(id: Id, changes: { toAccountId: Id }) {
  const stmt = getDb().prepare("UPDATE transactions SET account_id = ? WHERE id = ?");
  return stmt.run(changes.toAccountId, id);
}
