import * as z from "@disco/parz";
import { Id, getDb, idParser } from "../../database";

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
  id: idParser,
  date: z.string(), // TODO write z.isoStrToDate()
  description: z.string(),
  notes: z.or([z.string(), z.literal(null)]),
});

export type EntryObject = z.Infer<typeof entryRowParser>;

export function findById(id: Id): EntryObject {
  const entryStmt = getDb().prepare("SELECT * FROM journal_entries WHERE id = ?");
  const result = entryStmt.get(id);
  return entryRowParser.parse(result);
}

export function findByIds(ids: Id[]): EntryObject[] {
  const result = getDb().prepare("SELECT * FROM journal_entries WHERE id in (?)").all(ids);
  return result.map((r) => entryRowParser.parse(r));
}

export function findAll(): EntryObject[] {
  const result = getDb().prepare("SELECT * FROM journal_entries").all();
  return result.map((r) => entryRowParser.parse(r));
}
