import * as z from "@disco/parz";
import { getDb } from "./database";
import { groupBy } from "../../../packages/common/dist";

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

export type Template = {
  id: string;
  name: string;
  transactions: Array<Omit<TemplateRow, "id" | "name" | "date"> & { date: Date | null }>;
};

export function find(): Template[] {
  const raw = getDb()
    .prepare(
      "SELECT id, name, fromAccountId, toAccountId, description, date, amount FROM templates",
    )
    .all();
  const rows = z.array(templateRowParser).parse(raw);

  return Object.entries(groupBy(rows, (row) => String(row.id))).map(([id, rows]) => ({
    id,
    name: rows[0].name,
    transactions: rows.map(({ id, name, date, ...rest }) => ({
      ...rest,
      date: date ? new Date(date) : null,
    })),
  }));
}

export function toChoices(templates: Template[]) {
  return templates.map((template) => ({
    name: template.name,
    value: template,
  }));
}
