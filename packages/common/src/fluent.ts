// Fluent interface - AKA chainable methods

import { pipe } from ".";

const handler = pipe((val: number) => new Date(val))
  .pipe((d) => d.toISOString())
  .pipe((s) => s.split("T"))
  .pipe((a) => ({ date: a[0], time: a[1] }));

export const out = handler(0);

export class QueryBuilder {
  private fields: string[] = [];
  private wheres: Record<string, string> = {};

  constructor(private table: string) {}

  select(...columns: string[]) {
    this.fields = columns;
    return this;
  }

  where(column: string, value: string) {
    this.wheres[column] = value;
    return this;
  }

  build() {
    return `SELECT ${this.fields.join(", ")} FROM ${this.table} WHERE ${Object.entries(this.wheres)
      .map(([k, v]) => `${k} = ${v}`)
      .join(" AND ")};`;
  }
}

export const query = new QueryBuilder("users").select("name", "email").where("id", "1").build();

export class QueryBuilder2<T extends object> {
  private fields: Array<keyof T> = [];
  private wheres: Partial<T> = {};

  constructor(private table: string) {}

  select(...columns: Array<keyof T>) {
    this.fields = columns;
    return this;
  }

  where<K extends keyof T>(column: K, value: T[K]) {
    this.wheres[column] = value;
    return this;
  }

  build() {
    return `SELECT ${this.fields.join(", ")} FROM ${this.table} WHERE ${Object.entries(this.wheres)
      .map(([k, v]) => `${k} = ${v}`)
      .join(" AND ")};`;
  }
}

type UserTable = {
  name: string;
  email: string;
  id: number;
};

export const query2 = new QueryBuilder2<UserTable>("users")
  .select("id", "name")
  .where("name", "andrew")
  .where("id", 1)
  .build();
