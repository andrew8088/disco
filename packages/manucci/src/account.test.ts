import { rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { describe, expect, it, beforeEach } from "vitest";
import * as Account from "./account";
import Database, * as Sqlite from "better-sqlite3";
import { getException } from "@disco/test-utils";

describe("account", () => {
  let db: Sqlite.Database;
  let ids: Account.AccountId[];
  const filepath = join(tmpdir(), "account.sqlite3");

  beforeEach(() => {
    rmSync(filepath, { force: true });
    db = new Database(filepath);
    db.pragma("journal_mode = WAL");
    db.exec(Account.tableDefinition);
    ids = [];
    for (let i = 0; i < 2; i++) {
      const mock = Account.schema.mock();
      ids.push(mock.accountId);
      db.prepare(
        `INSERT INTO account (accountId, name, balance)
      VALUES (:accountId, :name, :balance)
      ON CONFLICT(accountId) DO UPDATE SET balance = balance + :balance;`,
      ).run(mock);
    }
  });

  it("reads many accounts", async () => {
    const reader = new Account.Reader(db);
    const accounts = await reader.findMany();
    expect(accounts).toHaveLength(2);
  });
  it("reads one account", async () => {
    const reader = new Account.Reader(db);
    const account = await reader.hasId(ids[0]).findOne();
    expect(account.accountId).toEqual(ids[0]);
  });

  it("throws NotFoundError when no rows found", async () => {
    const reader = new Account.Reader(db);
    const err = await getException(() => reader.hasId(Account.AccountId()).findOne());
    expect(err.type).toEqual("NotFoundError");
  });
  it("throws NotFoundError when too many rows found", async () => {
    const reader = new Account.Reader(db);
    const err = await getException(() => reader.findOne());
    expect(err.type).toEqual("TooManyFoundError");
  });
});
