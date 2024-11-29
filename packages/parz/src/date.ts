import { simpleFaker as faker } from "@faker-js/faker";
import { SchemaError } from "./utils";

export default function date() {
  return {
    parse(value: unknown): Date {
      if (value instanceof Date) {
        return value;
      }
      throw new SchemaError(`value \`${JSON.stringify(value)}\` is not a date`);
    },
    mock() {
      return faker.date.anytime();
    },
  };
}
