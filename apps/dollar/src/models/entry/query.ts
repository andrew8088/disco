import * as z from "@disco/parz";
import { Id, getDb } from "../../database";

type EntryInsert = {
  description: string;
  date: Date;
  notes?: string;
};

export function insert(data: EntryInsert) {
  const stmt = getDb().prepare(
    "INSERT INTO journal_entries (date, description, notes) VALUES (?, ?, ?)",
  );
  const result = stmt.run(data.date.toISOString(), data.description, data.notes);
  return result.lastInsertRowid;
}

const entryRowParser = z.object({
  id: z.or([z.number(), z.bigint()]),
  date: z.string(), // TODO write z.isoStrToDate()
  description: z.string(),
  notes: z.or([z.string(), z.literal(null)]),
});

export function findById(id: Id) {
  const entryStmt = getDb().prepare("SELECT * FROM journal_entries WHERE id = ?");
  const result = entryStmt.get(id);
  return entryRowParser.parse(result);
}
