import Sqlite from "better-sqlite3";
import { createErrorClass } from "@disco/common";

const [SqliteReaderError] = createErrorClass<{ query: string }>("SqliteReaderError");
const [NotFoundError] = createErrorClass("NotFoundError", SqliteReaderError);

export abstract class SqliteReader<To> {
  db: Sqlite.Database;

  #whereClauses: string[] = [];
  #whereValues: unknown[] = [];

  abstract tableName: string;
  abstract selectFields: string[];

  constructor(db: Sqlite.Database) {
    this.db = db;
  }

  abstract transform(rows: unknown[]): Promise<To[]>;

  async #select(): Promise<unknown[]> {
    const [, whereValues] = this.#getWhere();
    console.log(this.#getQuery());
    const stmt = this.db.prepare(this.#getQuery());
    return stmt.all(whereValues);
  }

  #getQuery(): string {
    const [whereClause] = this.#getWhere();
    return `SELECT ${this.selectFields.join(", ")} FROM ${this.tableName} ${whereClause};`;
  }

  #getWhere(): [string, unknown[]] {
    if (this.#whereClauses.length === 0) {
      return ["", []];
    }

    return ["WHERE " + this.#whereClauses.join(" AND "), this.#whereValues];
  }

  async findOne(): Promise<To> {
    const rows = await this.#select();

    if (rows.length === 0) {
      throw new NotFoundError("No rows found", { query: this.#getQuery() });
    }

    if (rows.length > 1) {
      throw new NotFoundError(`Too many rows found: ${rows.length} instead of 1`, { query: this.#getQuery() });
    }

    return (await this.transform([rows[0]]))[0];
  }

  async findMany(): Promise<To[]> {
    const rows = await this.#select();
    return this.transform(rows);
  }

  where(field: string, value: unknown): this {
    this.#whereClauses.push(`${field} = ?`);
    this.#whereValues.push(value);
    return this;
  }
}
