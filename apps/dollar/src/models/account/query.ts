import * as z from "@disco/parz";
import { Id, getDb } from "../../database";

type AccountInsert = {
  name: string;
  type: z.Infer<typeof accountTypeParser>;
  description?: string;
};

export function insert(data: AccountInsert) {
  const stmt = getDb().prepare("INSERT INTO accounts (name, type, description) VALUES (?, ?, ?)");
  const result = stmt.run(data.name, data.type, data.description);
  return result.lastInsertRowid;
}

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
  description: z.or([z.string(), z.literal(null)]),
});

export type AccountObject = z.Infer<typeof accountParser>;

export function findById(id: Id): AccountObject {
  const raw = getDb()
    .prepare("SELECT id, name, type, description FROM accounts WHERE id = ?")
    .get(id);
  return accountParser.parse(raw);
}
