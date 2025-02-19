import { simpleFaker as faker } from "@faker-js/faker";
import { SchemaError } from "./utils";

export default function coerceDate() {
  return {
    parse(value: unknown): Date {
      if (typeof value !== "string") {
        throw new SchemaError(
          `value \`${JSON.stringify(value)}\` is not a string and so cannot be coerced to a date`,
        );
      }
      if (!value.trim()) {
        throw new SchemaError(
          `value \`${JSON.stringify(value)}\` has length 0 and so cannot be coerced to a date`,
        );
      }

      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }

      throw new SchemaError(`value \`${JSON.stringify(value)}\` cannot be coerced to a date`);
    },
    mock() {
      return faker.date.anytime();
    },
  };
}
