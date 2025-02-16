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

export function _setup(db: Database.Database) {
  db.exec(`
create table if not exists journal_entries
(
    id          INTEGER primary key autoincrement,
    date        TEXT default (datetime('now')) not null,
    description TEXT,
    notes       TEXT
);
      `);
  db.exec(`
create table if not exists accounts
(
    id          INTEGER primary key autoincrement,
    name        TEXT not null unique,
    type        text not null,
    description TEXT
);
`);

  db.exec(`
create table if not exists transactions
(
    id               INTEGER primary key autoincrement,
    journal_entry_id INTEGER not null references journal_entries(id),
    account_id       INTEGER not null references accounts(id),
    amount           REAL    not null
);
  `);

  db.exec(`
create table if not exists templates
(
    name          TEXT    not null,
    fromAccountId INTEGER,
    toAccountId   INTEGER,
    date          TEXT,
    description   TEXT,
    amount        REAL,
    id            integer not null
);
  `);
}

export function _reset(db: Database.Database) {
  db.exec(`drop table transactions`);
  db.exec(`drop table journal_entries;`);
  db.exec(`drop table accounts;`);
  db.exec(`drop table templates`);
}
