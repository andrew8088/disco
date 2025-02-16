import * as z from "@disco/parz";
import { Id, getDb } from "../../database";

type TransactionInsert = {
  journalEntryId: Id;
  accountId: Id;
  amount: number;
};

export function insert(data: TransactionInsert) {
  const stmt = getDb().prepare(
    "INSERT INTO transactions (journal_entry_id, account_id, amount) VALUES (?, ?, ?)",
  );
  const result = stmt.run(data.journalEntryId, data.accountId, data.amount);
  return result.lastInsertRowid;
}

const transactionRowParser = z.object({
  id: z.or([z.number(), z.bigint()]),
  journal_entry_id: z.number(),
  account_id: z.number(),
  amount: z.number(),
});

export function findByEntryId(entryId: Id) {
  const trxStmt = `SELECT * FROM transactions WHERE journal_entry_id = ?`;
  const result = getDb().prepare(trxStmt).all([entryId]);
  return result.map((row) => transactionRowParser.parse(row));
}
