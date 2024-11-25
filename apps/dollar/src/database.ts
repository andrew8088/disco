import Database from "better-sqlite3";
import * as z from "@disco/parz";

const { DOLLAR_PATH } = process.env;

if (!DOLLAR_PATH) {
  throw new Error("DOLLAR_PATH is not set");
}

const db = new Database(DOLLAR_PATH, { verbose: console.log });

export function findAccounts() {
  const raw = db.prepare("SELECT id, name FROM accounts").all();
  return accountParser.parse(raw);
}

const accountParser = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
  }),
);
