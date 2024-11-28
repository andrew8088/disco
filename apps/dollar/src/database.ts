import Database from "better-sqlite3";

let _db: Database.Database | null = null;

export function getDb() {
  if (!_db) {
    const { DOLLAR_PATH } = process.env;
    if (!DOLLAR_PATH) {
      throw new Error("DOLLAR_PATH is not set");
    }
    _db = new Database(DOLLAR_PATH);
  }

  return _db;
}

type Id = number | bigint;

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
