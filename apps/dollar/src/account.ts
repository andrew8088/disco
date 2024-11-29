import * as z from "@disco/parz";
import { getDb } from "./database";

const accountTypeParser = z.or([
  z.literal("asset"),
  z.literal("expense"),
  z.literal("liability"),
  z.literal("income"),
  z.literal("placeholder"),
]);

const accountParser = z.object({
  id: z.number(),
  name: z.string(),
  type: accountTypeParser,
  description: z.string(),
});

export type Account = z.Infer<typeof accountParser>;
export type AccountType = z.Infer<typeof accountTypeParser>;

export function find() {
  const raw = getDb().prepare("SELECT id, name, type, description FROM accounts").all();
  return z.array(accountParser).parse(raw);
}

export function create(name: string, description: string, type: AccountType) {
  const db = getDb();
  const stmt = db.prepare("INSERT INTO accounts (name, type, description) VALUES (?, ?, ?)");
  const result = stmt.run(name, type, description);
  return result.lastInsertRowid;
}

export function sources(accounts: Account[]) {
  return accounts.filter(
    (a) => a.type === "asset" || a.type === "liability" || a.type === "placeholder",
  );
}

export function expenses(accounts: Account[]) {
  return accounts.filter((a) => a.type === "expense");
}

export function toChoices(accounts: Array<Account>) {
  return accounts.map((account) => ({
    name: account.name,
    value: account,
    description: account.description,
  }));
}