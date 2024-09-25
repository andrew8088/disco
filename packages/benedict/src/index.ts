import Database, * as Sqlite from "better-sqlite3";

type Transformer<T> = (input: unknown) => T;

export class Benedict {
  #db: Sqlite.Database;
  constructor(filepath: string) {
    this.#db = new Database(filepath);
    this.#db.pragma("journal_mode = WAL");
  }

  query<T>(query: string, transform: Transformer<T>): T {
    const stmt = this.#db.prepare(query);
    const result = stmt.all();
    return transform(result);
  }
}
