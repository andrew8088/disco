import * as z from "@disco/parz";

type ParzKeys<T extends z.ParzObject<Record<string, z.Parz<unknown>>>> =
  T extends z.ParzObject<infer R> ? keyof R : never;

type ParzValues<T extends z.ParzObject<Record<string, z.Parz<unknown>>>, K extends ParzKeys<T>> =
  T extends z.ParzObject<infer R> ? R[K] : never;

type Selectable<
  A extends string | number | symbol,
  B extends string,
  C extends string,
> = `${Extract<A, string>}.${B} as ${C}`;

export default class Selector<
  Tables extends { [tableName: string]: z.ParzObject<Record<string, z.Parz<unknown>>> },
  OutShape,
> {
  #tables: Tables;
  #outShape?: OutShape;
  #selections: string[];

  constructor(tables: Tables, outShape?: OutShape, selections: string[] = []) {
    this.#tables = tables;
    this.#outShape = outShape;
    this.#selections = selections;
  }

  table<T, N extends string, S extends z.ParzObject<Record<string, z.Parz<T>>>>(name: N, shape: S) {
    const newTables: Tables & { [X in N]: S } = {
      ...this.#tables,
      [name]: shape,
    } as never;

    return new Selector(newTables, this.#outShape, this.#selections);
  }

  field<K extends keyof Tables, F extends ParzKeys<Tables[K]>, T extends string>(table: K, field: F, rename: T) {
    const parser = this.#tables[table].field(field);
    const partial: OutShape & { [X in T]: ParzValues<Tables[K], F> } = { ...this.#outShape, [rename]: parser } as never;
    return new Selector(this.#tables, partial, this.#selections);
  }

  select<K extends keyof Tables, F extends ParzKeys<Tables[K]>, T extends string>(arg: Selectable<K, F, T>) {
    const [table, field, rename] = this.#parseParts(arg as never);

    const parser = this.#tables[table].field(field);
    const partial: OutShape & { [X in T]: ParzValues<Tables[K], F> } = { ...this.#outShape, [rename]: parser } as never;
    return new Selector(this.#tables, partial, [...this.#selections, arg]);
  }

  value() {
    if (!this.#outShape) throw "boom";
    return [z.object(this.#outShape), this.#toSqlQuery()] as const;
  }

  #parseParts<K extends keyof Tables, F extends ParzKeys<Tables[K]>, T extends string>(
    val: Selectable<K, F, T>,
  ): [K, F, T] {
    if (val.includes(" as ")) {
      const [tableAndColumn, field] = val.split(" as ");
      const [table, col] = tableAndColumn.split(".");
      return [table, col, field] as never;
    } else {
      const [table, col] = val.split(".");
      return [table, col, col] as never;
    }
  }

  #toSqlQuery() {
    return `SELECT ${this.#selections.join(", ")} FROM ${Object.keys(this.#tables).join(", ")}`;
  }
}
