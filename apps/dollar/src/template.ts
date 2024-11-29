import * as z from "@disco/parz";
import { getDb } from "./database";
import { groupBy } from "../../../packages/common/dist";

const nullable = <T>(p: z.Parz<T>) => z.or([p, z.literal(null)]);

const templateParser = z.object({
  id: z.number(),
  name: z.string(),
  fromAccountId: nullable(z.number()),
  toAccountId: nullable(z.number()),
  description: nullable(z.string()),
  date: nullable(z.string()),
  amount: nullable(z.number()),
});

export type Template = z.Infer<typeof templateParser>;

export function find() {
  const raw = getDb()
    .prepare(
      "SELECT id, name, fromAccountId, toAccountId, description, date, amount FROM templates",
    )
    .all();
  const rows = z.array(templateParser).parse(raw);

  return Object.entries(groupBy(rows, (row) => String(row.id))).map(([id, rows]) => ({
    id,
    transactions: rows,
  }));
}
