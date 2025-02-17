import { groupBy } from "@disco/common";
import * as z from "@disco/parz";
import { Id, getDb } from "../../database";

const nullable = <T>(p: z.Parz<T>) => z.or([p, z.literal(null)]);

const templateRowParser = z.object({
  id: z.number(),
  name: z.string(),
  fromAccountId: nullable(z.number()),
  toAccountId: nullable(z.number()),
  description: nullable(z.string()),
  date: nullable(z.string()),
  amount: nullable(z.number()),
});

export type TemplateRow = z.Infer<typeof templateRowParser>;

export type TemplateObject = {
  id: string;
  name: string;
  transactions: Array<
    Partial<{
      date: Date;
      amount: number;
      fromAccountId: Id;
      toAccountId: Id;
      description: string;
    }>
  >;
};

export function findAll(): TemplateObject[] {
  const raw = getDb()
    .prepare(
      "SELECT id, name, fromAccountId, toAccountId, description, date, amount FROM templates",
    )
    .all();
  const rows = z.array(templateRowParser).parse(raw);

  return Object.entries(groupBy(rows, (row) => String(row.id))).map(([id, rows]) => ({
    id,
    name: rows[0].name,
    transactions: rows.map((r) => ({
      date: r.date ? new Date(r.date) : undefined,
      amount: r.amount || undefined,
      fromAccountId: r.fromAccountId || undefined,
      toAccountId: r.toAccountId || undefined,
      description: r.description || undefined,
    })),
  }));
}
