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

export type Id = number | bigint;
