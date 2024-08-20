import { simpleFaker as faker } from "@faker-js/faker";
import { SchemaError } from "./utils";

export default function string() {
  return {
    parse(value: unknown): string {
      if (typeof value === "string") {
        return value;
      }
      throw new SchemaError(`value \`${JSON.stringify(value)}\` is not a string`);
    },
    mock() {
      return faker.string.sample();
    },
  };
}
