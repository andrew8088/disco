import Database from "better-sqlite3";

let _db: Database.Database | null = null;

export function getDb() {
  if (!_db) {
    const { DOLLAR_PATH, NODE_ENV } = process.env;
    if (!DOLLAR_PATH) {
      throw new Error("DOLLAR_PATH is not set");
    }
    _db = new Database(DOLLAR_PATH);

    if (NODE_ENV === "test") {
      _setup(_db);
    }
  }

  return _db;
}

export type Id = number | bigint;

function _setup(db: Database.Database) {
  db.exec(`
create table if not exists main.journal_entries
(
    id          INTEGER primary key autoincrement,
    date        TEXT default (datetime('now')) not null,
    description TEXT,
    notes       TEXT
);
      `);
}
