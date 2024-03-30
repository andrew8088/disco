import { SchemaError } from "./utils";

export default function literal<T extends string | number | boolean | null | undefined>(t: T) {
  return {
    parse(value: unknown): T {
      if (value === t) {
        return value as never;
      }
      throw new SchemaError(`value \`${JSON.stringify(value)}\` is not ${JSON.stringify(t)}`);
    },
    mock() {
      return t;
    },
  };
}
