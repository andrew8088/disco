import { SchemaError } from "./utils";

export default function number() {
  return {
    parse(value: unknown): number {
      if (typeof value === "number") {
        return value;
      }
      throw new SchemaError(`value \`${JSON.stringify(value)}\` is not a number`);
    },
    mock() {
      return faker.number.int();
    },
  };
}
